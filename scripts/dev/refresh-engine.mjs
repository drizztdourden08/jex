// DEV ONLY — keep the installed AI engine in sync with the source, doing the LEAST
// work needed. Three layers are compared:
//   source (packages/{ai-core,ai-contract,shared}/src + plugins/) → plugins/dist (built
//   zips + manifest) → the installed plugin under userData/ai-plugins/<id>/.
// Decisions:
//   • source newer than the built manifest  → rebuild the plugins (then reinstall)
//   • installed sha256 ≠ manifest sha256     → reinstall that plugin in place
//   • otherwise                              → do nothing (fast)
// Mirrors the host's install layout (ai-host/source.ts + install.ts): ai-plugins/<id>/
// is the extracted zip; a CUDA add-on's @node-llama-cpp backend is merged into its base.
// Models (userData/models) are never touched, so nothing is re-downloaded.
//
// Usage:  pnpm engine:refresh             staleness-driven build + reinstall
//         pnpm engine:refresh --force     rebuild + reinstall regardless of staleness
//         pnpm engine:refresh --no-build  reuse plugins/dist; only reinstall if stale
//         pnpm engine:refresh --base      install the base plugin if none is installed
//         pnpm engine:refresh --auto      used by `pnpm dev`: quiet, never fails the launch
//
// NOTE: a running engine locks its files. `pnpm dev` runs this BEFORE launch (safe);
// a manual run needs the app closed first.
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import extract from 'extract-zip'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(HERE, '..', '..')
const DIST_DIR = join(REPO_ROOT, 'plugins', 'dist')
const ARGV = process.argv.slice(2)
const FLAG = { auto: ARGV.includes('--auto'), force: ARGV.includes('--force'), noBuild: ARGV.includes('--no-build'), base: ARGV.includes('--base') }

// Source trees whose changes mean the built plugins are stale (node_modules/dist skipped).
const SOURCE_PATHS = [
  join(REPO_ROOT, 'packages', 'ai-core', 'src'),
  join(REPO_ROOT, 'packages', 'ai-contract', 'src'),
  join(REPO_ROOT, 'packages', 'shared', 'src'),
  join(REPO_ROOT, 'plugins'),
]
const SKIP_DIRS = new Set(['node_modules', 'dist', '.turbo', '.git'])

/** userData dir for the app (app.setName('Jex') pins it). Windows-first, with fallbacks. */
const userData = () => {
  const home = process.env.HOME || process.env.USERPROFILE || ''
  if (process.platform === 'win32') return join(process.env.APPDATA || join(home, 'AppData', 'Roaming'), 'Jex')
  if (process.platform === 'darwin') return join(home, 'Library', 'Application Support', 'Jex')
  return join(process.env.XDG_CONFIG_HOME || join(home, '.config'), 'Jex')
}
const pluginsRoot = () => join(userData(), 'ai-plugins')
const installedDir = (id) => join(pluginsRoot(), id)
const markerPath = (id) => join(installedDir(id), '.jex-installed.json')

/** Base plugin id for this machine — matches ai-host/resolve.ts. */
const baseId = () => (process.arch === 'arm64' ? 'ai-win-arm64' : 'ai-win-x64')

/** Newest mtime (ms) across the given files/dirs, skipping build output + vendor dirs. */
const walkMtime = (path) => {
  let st
  try {
    st = statSync(path)
  } catch {
    return 0
  }
  if (!st.isDirectory()) return st.mtimeMs
  let max = 0
  for (const name of readdirSync(path)) {
    if (SKIP_DIRS.has(name)) continue
    max = Math.max(max, walkMtime(join(path, name)))
  }
  return max
}
const newestSource = () => SOURCE_PATHS.reduce((m, p) => Math.max(m, walkMtime(p)), 0)
const manifestMtime = () => walkMtime(join(DIST_DIR, 'manifest.json'))

const buildPlugins = () => {
  console.log('▸ Building plugins → plugins/dist …')
  const pkg = join(REPO_ROOT, 'plugins')
  execFileSync(process.execPath, [join(pkg, 'build-plugins.mjs')], { cwd: pkg, stdio: 'inherit' })
}

const installedIds = () => {
  const root = pluginsRoot()
  if (!existsSync(root)) return []
  return readdirSync(root).filter((d) => {
    try {
      return statSync(join(root, d)).isDirectory()
    } catch {
      return false
    }
  })
}

const installedSha = (id) => {
  try {
    return JSON.parse(readFileSync(markerPath(id), 'utf8')).sha256
  } catch {
    return null
  }
}

const replaceOne = async (id, entry) => {
  const dest = installedDir(id)
  console.log(`▸ Reinstalling ${id} …`)
  try {
    rmSync(dest, { recursive: true, force: true })
  } catch (e) {
    if (e && (e.code === 'EPERM' || e.code === 'EBUSY' || e.code === 'ENOTEMPTY')) {
      throw new Error(
        `Can't replace ${id} — its files are locked (the app is running with the engine loaded). ` +
          'Close Jex / stop `pnpm dev` first, then re-run.',
      )
    }
    throw e
  }
  mkdirSync(dest, { recursive: true })
  await extract(join(DIST_DIR, entry.file), { dir: dest })
  writeFileSync(markerPath(id), JSON.stringify({ sha256: entry.sha256 }))
}

/** Re-merge a CUDA add-on's backend into its base (host's mergeAddOnInto). */
const remergeAddOn = (entry) => {
  const from = join(installedDir(entry.id), 'node_modules', '@node-llama-cpp')
  const to = join(installedDir(entry.requires), 'node_modules', '@node-llama-cpp')
  if (existsSync(from)) {
    console.log(`▸ Merging ${entry.id} backend → ${entry.requires} …`)
    cpSync(from, to, { recursive: true })
  }
}

const main = async () => {
  // 1) Rebuild only when the source is newer than the built manifest (or forced / no dist yet).
  const distMtime = manifestMtime()
  const srcNewer = newestSource() > distMtime
  if (!FLAG.noBuild && (FLAG.force || srcNewer || distMtime === 0)) buildPlugins()
  else console.log('▸ Plugins/dist is up to date with the source — skipping build.')

  const manifest = JSON.parse(readFileSync(join(DIST_DIR, 'manifest.json'), 'utf8'))
  const byId = new Map(manifest.plugins.map((p) => [p.id, p]))

  let ids = installedIds().filter((id) => byId.has(id))
  if (ids.length === 0) {
    if (!FLAG.base) {
      console.log('▸ No engine installed — nothing to refresh (install once via the app, or pass --base).')
      return
    }
    if (!byId.has(baseId())) throw new Error(`No base plugin "${baseId()}" in the manifest.`)
    ids = [baseId()]
  }

  // 2) Reinstall only the plugins whose installed sha256 no longer matches the manifest.
  const reinstalled = new Set()
  for (const id of ids) {
    const entry = byId.get(id)
    if (FLAG.force || installedSha(id) !== entry.sha256) {
      await replaceOne(id, entry)
      reinstalled.add(id)
    } else {
      console.log(`▸ ${id} already up to date.`)
    }
  }
  // 3) Re-merge a CUDA add-on if it (or its base) was reinstalled — reinstalling the base
  //    wipes the merged backend out of its node_modules.
  for (const id of ids) {
    const entry = byId.get(id)
    if (entry?.addOn && entry.requires && ids.includes(entry.requires) && (reinstalled.has(id) || reinstalled.has(entry.requires))) {
      remergeAddOn(entry)
    }
  }

  if (reinstalled.size === 0) console.log('✓ Engine already in sync — no reinstall needed.')
  else console.log(`✓ Engine refreshed — ${[...reinstalled].join(', ')}. Models untouched.`)
}

main().catch((e) => {
  const msg = e?.message ?? e
  // In --auto (run from `pnpm dev`) a refresh hiccup must NOT block the launch.
  if (FLAG.auto) {
    console.warn(`⚠ engine:refresh skipped — ${msg}`)
    process.exit(0)
  }
  console.error(`\n✗ ${msg}`)
  process.exit(1)
})

// Build the downloadable AI plugins. For each plugin in plugins.config.mjs:
//   1. esbuild-bundle @jex/ai-core's plugin-entry (inlines @jex/shared + the engine;
//      keeps node-llama-cpp + electron external — they're provided at runtime).
//   2. assemble the plugin's own node_modules: node-llama-cpp (minus the source-build
//      gitRelease.bundle) + the one @node-llama-cpp variant(s) it needs.
//   3. zip it, hash it (sha256), and collect a manifest entry.
// Finally write dist/manifest.json. Signatures (sig) are added by CI in P4.
//
// Usage: node build-plugins.mjs [pluginId ...]   (default: all)
//   e.g. node build-plugins.mjs ai-win-arm64

import esbuild from 'esbuild'
import archiver from 'archiver'
import { createHash, createPrivateKey, sign as edSign } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import { cpSync, mkdirSync, rmSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PLUGINS } from './plugins.config.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..')
const nodeModules = join(repoRoot, 'node_modules')
const entry = join(repoRoot, 'packages/ai-core/src/plugin-entry.ts')
const workRoot = join(here, '.work')
const distRoot = join(here, 'dist')

const appVersion = JSON.parse(readFileSync(join(repoRoot, 'apps/desktop/package.json'), 'utf8')).version
const apiVersion = 1

// Signing key (PKCS8 DER, base64): from $JEX_PLUGIN_PRIVATE_KEY (CI secret) or the
// gitignored local plugins/.signing-key.json. Absent → unsigned dev build (sig: '').
const loadSigningKey = () => {
  const fromEnv = process.env.JEX_PLUGIN_PRIVATE_KEY
  const localKey = join(here, '.signing-key.json')
  const b64 = fromEnv || (existsSync(localKey) ? JSON.parse(readFileSync(localKey, 'utf8')).privateKey : null)
  if (!b64) return null
  return createPrivateKey({ key: Buffer.from(b64, 'base64'), format: 'der', type: 'pkcs8' })
}
const signingKey = loadSigningKey()
const signSha = (shaHex) =>
  signingKey ? edSign(null, Buffer.from(shaHex), signingKey).toString('base64') : ''

const sha256 = (file) =>
  new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    createReadStream(file)
      .on('data', (d) => hash.update(d))
      .on('end', () => resolve(hash.digest('hex')))
      .on('error', reject)
  })

const zipDir = (dir, outFile) =>
  new Promise((resolve, reject) => {
    const out = createWriteStream(outFile)
    const archive = archiver('zip', { zlib: { level: 9 } })
    out.on('close', resolve)
    archive.on('error', reject)
    archive.pipe(out)
    archive.directory(dir, false)
    archive.finalize()
  })

// node-llama-cpp's gitRelease.bundle (~28 MB) is only for building from source — the
// plugin ships prebuilt binaries, so drop it.
const copyNlc = (dest) =>
  cpSync(join(nodeModules, 'node-llama-cpp'), dest, {
    recursive: true,
    filter: (src) => !src.includes('gitRelease.bundle'),
  })

// Resolve where `dep` actually lives when required from `fromDir`, the way Node does:
// walk up the node_modules chain, then fall back to the root node_modules. (pnpm nests
// some packages — e.g. node-llama-cpp/node_modules/ora — so a name-only root lookup misses
// their transitive deps.)
const findDepDir = (dep, fromDir) => {
  let dir = fromDir
  const marker = `${sep}node_modules${sep}`
  for (let i = 0; i < 30; i += 1) {
    const cand = join(dir, 'node_modules', dep)
    if (existsSync(join(cand, 'package.json'))) return cand
    const idx = dir.lastIndexOf(marker)
    if (idx === -1) break
    dir = dir.slice(0, idx)
  }
  const root = join(nodeModules, dep)
  return existsSync(join(root, 'package.json')) ? root : null
}

// Ship node-llama-cpp's full runtime dependency closure. copyNlc already copies its
// NESTED node_modules; here we add the HOISTED (root) deps the closure needs, flat at the
// plugin root — nested packages resolve up to there. Nesting (version conflicts) is
// preserved; we never overwrite a nested copy. @node-llama-cpp/* variants are excluded
// (added per-plugin). e.g. @huggingface/jinja (chat template), stdin-discarder (ora), …
const copyNlcDeps = (pluginNodeModules) => {
  const nlcDir = join(nodeModules, 'node-llama-cpp')
  const visited = new Set()
  const walk = (pkgDir) => {
    if (visited.has(pkgDir)) return
    visited.add(pkgDir)
    const pkgJson = join(pkgDir, 'package.json')
    if (!existsSync(pkgJson)) return
    const pkg = JSON.parse(readFileSync(pkgJson, 'utf8'))
    for (const dep of Object.keys({ ...pkg.dependencies, ...pkg.optionalDependencies })) {
      if (dep.startsWith('@node-llama-cpp/')) continue
      const depDir = findDepDir(dep, pkgDir)
      if (!depDir) continue
      // Hoisted (outside node-llama-cpp's own subtree) → ship at the plugin root.
      if (!depDir.startsWith(nlcDir + sep)) {
        const dest = join(pluginNodeModules, dep)
        if (!existsSync(dest)) cpSync(depDir, dest, { recursive: true })
      }
      walk(depDir)
    }
  }
  walk(nlcDir)
}

const buildOne = async (plugin) => {
  const work = join(workRoot, plugin.id)
  rmSync(work, { recursive: true, force: true })
  mkdirSync(work, { recursive: true })

  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    outfile: join(work, 'index.mjs'),
    external: ['node-llama-cpp', 'electron'],
    logLevel: 'warning',
  })

  writeFileSync(
    join(work, 'package.json'),
    JSON.stringify({ name: plugin.id, version: appVersion, type: 'module', main: 'index.mjs' }, null, 2),
  )

  copyNlc(join(work, 'node_modules', 'node-llama-cpp'))
  copyNlcDeps(join(work, 'node_modules'))
  for (const variant of plugin.variants) {
    cpSync(join(nodeModules, '@node-llama-cpp', variant), join(work, 'node_modules', '@node-llama-cpp', variant), {
      recursive: true,
    })
  }

  const zipFile = join(distRoot, `${plugin.id}.zip`)
  await zipDir(work, zipFile)
  const size = statSync(zipFile).size
  const digest = await sha256(zipFile)
  console.log(`  ${plugin.id}.zip — ${(size / 1024 / 1024).toFixed(1)} MB  sha256:${digest.slice(0, 12)}…`)

  return {
    id: plugin.id,
    arch: plugin.arch,
    backends: plugin.backends,
    file: `${plugin.id}.zip`,
    size,
    sha256: digest,
    sig: signSha(digest),
    ...(plugin.addOn ? { addOn: true, requires: plugin.requires } : {}),
  }
}

const run = async () => {
  const want = process.argv.slice(2)
  const targets = want.length ? PLUGINS.filter((p) => want.includes(p.id)) : PLUGINS
  if (!targets.length) {
    console.error(`No matching plugins. Known: ${PLUGINS.map((p) => p.id).join(', ')}`)
    process.exit(1)
  }
  mkdirSync(distRoot, { recursive: true })
  console.log(`Building ${targets.length} plugin(s) → plugins/dist/`)
  const entries = []
  for (const plugin of targets) {
    for (const variant of plugin.variants) {
      if (!existsSync(join(nodeModules, '@node-llama-cpp', variant))) {
        console.error(`  ✖ ${plugin.id}: missing @node-llama-cpp/${variant} in node_modules — skipped`)
        return
      }
    }
    entries.push(await buildOne(plugin))
  }

  // Merge into any existing manifest so partial local builds don't drop other entries.
  const manifestFile = join(distRoot, 'manifest.json')
  const prev = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, 'utf8')) : { plugins: [] }
  const byId = new Map((prev.plugins ?? []).map((p) => [p.id, p]))
  for (const e of entries) byId.set(e.id, e)
  const manifest = {
    apiVersion,
    appVersionRange: `>=${appVersion} <0.2.0`,
    generatedAt: new Date().toISOString(),
    plugins: [...byId.values()],
  }
  writeFileSync(manifestFile, JSON.stringify(manifest, null, 2))
  console.log(`Wrote ${manifestFile} (${manifest.plugins.length} plugin entries)`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

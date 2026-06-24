// Where plugins come from. Production: the app's own GitHub release ("latest"),
// fetched over HTTPS. Dev: set JEX_PLUGIN_DIST to a local plugins/dist dir (manifest +
// zips) to install without a release. Installed plugins live extracted under
// userData/ai-plugins/<id>/.
import { app } from 'electron'
import { join } from 'node:path'
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import type { PluginManifest } from '@jex/ai-contract'

const REPO = 'drizztdourden08/jex'
const RELEASE_BASE = `https://github.com/${REPO}/releases/latest/download`

const pluginsRoot = (): string => join(app.getPath('userData'), 'ai-plugins')
const installedDir = (id: string): string => join(pluginsRoot(), id)
const isInstalled = (id: string): boolean => existsSync(join(installedDir(id), 'index.mjs'))

// Local source of plugins (manifest + zips). Explicit override, else — in dev only —
// the repo's built plugins/dist (apps/desktop → ../../plugins/dist) so the checklist
// shows real sizes and installs work without a release. Packaged builds use the release.
const localDist = (): string | null => {
  if (process.env.JEX_PLUGIN_DIST) return process.env.JEX_PLUGIN_DIST
  if (!app.isPackaged) return join(app.getAppPath(), '..', '..', 'plugins', 'dist')
  return null
}

const fetchManifest = async (): Promise<PluginManifest> => {
  const dist = localDist()
  if (dist) return JSON.parse(readFileSync(join(dist, 'manifest.json'), 'utf8')) as PluginManifest
  const res = await fetch(`${RELEASE_BASE}/manifest.json`)
  if (!res.ok) throw new Error(`Could not fetch the plugin manifest (HTTP ${res.status}).`)
  return (await res.json()) as PluginManifest
}

const fetchZip = async (file: string, destPath: string): Promise<void> => {
  const dist = localDist()
  if (dist) {
    copyFileSync(join(dist, file), destPath)
    return
  }
  const res = await fetch(`${RELEASE_BASE}/${file}`)
  if (!res.ok) throw new Error(`Could not download ${file} (HTTP ${res.status}).`)
  writeFileSync(destPath, Buffer.from(await res.arrayBuffer()))
}

export { pluginsRoot, installedDir, isInstalled, fetchManifest, fetchZip, REPO }

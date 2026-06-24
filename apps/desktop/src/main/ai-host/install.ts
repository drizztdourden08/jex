// Install flow: download (or copy) each plugin zip, verify its Ed25519 signature
// against the embedded key, extract it under userData/ai-plugins/<id>/, then load the
// base engine. A verification failure aborts the install — an unverified plugin is
// never extracted into place or loaded.
import { app } from 'electron'
import { join } from 'node:path'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import extract from 'extract-zip'
import type { PluginManifest, UiDispatcher } from '@jex/ai-contract'
import { fetchManifest, fetchZip, installedDir } from './source'
import { verifyPluginZip } from './verify'
import { loadPluginFrom } from './loader'
import { basePluginId } from './resolve'

const installOne = async (
  id: string,
  manifest: PluginManifest,
  onProgress?: (msg: string) => void,
): Promise<void> => {
  const entry = manifest.plugins.find((p) => p.id === id)
  if (!entry) throw new Error(`Plugin "${id}" is not in the manifest.`)
  const tmpRoot = join(app.getPath('temp'), 'jex-plugins')
  mkdirSync(tmpRoot, { recursive: true })
  const zipPath = join(tmpRoot, entry.file)

  onProgress?.(`Downloading ${id}…`)
  await fetchZip(entry.file, zipPath)
  onProgress?.(`Verifying ${id}…`)
  if (!(await verifyPluginZip(zipPath, entry.sha256, entry.sig))) {
    throw new Error(`Signature/hash verification failed for ${id} — refusing to install.`)
  }
  onProgress?.(`Installing ${id}…`)
  const dest = installedDir(id)
  rmSync(dest, { recursive: true, force: true })
  mkdirSync(dest, { recursive: true })
  await extract(zipPath, { dir: dest })
}

// An add-on (CUDA) ships its own node_modules; merge its @node-llama-cpp backend(s)
// into the base plugin's node_modules so the base engine's node-llama-cpp resolves the
// extra backend (CUDA) alongside its built-in CPU+Vulkan.
const mergeAddOnInto = (baseId: string, addOnId: string): void => {
  const from = join(installedDir(addOnId), 'node_modules', '@node-llama-cpp')
  const to = join(installedDir(baseId), 'node_modules', '@node-llama-cpp')
  if (existsSync(from)) cpSync(from, to, { recursive: true })
}

// Install the given plugin ids (base [+ CUDA add-on]), merge any add-on backends into
// the base, then load the base engine.
const installEngine = async (
  ids: string[],
  ui: UiDispatcher,
  onProgress?: (msg: string) => void,
): Promise<void> => {
  const manifest = await fetchManifest()
  for (const id of ids) await installOne(id, manifest, onProgress)
  for (const id of ids) {
    const entry = manifest.plugins.find((p) => p.id === id)
    if (entry?.addOn && entry.requires) {
      onProgress?.(`Enabling ${id}…`)
      mergeAddOnInto(entry.requires, id)
    }
  }
  onProgress?.('Loading engine…')
  await loadPluginFrom(installedDir(basePluginId()), ui)
}

export { installEngine }

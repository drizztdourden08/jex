// Remove an installed add-on (the CUDA backend): strip its merged @node-llama-cpp packages
// from the base plugin, then delete its own folder. If a native file is locked (the backend
// is loaded) what can go is removed, a pending-removal marker is written and the rest is
// finished at the next start, before the engine loads.
// Paths are built only from pluginsRoot() + a catalog add-on id; nothing comes from the renderer.
import { join } from 'node:path'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { installedDir, pluginsRoot } from './source'
import { basePluginId } from './resolve'
import { isAddOnId } from './catalog'
import { logAi } from './ai-log'

type RemoveResult = 'removed' | 'after-restart'
type PendingRemoval = { id: string; packages: string[] }

const SAFE = /^[a-z0-9][a-z0-9.-]*$/
const markerPath = (): string => join(pluginsRoot(), '.pending-removal.json')
const nodeLlamaDir = (pluginId: string): string => join(installedDir(pluginId), 'node_modules', '@node-llama-cpp')

const packagesOf = (id: string): string[] => {
  const dir = nodeLlamaDir(id)
  return existsSync(dir) ? readdirSync(dir).filter((n) => SAFE.test(n)) : []
}

// Returns true when everything is gone, false when a locked file kept something.
const purge = ({ id, packages }: PendingRemoval): boolean => {
  const opts = { recursive: true, force: true, maxRetries: 3, retryDelay: 200 } as const
  let clean = true
  for (const name of packages.filter((n) => SAFE.test(n))) {
    try {
      rmSync(join(nodeLlamaDir(basePluginId()), name), opts)
    } catch {
      clean = false
    }
  }
  try {
    rmSync(installedDir(id), opts)
  } catch {
    clean = false
  }
  return clean
}

const removeAddOn = (id: string): RemoveResult => {
  if (!SAFE.test(id) || !isAddOnId(id)) throw new Error(`"${id}" is not a removable add-on.`)
  const entry: PendingRemoval = { id, packages: packagesOf(id) }
  if (purge(entry)) {
    logAi(`removed add-on ${id}`)
    return 'removed'
  }
  mkdirSync(pluginsRoot(), { recursive: true })
  writeFileSync(markerPath(), JSON.stringify(entry))
  logAi(`add-on ${id} partly locked: removal finishes after restart`)
  return 'after-restart'
}

// At startup, before any engine loads: finish a removal that a locked file blocked.
const applyPendingRemoval = (): void => {
  if (!existsSync(markerPath())) return
  try {
    const entry = JSON.parse(readFileSync(markerPath(), 'utf8')) as PendingRemoval
    if (isAddOnId(entry.id) && purge(entry)) {
      rmSync(markerPath(), { force: true })
      logAi(`pending removal of ${entry.id} applied`)
    }
  } catch (e) {
    logAi(`pending removal failed: ${e instanceof Error ? e.message : e}`)
  }
}

export { removeAddOn, applyPendingRemoval }
export type { RemoveResult }

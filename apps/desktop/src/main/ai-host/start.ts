// Startup load: try each installed engine candidate in order, falling back when one
// fails; plugins that fail the apiVersion check are marked stale and re-installed in the
// background through the verified install flow (they were user-installed before).
import type { UiDispatcher } from '@jex/ai-contract'
import { ApiVersionError } from './api-version'
import { loadPluginFrom } from './loader'
import { installedDir, isInstalled } from './source'
import { basePluginId, cudaPluginId, ENGINE_PLUGIN_ID } from './resolve'
import { markStale, setLoadedId, staleIds } from './engine-state'

const loadFirstUsable = async (ui: UiDispatcher): Promise<void> => {
  for (const id of [basePluginId(), ENGINE_PLUGIN_ID].filter(isInstalled)) {
    try {
      await loadPluginFrom(installedDir(id), ui)
      setLoadedId(id)
      console.log(`[ai-host] loaded engine: ${id}`)
      return
    } catch (e) {
      if (e instanceof ApiVersionError) markStale(id)
      console.error(`[ai-host] failed to load ${id}:`, e)
    }
  }
}

// The CUDA add-on is never loaded on its own; it is outdated whenever its base is.
const staleWithAddOn = (): string[] => {
  const cuda = cudaPluginId()
  if (cuda && staleIds().includes(basePluginId()) && isInstalled(cuda)) markStale(cuda)
  return staleIds()
}

const startEngine = async (
  ui: UiDispatcher,
  update: (ids: string[]) => Promise<void>,
): Promise<void> => {
  await loadFirstUsable(ui)
  const ids = staleWithAddOn()
  if (ids.length === 0) return
  console.log(`[ai-host] updating outdated plugins: ${ids.join(', ')}`)
  await update(ids).catch((e) => console.error('[ai-host] plugin auto-update failed:', e))
}

export { startEngine }

// Startup load: bring installed plugins up to date, then load the first usable engine
// candidate. Two staleness sources feed the same verified install flow (progress goes out
// on ai:engineProgress): a manifest sha256 that differs from the install record (checked
// before loading, so no engine file is locked), and an apiVersion failure at load.
import type { UiDispatcher } from '@jex/ai-contract'
import { ApiVersionError } from './api-version'
import { loadPluginFrom } from './loader'
import { fetchManifest, installedDir, isInstalled } from './source'
import { isOutdated } from './installed-record'
import { basePluginId, cudaPluginId, ENGINE_PLUGIN_ID } from './resolve'
import { clearStale, getLoadedId, markStale, setLoadedId, staleIds } from './engine-state'

const MANIFEST_TIMEOUT_MS = 5000

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

// Engine-side changes (new tools) ship without an apiVersion bump, so compare each
// installed plugin's recorded sha256 with the published manifest. Offline/slow: skip.
const markOutdated = async (): Promise<void> => {
  try {
    const manifest = await fetchManifest(MANIFEST_TIMEOUT_MS)
    const ids = [basePluginId(), cudaPluginId(), ENGINE_PLUGIN_ID].filter(
      (id): id is string => !!id && isInstalled(id),
    )
    ids.filter((id) => isOutdated(id, manifest)).forEach(markStale)
  } catch (e) {
    console.log(`[ai-host] update check skipped: ${e instanceof Error ? e.message : e}`)
  }
}

// One attempt per id per start; a failure is logged and the installed engine still loads.
const runUpdate = async (ids: string[], update: (ids: string[]) => Promise<void>): Promise<void> => {
  console.log(`[ai-host] updating outdated plugins: ${ids.join(', ')}`)
  await update(ids).catch((e) => console.error('[ai-host] plugin auto-update failed:', e))
  clearStale(ids)
}

const startEngine = async (
  ui: UiDispatcher,
  update: (ids: string[]) => Promise<void>,
): Promise<void> => {
  await markOutdated()
  const outdated = staleWithAddOn()
  // Update first (installEngine also loads the fresh engine, so no engine file is locked).
  if (outdated.length > 0) await runUpdate(outdated, update)
  if (!getLoadedId()) await loadFirstUsable(ui)
  const ids = staleWithAddOn()
  if (ids.length > 0) await runUpdate(ids, update)
}

export { startEngine }

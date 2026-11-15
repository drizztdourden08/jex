// Startup load: bring installed plugins up to date, then load the first usable engine
// candidate. Two staleness sources feed the same verified install flow (progress goes out
// on ai:engineProgress): a manifest sha256 that differs from the install record (checked
// before loading, so no engine file is locked), and an apiVersion failure at load.
import type { UiDispatcher } from '@jex/ai-contract'
import { ApiVersionError } from './api-version'
import { loadPluginFrom } from './loader'
import { installedDir, isInstalled } from './source'
import { basePluginId, ENGINE_PLUGIN_ID } from './resolve'
import { checkOutdated } from './update-check'
import { retryInBackground } from './background-retry'
import { clearPending, hasPending } from './pending-update'
import { applyPendingRemoval } from './remove-plugin'
import { logAi } from './ai-log'
import { clearStale, getLoadedId, markStale, setLoadedId, staleIds } from './engine-state'

const STARTUP_TIMEOUT_MS = 15_000
const PENDING_TIMEOUT_MS = 60_000

const loadFirstUsable = async (ui: UiDispatcher): Promise<void> => {
  for (const id of [basePluginId(), ENGINE_PLUGIN_ID].filter(isInstalled)) {
    try {
      await loadPluginFrom(installedDir(id), ui)
      setLoadedId(id)
      logAi(`loaded engine: ${id}`)
      return
    } catch (e) {
      if (e instanceof ApiVersionError) markStale(id)
      logAi(`failed to load ${id}: ${e instanceof Error ? e.message : e}`)
    }
  }
}

// One attempt per id per start; a failure is logged and the installed engine still loads.
const runUpdate = async (ids: string[], update: (ids: string[]) => Promise<void>): Promise<void> => {
  logAi(`download start: ${ids.join(', ')}`)
  await update(ids)
    .then(() => logAi(`download finish: ${ids.join(', ')}`))
    .catch((e) => logAi(`download failed: ${e instanceof Error ? e.message : e}`))
  clearStale(ids)
}

const startEngine = async (
  ui: UiDispatcher,
  update: (ids: string[]) => Promise<void>,
): Promise<void> => {
  applyPendingRemoval()
  // A pending marker (found by the background retry) earns the manifest a longer wait.
  const pending = hasPending()
  const { ok, ids: found } = await checkOutdated(pending ? PENDING_TIMEOUT_MS : STARTUP_TIMEOUT_MS)
  found.forEach(markStale)
  // Update first (installEngine also loads the fresh engine, so no engine file is locked).
  // The CUDA add-on is never auto-updated; installEngine re-merges it into a new base.
  const outdated = staleIds()
  if (outdated.length > 0) await runUpdate(outdated, update)
  if (pending && ok) clearPending()
  if (!getLoadedId()) await loadFirstUsable(ui)
  if (!ok) void retryInBackground()
  const rest = staleIds()
  if (rest.length > 0) await runUpdate(rest, update)
}

export { startEngine }

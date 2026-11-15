// Manifest check: which installed plugins (base, ai-engine) differ from the published
// manifest. The CUDA add-on is never part of an automatic update (305 MB).
import { fetchManifest, isInstalled } from './source'
import { isOutdated } from './installed-record'
import { basePluginId, ENGINE_PLUGIN_ID } from './resolve'
import { logAi } from './ai-log'

type CheckResult = { ok: boolean; ids: string[] }

const checkOutdated = async (timeoutMs: number): Promise<CheckResult> => {
  try {
    const manifest = await fetchManifest(timeoutMs)
    const ids = [basePluginId(), ENGINE_PLUGIN_ID].filter((id) => isInstalled(id) && isOutdated(id, manifest))
    logAi(`update check ok (timeout ${timeoutMs} ms): outdated = ${ids.join(', ') || 'none'}`)
    return { ok: true, ids }
  } catch (e) {
    logAi(`update check skipped (timeout ${timeoutMs} ms): ${e instanceof Error ? e.message : e}`)
    return { ok: false, ids: [] }
  }
}

export { checkOutdated }
export type { CheckResult }

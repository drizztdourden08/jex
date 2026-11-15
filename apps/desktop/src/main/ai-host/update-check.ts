// Manifest check: which installed plugins (base, ai-engine) differ from the published
// manifest. The CUDA add-on is never part of an automatic update (305 MB).
import { fetchManifest, isInstalled } from './source'
import { isOutdated } from './installed-record'
import { basePluginId, ENGINE_PLUGIN_ID } from './resolve'
import { logAi } from './ai-log'

type CheckResult = { ok: boolean; ids: string[] }
type LastCheck = { at: string; ok: boolean; detail: string; published: Record<string, string> }

let last: LastCheck | null = null
const getLastCheck = (): LastCheck | null => last

const checkOutdated = async (timeoutMs: number): Promise<CheckResult> => {
  try {
    const manifest = await fetchManifest(timeoutMs)
    const ids = [basePluginId(), ENGINE_PLUGIN_ID].filter((id) => isInstalled(id) && isOutdated(id, manifest))
    last = {
      at: new Date().toISOString(),
      ok: true,
      detail: ids.length ? `Outdated: ${ids.join(', ')}` : 'Up to date',
      published: Object.fromEntries(manifest.plugins.map((x) => [x.id, x.sha256])),
    }
    logAi(`update check ok (timeout ${timeoutMs} ms): outdated = ${ids.join(', ') || 'none'}`)
    return { ok: true, ids }
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e)
    last = { at: new Date().toISOString(), ok: false, detail: `Check failed: ${reason}`, published: last?.published ?? {} }
    logAi(`update check skipped (timeout ${timeoutMs} ms): ${reason}`)
    return { ok: false, ids: [] }
  }
}

export { checkOutdated, getLastCheck }
export type { CheckResult, LastCheck }

// Troubleshooting helpers behind the Settings engine block: what is installed vs published,
// the last update check, a forced reinstall (applied at the next start, before any native
// file is loaded) and the log file.
import { shell } from 'electron'
import type { EngineDiagnostics } from '@shared/ai'
import { isInstalled } from './source'
import { readRecordSha } from './installed-record'
import { basePluginId, cudaPluginId, ENGINE_PLUGIN_ID } from './resolve'
import { checkOutdated, getLastCheck } from './update-check'
import { hasPending, writePending } from './pending-update'
import { logAi, logPath } from './ai-log'

const CHECK_TIMEOUT_MS = 60_000

const short = (sha: string | null | undefined): string | null => (sha ? sha.slice(0, 10) : null)

const engineDiagnostics = (): EngineDiagnostics => {
  const last = getLastCheck()
  const ids = [ENGINE_PLUGIN_ID, basePluginId(), cudaPluginId()].filter((id): id is string => !!id && isInstalled(id))
  return {
    plugins: ids.map((id) => {
      const installed = readRecordSha(id)
      const published = last?.published[id] ?? null
      return {
        id,
        installedSha: short(installed),
        publishedSha: short(published),
        outdated: !!published && installed !== published,
      }
    }),
    lastCheck: last ? { at: last.at, ok: last.ok, detail: last.detail } : null,
    pendingRestart: hasPending(),
  }
}

const checkUpdatesNow = async (): Promise<EngineDiagnostics> => {
  await checkOutdated(CHECK_TIMEOUT_MS)
  return engineDiagnostics()
}

// Re-download the base and ai-engine (never the add-on) at the next start.
const requestReinstall = (): void => {
  writePending([basePluginId(), ENGINE_PLUGIN_ID].filter(isInstalled), true)
}

const openLog = async (): Promise<string> => {
  logAi('log opened from Settings')
  return shell.openPath(logPath())
}

export { engineDiagnostics, checkUpdatesNow, requestReinstall, openLog }

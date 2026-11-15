// Marker for an update found by the background retry: userData/ai-plugins/.pending-update.json
// lists the outdated plugin ids so the next start waits longer for the manifest and applies it.
import { join } from 'node:path'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { pluginsRoot } from './source'
import { logAi } from './ai-log'

const markerPath = (): string => join(pluginsRoot(), '.pending-update.json')

const writePending = (ids: string[], force = false): void => {
  mkdirSync(pluginsRoot(), { recursive: true })
  writeFileSync(markerPath(), JSON.stringify({ ids, force }))
  logAi(`pending-update marker written: ${ids.join(', ')}${force ? ' (forced reinstall)' : ''}`)
}

const hasPending = (): boolean => existsSync(markerPath())

// Ids a forced reinstall asked for (empty for a plain update marker).
const forcedIds = (): string[] => {
  try {
    const m = JSON.parse(readFileSync(markerPath(), 'utf8')) as { ids?: string[]; force?: boolean }
    return m.force && Array.isArray(m.ids) ? m.ids : []
  } catch {
    return []
  }
}

const clearPending = (): void => {
  if (!hasPending()) return
  rmSync(markerPath(), { force: true })
  logAi('pending-update marker applied and removed')
}

export { writePending, hasPending, clearPending, forcedIds }

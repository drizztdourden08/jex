// Marker for an update found by the background retry: userData/ai-plugins/.pending-update.json
// lists the outdated plugin ids so the next start waits longer for the manifest and applies it.
import { join } from 'node:path'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { pluginsRoot } from './source'
import { logAi } from './ai-log'

const markerPath = (): string => join(pluginsRoot(), '.pending-update.json')

const writePending = (ids: string[]): void => {
  mkdirSync(pluginsRoot(), { recursive: true })
  writeFileSync(markerPath(), JSON.stringify({ ids }))
  logAi(`pending-update marker written: ${ids.join(', ')}`)
}

const hasPending = (): boolean => existsSync(markerPath())

const clearPending = (): void => {
  if (!hasPending()) return
  rmSync(markerPath(), { force: true })
  logAi('pending-update marker applied and removed')
}

export { writePending, hasPending, clearPending }

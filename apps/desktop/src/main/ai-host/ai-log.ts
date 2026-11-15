// Small production log for ai-host update decisions: userData/logs/ai-host.log, one
// timestamped line each, truncated when over 1 MB. Never receives secrets.
import { app } from 'electron'
import { join } from 'node:path'
import { appendFileSync, mkdirSync, statSync, writeFileSync } from 'node:fs'

const MAX_BYTES = 1024 * 1024

const logPath = (): string => join(app.getPath('userData'), 'logs', 'ai-host.log')

const logAi = (message: string): void => {
  try {
    const file = logPath()
    mkdirSync(join(app.getPath('userData'), 'logs'), { recursive: true })
    try {
      if (statSync(file).size > MAX_BYTES) writeFileSync(file, '')
    } catch {
      // no log yet
    }
    appendFileSync(file, `${new Date().toISOString()} ${message}\n`)
  } catch {
    // logging must never break the update flow
  }
  console.log(`[ai-host] ${message}`)
}

export { logAi, logPath }

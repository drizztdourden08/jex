import { existsSync, readFileSync, renameSync } from 'node:fs'
import type { Database as SqlDatabase, SqlJsStatic } from 'sql.js'

/**
 * Open the mirror file, or start empty when it is missing or unreadable. A damaged
 * file (e.g. zero-filled by an OS crash mid-write) is moved aside to
 * `library.db.corrupt-<ts>` instead of failing startup: the mirror is rebuilt from
 * Steam by the next sync, and the bad bytes stay on disk for inspection.
 */
const isHealthy = (d: SqlDatabase): boolean => {
  try {
    return d.exec('PRAGMA quick_check')[0]?.values[0]?.[0] === 'ok'
  } catch {
    return false
  }
}

const openDbFile = (SQL: SqlJsStatic, file: string): SqlDatabase => {
  if (!existsSync(file)) return new SQL.Database()
  const d = new SQL.Database(readFileSync(file))
  if (isHealthy(d)) return d
  d.close()
  const aside = `${file}.corrupt-${Date.now()}`
  renameSync(file, aside)
  console.error(`[db] library.db is unreadable — moved to ${aside}; starting a fresh mirror`)
  return new SQL.Database()
}

export { openDbFile }

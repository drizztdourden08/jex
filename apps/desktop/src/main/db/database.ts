import { app } from 'electron'
import { join, dirname } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import initSqlJs, { type Database as SqlDatabase } from 'sql.js'

/**
 * The local library mirror — real SQLite via sql.js (WASM), stored as a single
 * file in AppData. WASM (not a native module) so it builds on any machine with
 * no C++ toolchain. The DB lives in memory; we persist the exported bytes to
 * disk after writes. The renderer loads the set into memory and runs the
 * FilterSpec engine; all writes happen here in main.
 */
let _db: SqlDatabase | null = null
let _file = ''

const db = (): SqlDatabase => {
  if (!_db) throw new Error('Database not initialized — call initDb() first.')
  return _db
}

/** Flush the in-memory DB to disk. Call after any write batch. */
const persist = (): void => {
  if (_db && _file) writeFileSync(_file, Buffer.from(_db.export()))
}

type Params = Record<string, unknown> | unknown[]

/** Query helper → array of row objects. */
const all = <T = Record<string, unknown>>(sql: string, params: Params = []): T[] => {
  const stmt = db().prepare(sql)
  try {
    stmt.bind(params as never)
    const rows: T[] = []
    while (stmt.step()) rows.push(stmt.getAsObject() as T)
    return rows
  } finally {
    stmt.free()
  }
}

const get = <T = Record<string, unknown>>(sql: string, params: Params = []): T | undefined => {
  return all<T>(sql, params)[0]
}

const run = (sql: string, params: Params = []): void => {
  db().run(sql, params as never)
}

const migrate = (d: SqlDatabase): void => {
  d.run(`
    CREATE TABLE IF NOT EXISTS games (
      appid INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      installed INTEGER NOT NULL DEFAULT 0,
      installDir TEXT, sizeOnDisk INTEGER, lastUpdated INTEGER, libraryFolder TEXT,
      hasLocalArt INTEGER NOT NULL DEFAULT 0,
      owned INTEGER NOT NULL DEFAULT 0,
      playtimeForever INTEGER NOT NULL DEFAULT 0,
      playtime2weeks INTEGER NOT NULL DEFAULT 0,
      lastPlayed INTEGER, iconHash TEXT,
      type TEXT, isFree INTEGER, shortDescription TEXT,
      developers TEXT, publishers TEXT, genres TEXT, categories TEXT, tags TEXT,
      releaseDate TEXT, releaseYear INTEGER, metacritic INTEGER, reviewTotal INTEGER,
      platforms TEXT, controllerSupport TEXT, media TEXT,
      rich TEXT,
      wishlisted INTEGER NOT NULL DEFAULT 0,
      wishlistPriority INTEGER, wishlistDate INTEGER,
      enrichment TEXT NOT NULL DEFAULT 'owned-only',
      enrichedAt INTEGER, updatedAt INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_games_installed ON games(installed);
    CREATE INDEX IF NOT EXISTS idx_games_enrichment ON games(enrichment);
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS wishlist_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      filterSpec TEXT,            -- JSON FilterSpec, or NULL for a manual-only group
      manualAppids TEXT NOT NULL DEFAULT '[]', -- JSON number[]
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );
  `)
  // Additive migrations for pre-existing DBs (each guarded — a no-op if present).
  const cols = (d.exec('PRAGMA table_info(games)')[0]?.values ?? []).map((r) => String(r[1]))
  if (!cols.includes('rich')) d.run('ALTER TABLE games ADD COLUMN rich TEXT')
  if (!cols.includes('wishlisted'))
    d.run('ALTER TABLE games ADD COLUMN wishlisted INTEGER NOT NULL DEFAULT 0')
  if (!cols.includes('wishlistPriority'))
    d.run('ALTER TABLE games ADD COLUMN wishlistPriority INTEGER')
  if (!cols.includes('wishlistDate')) d.run('ALTER TABLE games ADD COLUMN wishlistDate INTEGER')
  // Index created after the column is guaranteed to exist (the CREATE TABLE above
  // is a no-op on pre-existing DBs, so the column may have just been ALTERed in).
  d.run('CREATE INDEX IF NOT EXISTS idx_games_wishlisted ON games(wishlisted)')
}

const setMeta = (key: string, value: unknown, flush = true): void => {
  run('INSERT INTO meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [
    key,
    JSON.stringify(value),
  ])
  if (flush) persist() // skip the (heavy) sql.js export when the caller batches its own persist
}

const getMeta = <T>(key: string): T | null => {
  const row = get<{ value: string }>('SELECT value FROM meta WHERE key=?', [key])
  if (!row) return null
  try {
    return JSON.parse(row.value) as T
  } catch {
    return null
  }
}

const initDb = async (): Promise<void> => {
  if (_db) return
  const require = createRequire(import.meta.url)
  const wasmDir = dirname(require.resolve('sql.js')) // …/sql.js/dist
  const SQL = await initSqlJs({ locateFile: () => join(wasmDir, 'sql-wasm.wasm') })
  _file = join(app.getPath('userData'), 'library.db')
  _db = existsSync(_file) ? new SQL.Database(readFileSync(_file)) : new SQL.Database()
  migrate(_db)
  persist()
}

export { initDb, db, persist, all, get, run, setMeta, getMeta }

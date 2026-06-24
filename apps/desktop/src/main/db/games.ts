import type { Game, LibraryStats } from '@shared/library'
import { all, get, getMeta, persist, run } from './database'
import { rowToGame } from './row-mapper'
import type { Row } from './row-mapper'

const getAllGames = (): Game[] => {
  return all<Row>('SELECT * FROM games').map(rowToGame)
}

/**
 * Insert a bare "discovered" row for a catalog appid we don't have yet (from the
 * Search tab) so it can be enriched + cached like any other game. owned/installed
 * stay 0, so it's naturally excluded from the Library/Wishlist views (which filter
 * on those). No-op if the appid already exists — provenance is never clobbered.
 */
const ensureStub = (appid: number, name?: string): void => {
  run(
    `INSERT INTO games (appid, name, updatedAt) VALUES (@appid, @name, @now)
     ON CONFLICT(appid) DO NOTHING`,
    { '@appid': appid, '@name': name && name.trim() ? name : `App ${appid}`, '@now': Date.now() },
  )
  persist()
}

const getGame = (appid: number): Game | null => {
  const r = get<Row>('SELECT * FROM games WHERE appid=?', [appid])
  return r ? rowToGame(r) : null
}

const gameCount = (): number => {
  return get<{ n: number }>('SELECT COUNT(*) AS n FROM games')?.n ?? 0
}

const getStats = (): LibraryStats => {
  const r = get<{
    total: number
    installed: number
    owned: number
    enriched: number
    pending: number
    noStorePage: number
  }>(`
    SELECT COUNT(*) AS total,
      COALESCE(SUM(installed), 0) AS installed,
      COALESCE(SUM(owned), 0) AS owned,
      COALESCE(SUM(CASE WHEN enrichment = 'enriched' THEN 1 ELSE 0 END), 0) AS enriched,
      COALESCE(SUM(CASE WHEN enrichment IN ('owned-only','failed') THEN 1 ELSE 0 END), 0) AS pending,
      COALESCE(SUM(CASE WHEN enrichment = 'no-store-page' THEN 1 ELSE 0 END), 0) AS noStorePage
    FROM games
  `)
  return {
    total: r?.total ?? 0,
    installed: r?.installed ?? 0,
    owned: r?.owned ?? 0,
    enriched: r?.enriched ?? 0,
    pending: r?.pending ?? 0,
    noStorePage: r?.noStorePage ?? 0,
    lastEnrich: getMeta<number>('lastEnrich'),
    lastOwnedSync: getMeta<number>('lastOwnedSync'),
  }
}

export { getAllGames, ensureStub, getGame, gameCount, getStats }
export { syncInstalled, upsertOwned } from './games-owned'
export { markWishlisted, reconcileWishlist } from './games-wishlist'
export {
  mergeMetadata,
  mergePatch,
  dropAllMetadata,
  requeueStale,
  markEnrichFailed,
  markNoStorePage,
  getUnenrichedAppids,
} from './games-metadata'

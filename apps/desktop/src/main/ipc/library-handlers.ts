import { ipcMain } from 'electron'
import { detectSteam } from '../steam/detect'
import { dropAllMetadata, getAllGames, getGame, getStats } from '../db/games'
import { scanLocal } from '../library/scan'
import {
  cancelEnrich,
  enrichLibrary,
  getSyncState,
  detailCore,
  detailExtras,
  ensureGame,
  refreshOne,
  runFullSync,
  setActiveContext,
  syncOwned,
} from '../library/sync'
import type { ActiveContext } from '../library/scheduler'

/** Steam detection + the local SQLite library mirror (read API + sync triggers). */
const registerLibraryHandlers = (): void => {
  // ── Steam detection + local library mirror ──────────────────────────────
  ipcMain.handle('steam:detect', () => detectSteam())
  ipcMain.handle('library:scanLocal', () => scanLocal())
  ipcMain.handle('library:getAll', () => getAllGames())
  ipcMain.handle('library:get', (_e, appid: number) => getGame(appid))
  ipcMain.handle('library:stats', () => getStats())
  ipcMain.handle('library:refresh', (_e, appid: number) => refreshOne(appid))
  // Open a catalog appid (from Search): cache a discovered stub if new, then enrich.
  ipcMain.handle('library:ensure', (_e, appid: number, name?: string) => ensureGame(appid, name))
  // Staged detail fetch so the detail page paints progressively: core (appdetails)
  // first, then the slow scraped extras.
  ipcMain.handle('library:detailCore', (_e, appid: number, name?: string) => detailCore(appid, name))
  ipcMain.handle('library:detailExtras', (_e, appid: number) => detailExtras(appid))
  ipcMain.handle('library:dropMetadata', () => dropAllMetadata())

  // ── Full mirror via Web API + Store ─────────────────────────────────────
  // Owned-games sync + queue metadata on the shared scheduler. The scheduler owns
  // all enrichment (library + wishlist + game-detail), so it streams progress on a
  // single `enrich:progress` channel set up once at startup.
  ipcMain.handle('library:syncFull', () => runFullSync())
  ipcMain.handle('library:syncState', () => getSyncState())
  ipcMain.handle('library:cancelSync', () => cancelEnrich())
  // Tell the scheduler which tab/detail is open so it can prioritize workers.
  ipcMain.handle('enrich:setActive', (_e, ctx: ActiveContext) => setActiveContext(ctx))
  // Granular handlers retained for tooling/tests (progress flows via enrich:progress).
  ipcMain.handle('library:syncOwned', () => syncOwned())
  ipcMain.handle('library:enrich', (_e, opts) => enrichLibrary(() => {}, opts ?? {}))
}

export { registerLibraryHandlers }

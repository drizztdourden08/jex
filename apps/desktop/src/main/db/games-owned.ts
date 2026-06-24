import type { InstalledApp } from '@shared/library'
import { persist, run } from './database'
import { hasLocalArt } from '../steam/art'
import type { OwnedGame } from '../steam/webapi'

const UPSERT = `
  INSERT INTO games (appid, name, installed, installDir, sizeOnDisk, lastUpdated,
    libraryFolder, hasLocalArt, updatedAt)
  VALUES (@appid, @name, 1, @installDir, @sizeOnDisk, @lastUpdated,
    @libraryFolder, @hasLocalArt, @updatedAt)
  ON CONFLICT(appid) DO UPDATE SET
    installed = 1,
    installDir = @installDir,
    sizeOnDisk = @sizeOnDisk,
    lastUpdated = @lastUpdated,
    libraryFolder = @libraryFolder,
    hasLocalArt = @hasLocalArt,
    updatedAt = @updatedAt,
    name = CASE WHEN games.name IS NULL OR games.name = '' THEN @name ELSE games.name END
`

/**
 * Reconcile the installed set: mark everything not-installed, then upsert the
 * current installed apps with installed=1. Only touches local-install columns —
 * ownership/metadata from other sources is preserved (provenance).
 */
const syncInstalled = (steamPath: string, apps: InstalledApp[]): number => {
  const now = Date.now()
  run('BEGIN')
  try {
    run('UPDATE games SET installed = 0')
    for (const a of apps) {
      run(UPSERT, {
        '@appid': a.appid,
        '@name': a.name,
        '@installDir': a.installDir,
        '@sizeOnDisk': a.sizeOnDisk,
        '@lastUpdated': a.lastUpdated ?? null,
        '@libraryFolder': a.libraryFolder,
        '@hasLocalArt': hasLocalArt(steamPath, a.appid) ? 1 : 0,
        '@updatedAt': now,
      })
    }
    run('COMMIT')
  } catch (e) {
    run('ROLLBACK')
    throw e
  }
  persist()
  return apps.length
}

const UPSERT_OWNED = `
  INSERT INTO games (appid, name, owned, playtimeForever, playtime2weeks, lastPlayed, iconHash, updatedAt)
  VALUES (@appid, @name, 1, @ptf, @pt2, @last, @icon, @now)
  ON CONFLICT(appid) DO UPDATE SET
    owned = 1,
    playtimeForever = @ptf,
    playtime2weeks = @pt2,
    lastPlayed = @last,
    iconHash = @icon,
    updatedAt = @now,
    name = CASE WHEN games.name IS NULL OR games.name = '' THEN @name ELSE games.name END
`

/** Merge owned games + playtime (covers not-installed). Preserves install/metadata columns. */
const upsertOwned = (games: OwnedGame[]): number => {
  const now = Date.now()
  run('BEGIN')
  try {
    for (const g of games) {
      run(UPSERT_OWNED, {
        '@appid': g.appid,
        '@name': g.name,
        '@ptf': g.playtimeForever,
        '@pt2': g.playtime2weeks,
        '@last': g.lastPlayed ?? null,
        '@icon': g.iconHash ?? null,
        '@now': now,
      })
    }
    run('COMMIT')
  } catch (e) {
    run('ROLLBACK')
    throw e
  }
  persist()
  return games.length
}

export { syncInstalled, upsertOwned }

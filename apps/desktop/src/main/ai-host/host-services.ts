import { app } from 'electron'
import { join } from 'node:path'
import type { HostServices } from '@jex/ai-contract'
import { getAllGames, getGame, getStats } from '../db/games'
import { getMeta, setMeta } from '../db/database'
import { createGroup, listGroups, getGroup, updateGroup, deleteGroup } from '../db/wishlist'
import { runFullSync, runWishlistSync, cancelEnrich, getSyncState } from '../library/sync'
import { detectSteam } from '../steam/detect'
import { searchCatalog } from '../steam/search'
import { settings } from '../settings'
import { setSecret } from '../secrets'

/**
 * The concrete HostServices the desktop app injects into @jex/ai-core. This is the
 * only place the AI engine's capabilities are bound to privileged main-process
 * modules; the engine itself imports none of them. Wire it once at startup with
 * `setHost(createHostServices())`.
 */
const createHostServices = (): HostServices => ({
  db: { getAllGames, getGame, getStats, getMeta, setMeta },
  wishlist: { listGroups, getGroup, createGroup, updateGroup, deleteGroup },
  library: { runFullSync, runWishlistSync, cancelEnrich, getSyncState },
  steam: { detectSteam, searchCatalog },
  settings: {
    get: <T = unknown>(key: string): T | undefined => settings.get(key) as T | undefined,
    set: (key: string, value: unknown): void => settings.set(key, value as never),
  },
  secrets: { setSecret },
  paths: {
    userData: app.getPath('userData'),
    models: join(app.getPath('userData'), 'models'),
  },
  log: (level, message) => {
    if (level === 'error') console.error(`[ai] ${message}`)
    else console.log(`[ai] ${message}`)
  },
})

export { createHostServices }

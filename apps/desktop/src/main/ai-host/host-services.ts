import { app } from 'electron'
import { join } from 'node:path'
import type { HostServices } from '@jex/ai-contract'
import { getAllGames, getGame, getStats } from '../db/games'
import { getMeta, setMeta } from '../db/database'
import { createWishlistHost } from './wishlist-host'
import { runFullSync, runWishlistSync, cancelEnrich, getSyncState, ensureGame } from '../library/sync'
import { detectSteam } from '../steam/detect'
import { searchCatalog } from '../steam/search'
import { settings } from '../settings'
import { setSecret } from '../secrets'
import { createHostLlm } from '../ai-remote'
import { fetchImage } from './fetch-image'

/**
 * The concrete HostServices the desktop app injects into @jex/ai-core. This is the
 * only place the AI engine's capabilities are bound to privileged main-process
 * modules; the engine itself imports none of them. Wire it once at startup with
 * `setHost(createHostServices())`.
 */
// Secrets a plugin may write. Provider keys are written by main only (ai:remote:setKey).
const PLUGIN_WRITABLE_SECRETS: ReadonlySet<string> = new Set(['steamApiKey'])

const createHostServices = (): HostServices => ({
  db: { getAllGames, getGame, getStats, getMeta, setMeta },
  wishlist: createWishlistHost(),
  library: { runFullSync, runWishlistSync, cancelEnrich, getSyncState },
  // storeGame goes through the throttled enrichment queue, like opening a Search result.
  steam: { detectSteam, searchCatalog, storeGame: (appid) => ensureGame(appid) },
  settings: {
    get: <T = unknown>(key: string): T | undefined => settings.get(key) as T | undefined,
    set: (key: string, value: unknown): void => settings.set(key, value as never),
  },
  secrets: {
    setSecret: (name, value) => {
      if (!PLUGIN_WRITABLE_SECRETS.has(name)) throw new Error('secret not writable')
      setSecret(name, value)
    },
  },
  llm: createHostLlm(),
  media: { fetchImage },
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

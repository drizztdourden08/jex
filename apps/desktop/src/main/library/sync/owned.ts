import { getOwnedGames } from '../../steam/webapi'
import { setMeta } from '../../db/database'
import { upsertOwned } from '../../db/games'
import { getCredentials } from './credentials'

/** Phase 2a: pull the full owned-games list (incl. not-installed) + playtime. */
const syncOwned = async (): Promise<number> => {
  const { key, steamId } = await getCredentials()
  if (!key) throw new Error('No Steam API key set (Settings).')
  if (!steamId) throw new Error('No SteamID detected.')
  const games = await getOwnedGames(key, steamId)
  upsertOwned(games)
  setMeta('lastOwnedSync', Date.now())
  return games.length
}

export { syncOwned }

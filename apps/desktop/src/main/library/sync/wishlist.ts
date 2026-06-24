import type { WishlistSyncResult } from '@shared/wishlist'
import { getWishlist } from '../../steam/wishlist'
import { setMeta } from '../../db/database'
import { reconcileWishlist } from '../../db/games'
import * as scheduler from '../scheduler'
import { getCredentials } from './credentials'

/**
 * Pull + reconcile the Steam wishlist (keyless), then queue the newly-added games
 * for enrichment on the shared scheduler (tagged as wishlist so they win priority
 * while the Wishlist tab is open). Non-blocking — the UI tracks progress via the
 * scheduler and reveals items as they finish. An empty result is treated as
 * "private/transient → don't wipe" and reported via `empty`.
 */
const runWishlistSync = async (): Promise<WishlistSyncResult> => {
  const { key, steamId } = await getCredentials()
  if (!steamId) throw new Error('No SteamID detected.')
  const items = await getWishlist(steamId, key ?? undefined)
  if (items.length === 0) {
    setMeta('lastWishlistSync', Date.now())
    return { total: 0, added: 0, removed: 0, empty: true }
  }
  const { total, added, removed, addedAppids } = reconcileWishlist(items)
  setMeta('lastWishlistSync', Date.now())
  if (addedAppids.length > 0) scheduler.enqueueMany(addedAppids, { isWishlist: true })
  return { total, added, removed, empty: false }
}

export { runWishlistSync }

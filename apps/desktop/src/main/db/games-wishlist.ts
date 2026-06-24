import { all, persist, run } from './database'
import type { WishlistItem } from '../steam/wishlist'

/** Optimistically flip the wishlist flag (e.g. right after an add) so the UI
 *  updates before the next full wishlist sync reconciles it. Caller persists. */
const markWishlisted = (appid: number, on: boolean): void => {
  run('UPDATE games SET wishlisted = ?, updatedAt = ? WHERE appid = ?', [on ? 1 : 0, Date.now(), appid])
}

const UPSERT_WISHLIST = `
  INSERT INTO games (appid, name, wishlisted, wishlistPriority, wishlistDate, updatedAt)
  VALUES (@appid, @name, 1, @priority, @date, @now)
  ON CONFLICT(appid) DO UPDATE SET
    wishlisted = 1,
    wishlistPriority = @priority,
    wishlistDate = @date,
    updatedAt = @now,
    name = CASE WHEN games.name IS NULL OR games.name = '' THEN @name ELSE games.name END
`

/**
 * Reconcile the wishlist set against Steam: clear the flag on everything that's no
 * longer wishlisted, then upsert the current items (creating stub rows for appids
 * we've never seen — they'll be enriched like any other). Only touches the three
 * wishlist columns, so ownership/install/metadata provenance is preserved. Returns
 * the diff plus the appids that are newly wishlisted (so the caller can enrich just
 * those). Caller decides whether to persist; we persist here to keep it atomic.
 */
const reconcileWishlist = (
  items: WishlistItem[],
): {
  total: number
  added: number
  removed: number
  addedAppids: number[]
} => {
  const now = Date.now()
  const prev = new Set(
    all<{ appid: number }>('SELECT appid FROM games WHERE wishlisted = 1').map((r) => r.appid),
  )
  const incoming = new Set(items.map((i) => i.appid))
  const addedAppids = items.filter((i) => !prev.has(i.appid)).map((i) => i.appid)
  const removed = [...prev].filter((a) => !incoming.has(a))

  run('BEGIN')
  try {
    run('UPDATE games SET wishlisted = 0, wishlistPriority = NULL, wishlistDate = NULL WHERE wishlisted = 1')
    for (const it of items) {
      run(UPSERT_WISHLIST, {
        '@appid': it.appid,
        '@name': it.name ?? `App ${it.appid}`,
        '@priority': it.priority ?? null,
        '@date': it.dateAdded ?? null,
        '@now': now,
      })
    }
    run('COMMIT')
  } catch (e) {
    run('ROLLBACK')
    throw e
  }
  persist()
  return { total: items.length, added: addedAppids.length, removed: removed.length, addedAppids }
}

export { markWishlisted, reconcileWishlist }

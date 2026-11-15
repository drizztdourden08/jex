import { markWishlisted } from '../db/games'
import { persist } from '../db/database'
import { runWishlistSync } from '../library/sync'
import { addToWishlist } from './wishlistAdd'

/** Add to the Steam wishlist; on success flip the local flag and resync in the background. */
const addToWishlistAndMark = async (appid: number) => {
  const res = await addToWishlist(appid)
  if (res.ok) {
    markWishlisted(appid, true)
    persist()
    void runWishlistSync().catch(() => {})
  }
  return res
}

export { addToWishlistAndMark }

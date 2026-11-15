import { registerGroupCrudTools } from './groupCrud'
import { registerGroupMemberTools } from './groupMembers'
import { registerGroupReadTools } from './groupRead'
import { registerSteamWishlistTools } from './steamTools'

/**
 * Wishlist tools — full management of sub-wishlist groups (create, rename, filter,
 * manual pins, reorder, delete), reading the wishlist, and Steam wishlist add/sync.
 * Membership = saved smart filter ∪ manual pins.
 */
const registerWishlistTools = (): void => {
  registerGroupReadTools()
  registerGroupCrudTools()
  registerGroupMemberTools()
  registerSteamWishlistTools()
}

export { registerWishlistTools }

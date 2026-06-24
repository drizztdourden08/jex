import type { Game } from '@shared/library'
import type { WishlistGroup } from '@shared/wishlist'
import { applyFilter } from '@shared/filterApply'

/**
 * Resolve the games belonging to a sub-wishlist, in wishlist order. Membership is
 * the union of the group's saved smart filter (if any) and its manually-pinned
 * appids — so a game shows if it matches the filter OR was explicitly added. The
 * result preserves the order of the input `wishlist` (the page sorts that upstream).
 */
const groupMembers = (wishlist: Game[], group: WishlistGroup): Game[] => {
  const matched = group.filterSpec
    ? new Set(applyFilter(wishlist, group.filterSpec).map((g) => g.appid))
    : null
  const manual = new Set(group.manualAppids)
  if (!matched && manual.size === 0) return []
  return wishlist.filter((g) => manual.has(g.appid) || (matched?.has(g.appid) ?? false))
}

export { groupMembers }

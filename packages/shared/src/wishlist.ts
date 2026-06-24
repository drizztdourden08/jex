/**
 * Sub-wishlists ("groups") are a local-only concept — Steam has no notion of them.
 * A group is a named bucket over the wishlisted games. Membership is the union of:
 *   • an optional saved FilterSpec (a "smart" group — same engine as everywhere), and
 *   • an explicit list of manually-pinned appids.
 * Either may be empty; a group with neither is simply empty until the user adds to it.
 *
 * Lives in @shared because main owns the SQLite store and the renderer renders them.
 */
import type { FilterSpec } from './filter'

interface WishlistGroup {
  id: number
  name: string
  /** Saved smart filter, or null for a purely manual group. */
  filterSpec: FilterSpec | null
  /** Explicitly pinned appids (union'd with filterSpec matches). */
  manualAppids: number[]
  sortOrder: number
  createdAt: number // unix ms
  updatedAt: number // unix ms
}

/** Editable fields when creating/updating a group. */
interface WishlistGroupPatch {
  name?: string
  filterSpec?: FilterSpec | null
  manualAppids?: number[]
}

/** Outcome of a wishlist reconcile against Steam. */
interface WishlistSyncResult {
  /** Number of items now on the wishlist. */
  total: number
  /** Newly-added since the last sync. */
  added: number
  /** Removed (de-wishlisted) since the last sync. */
  removed: number
  /** True when Steam returned no items — likely a private wishlist; we DON'T wipe. */
  empty: boolean
}

export type { WishlistGroup, WishlistGroupPatch, WishlistSyncResult }

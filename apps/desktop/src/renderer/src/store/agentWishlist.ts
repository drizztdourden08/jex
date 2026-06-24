import { create } from 'zustand'
import type { AgentFilterAction } from './agentFilter'

/**
 * The wishlist counterpart to `agentFilter`: a one-way channel for AI tools to
 * drive the Wishlist view (scope:"wishlist"). The Wishlist page has its own filter
 * state + sub-wishlist selection (separate from the Library), so it watches this
 * channel instead. A request carries the same filter action as the Library (incl.
 * the advanced query-tree variant) plus an optional sub-wishlist to select first.
 */
interface AgentWishlistRequest {
  /** Filter action to apply, or omitted to only change the selection (open group). */
  action?: AgentFilterAction
  /** Sub-wishlist to select first: a group id, 'all' for the whole wishlist, or
   *  undefined to leave the current selection unchanged (e.g. sort/clear). */
  group?: number | 'all'
}

interface AgentWishlistState {
  request: AgentWishlistRequest | null
  nonce: number
  apply: (request: AgentWishlistRequest) => void
}

const useAgentWishlist = create<AgentWishlistState>((set) => ({
  request: null,
  nonce: 0,
  apply: (request) => set((s) => ({ request, nonce: s.nonce + 1 })),
}))

export { useAgentWishlist }
export type { AgentWishlistRequest }

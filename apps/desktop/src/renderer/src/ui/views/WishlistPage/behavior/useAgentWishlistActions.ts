import { useEffect, useRef } from 'react'
import { useAgentWishlist } from '@/store/agentWishlist'
import { applyAgentAction, type FilterState } from '@/lib/query/applyAgentAction'
import type { Selection } from '../sub-components/WishlistRail'

/**
 * When an AI tool drives the Wishlist (apply_filter / set_sort / clear_filter /
 * apply_advanced_filter with scope:"wishlist"). Selects the requested sub-wishlist
 * (if any) and applies the filter action to the page's own filter state.
 */
const useAgentWishlistActions = (flt: FilterState, setSelected: (s: Selection) => void) => {
  const request = useAgentWishlist((s) => s.request)
  const nonce = useAgentWishlist((s) => s.nonce)
  const specRef = useRef(flt.spec)
  specRef.current = flt.spec
  useEffect(() => {
    if (!request) return
    if (request.group !== undefined) setSelected(request.group)
    if (request.action) applyAgentAction(flt, request.action, specRef.current)

  }, [nonce])
}

export { useAgentWishlistActions }

import type { useFilterState } from '@/hooks/useFilterState'
import type { AgentFilterAction } from '@/store/agentFilter'
import type { FilterSpec } from '@shared/filter'

type FilterState = ReturnType<typeof useFilterState>

/**
 * Apply an agent filter action to a page's filter state. Shared by the Library and
 * Wishlist agent-action hooks so both views react to the agent identically.
 * `currentSpec` is the page's live spec (passed via a ref by the caller so merges
 * don't read a stale closure).
 */
const applyAgentAction = (
  flt: FilterState,
  action: AgentFilterAction,
  currentSpec: FilterSpec,
): void => {
  if (action.kind === 'clear') {
    flt.reset()
    return
  }
  if (action.kind === 'advanced') {
    // setMode('advanced') seeds the query from the current spec; set our query AFTER
    // so it wins. Sort still lives in spec.
    flt.setMode('advanced')
    flt.setQuery(action.query)
    if (action.sortBy)
      flt.setSpec({ ...currentSpec, sortBy: action.sortBy, sortDir: action.sortDir ?? 'asc' })
    return
  }
  if (action.kind === 'merge') {
    flt.setMode('normal')
    flt.setSpec({ ...currentSpec, ...action.spec })
    return
  }
  // replace: setMode first (may set dirty=true if coming from advanced), then reset()
  // clears dirty in the same React batch (its setDirty(false) wins), then setSpec.
  flt.setMode('normal')
  flt.reset()
  flt.setSpec({ sortBy: 'name', sortDir: 'asc', ...action.spec })
}

export { applyAgentAction }
export type { FilterState }

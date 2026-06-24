import { create } from 'zustand'
import type { FilterSpec } from '@shared/filter'
import type { QueryGroup } from '@shared/query'

/**
 * A one-way channel for AI tools to drive the Library view. The Library page
 * watches `nonce` and applies the latest action when it changes:
 *  - replace:  set the whole flat filter (apply_filter)
 *  - merge:    patch fields onto the current filter (set_sort)
 *  - clear:    reset filters, keep sort
 *  - advanced: switch to advanced mode with a query tree (apply_advanced_filter)
 */
type AgentFilterAction =
  | { kind: 'replace'; spec: FilterSpec }
  | { kind: 'merge'; spec: FilterSpec }
  | { kind: 'clear' }
  | { kind: 'advanced'; query: QueryGroup; sortBy?: FilterSpec['sortBy']; sortDir?: FilterSpec['sortDir'] }

interface AgentFilterState {
  action: AgentFilterAction | null
  nonce: number
  apply: (action: AgentFilterAction) => void
}

const useAgentFilter = create<AgentFilterState>((set) => ({
  action: null,
  nonce: 0,
  apply: (action) => set((s) => ({ action, nonce: s.nonce + 1 })),
}))

export { useAgentFilter }
export type { AgentFilterAction }

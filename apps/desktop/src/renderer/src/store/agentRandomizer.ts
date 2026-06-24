import { create } from 'zustand'
import type { FilterSpec } from '@shared/filter'
import type { Game } from '@shared/library'
import type { ScopeKind } from '@shared/scope'
import type { WeightMode } from '@/lib/query/randomizer'

/**
 * Channel for the AI `roll_randomizer` tool to drive the Randomizer page. The roll
 * is resolved up-front in the Layout dispatch (which holds the mirror + store API),
 * so the request carries the already-picked games + pool size; the page just
 * reflects the chosen source/filter and displays the picks. A module-level
 * "consumed" marker fires a queued request exactly once after the page mounts.
 */
interface RandomizerRequest {
  source: ScopeKind
  spec?: FilterSpec
  weight?: WeightMode
  count?: number
  /** Games chosen by the dispatch (so the page shows exactly what the agent saw). */
  picks: Game[]
  /** Size of the pool the picks were drawn from. */
  poolSize: number
}

interface AgentRandomizerState {
  request: RandomizerRequest | null
  nonce: number
  roll: (request: RandomizerRequest) => void
}

const useAgentRandomizer = create<AgentRandomizerState>((set) => ({
  request: null,
  nonce: 0,
  roll: (request) => set((s) => ({ request, nonce: s.nonce + 1 })),
}))

let consumed = 0

/** Returns the pending request once per new nonce, else null. */
const takeRandomizerRequest = (): RandomizerRequest | null => {
  const { nonce, request } = useAgentRandomizer.getState()
  if (nonce > consumed && request) {
    consumed = nonce
    return request
  }
  return null
}

export { useAgentRandomizer, takeRandomizerRequest }
export type { RandomizerRequest }

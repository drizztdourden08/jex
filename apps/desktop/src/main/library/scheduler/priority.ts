import type { ActiveContext, Task } from './types'
import { inflight, queue, state } from './state'
import { PRI_ACTIVE, PRI_BACKGROUND, PRI_DETAIL } from './constants'
import { emit } from './progress'

// ── Priority ────────────────────────────────────────────────────────────────────
const priorityOf = (t: Task): number => {
  if (t.pin != null) return t.pin
  if (state.active.appid != null && t.appid === state.active.appid) return PRI_DETAIL
  if (state.active.tab === 'wishlist') return t.isWishlist ? PRI_ACTIVE : PRI_BACKGROUND
  // Library / randomizer / game / other → the whole set is the "active" set.
  return PRI_ACTIVE
}

const takeNext = (): Task | null => {
  let best: Task | null = null
  let bestPri = Infinity
  for (const t of queue.values()) {
    if (inflight.has(t.appid)) continue
    const p = priorityOf(t)
    if (p < bestPri) {
      bestPri = p
      best = t
    }
  }
  return best
}

const setActive = (ctx: ActiveContext): void => {
  state.active = ctx
  // Re-prioritization is implicit (priorityOf is read at pick time), but nudge a
  // progress emit so any ETA reflecting the new ordering refreshes promptly.
  if (state.started) emit()
}

export { priorityOf, takeNext, setActive }

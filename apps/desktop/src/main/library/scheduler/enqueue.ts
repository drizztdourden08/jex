import type { Game } from '@shared/library'
import type { Task } from './types'
import { getGame } from '../../db/games'
import { inflight, queue, state } from './state'
import { PRI_DETAIL } from './constants'
import { emit, remaining, resolveDrain } from './progress'
import { ensureStarted } from './worker'

const setBaseInterval = (ms: number): void => {
  state.intervalMs = Math.max(0, ms)
}

/**
 * Queue an appid for enrichment and resolve with the resulting Game once fetched.
 * Multiple callers for the same appid share one fetch. `pin:'detail'` jumps the
 * queue (used when a game's detail page opens). Non-awaited bulk callers just pass
 * the appid and ignore the promise.
 */
const enqueue = (
  appid: number,
  opts: { pin?: 'detail'; isWishlist?: boolean } = {},
): Promise<Game | null> => {
  const pin = opts.pin === 'detail' ? PRI_DETAIL : undefined
  const existing = queue.get(appid)
  if (existing) {
    if (pin != null) existing.pin = pin
    return new Promise<Game | null>((resolve) => existing.waiters.push(resolve))
  }
  const isWishlist = opts.isWishlist ?? !!getGame(appid)?.wishlisted
  const task: Task = { appid, isWishlist, pin, waiters: [] }
  queue.set(appid, task)
  state.sessionTotal++
  ensureStarted()
  emit()
  return new Promise<Game | null>((resolve) => task.waiters.push(resolve))
}

/** Bulk-enqueue background work (no awaiting). Skips appids already queued/in-flight. */
const enqueueMany = (appids: number[], opts: { isWishlist?: boolean } = {}): void => {
  for (const appid of appids) {
    if (queue.has(appid)) continue
    queue.set(appid, {
      appid,
      isWishlist: opts.isWishlist ?? !!getGame(appid)?.wishlisted,
      waiters: [],
    })
    state.sessionTotal++
  }
  if (appids.length) {
    ensureStarted()
    emit()
  }
}

/** Drop all not-yet-started work (in-flight fetches finish). Resolves their waiters. */
const cancel = (): void => {
  for (const t of queue.values()) {
    if (inflight.has(t.appid)) continue
    t.waiters.forEach((fn) => fn(getGame(t.appid)))
    queue.delete(t.appid)
  }
  // Recompute the wave so the bar reflects only what's left running.
  state.sessionTotal = state.processed + inflight.size
  emit({ phase: 'paused', message: 'Paused' })
  if (remaining() === 0 && inflight.size === 0) resolveDrain()
}

export { setBaseInterval, enqueue, enqueueMany, cancel }

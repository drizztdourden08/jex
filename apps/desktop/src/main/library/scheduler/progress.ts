import type { SyncProgress, SyncState } from '@shared/library'
import { inflight, queue, state, subscribers, drainWaiters, workers } from './state'
import { perGameAvgMs } from './timing'

// ── Subscriptions / progress ────────────────────────────────────────────────────
const subscribe = (fn: (p: SyncProgress) => void): (() => void) => {
  subscribers.add(fn)
  if (state.lastProgress) fn(state.lastProgress)
  return () => subscribers.delete(fn)
}

const broadcast = (p: SyncProgress): void => {
  state.lastProgress = p
  for (const fn of subscribers) fn(p)
}

/** Used by the owned-games sync to surface its phase on the same channel. */
const emitPhase = (p: SyncProgress): void => {
  state.ownedPhase = p.phase === 'owned' ? p : null
  broadcast(p)
}

const remaining = (): number => {
  return queue.size
}

const emit = (extra: Partial<SyncProgress> = {}): void => {
  // While the owned-games phase is active and nothing is enriching yet, keep
  // showing it (the bulk wave hasn't started).
  if (state.ownedPhase && remaining() === 0 && inflight.size === 0 && !extra.phase) {
    broadcast({ ...state.ownedPhase })
    return
  }
  const avgMs = perGameAvgMs()
  const rem = Math.max(0, state.sessionTotal - state.processed)
  broadcast({
    phase: remaining() > 0 ? 'enrich' : 'done',
    total: state.sessionTotal,
    done: state.processed,
    workers: workers.map((w) => ({ ...w })),
    ...(avgMs != null ? { avgMs: Math.round(avgMs), etaMs: Math.round(avgMs * rem) } : {}),
    ...extra,
  })
}

const getState = (): SyncState => {
  return {
    running: remaining() > 0 || inflight.size > 0 || state.ownedPhase != null,
    progress: state.lastProgress,
  }
}

/** True while there's queued or in-flight enrichment work. */
const isBusy = (): boolean => {
  return remaining() > 0 || inflight.size > 0
}

/** Resolves once the queue is empty (no pending, none in flight). */
const drain = (): Promise<void> => {
  if (remaining() === 0 && inflight.size === 0) return Promise.resolve()
  return new Promise<void>((resolve) => drainWaiters.push(resolve))
}

const resolveDrain = (): void => {
  state.ownedPhase = null
  while (drainWaiters.length) drainWaiters.shift()!()
}

export { subscribe, broadcast, emitPhase, remaining, emit, getState, isBusy, drain, resolveDrain }

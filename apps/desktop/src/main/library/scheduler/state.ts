import type { SyncProgress, WorkerProgress } from '@shared/library'
import type { ActiveContext, Task } from './types'
import { DEFAULT_INTERVAL } from './constants'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ── Queue state ────────────────────────────────────────────────────────────────
const queue = new Map<number, Task>() // pending + in-flight, keyed by appid
const inflight = new Set<number>()
const workers: WorkerProgress[] = []
const subscribers = new Set<(p: SyncProgress) => void>()
const drainWaiters: (() => void)[] = []

// Progress bookkeeping. A "wave" spans from the queue going non-empty until it
// drains; total/done are relative to the current wave so the bar fills sensibly.
//
// Mutable scalars live on a single object so topic modules can reassign them
// across module boundaries (plain `let` exports can't be reassigned by importers).
const state = {
  active: { tab: 'library' } as ActiveContext,
  intervalMs: DEFAULT_INTERVAL,
  nextAllowed: 0,
  started: false,
  sessionTotal: 0,
  processed: 0,
  lastProgress: null as SyncProgress | null,
  ownedPhase: null as SyncProgress | null, // set by the owned-games sync, cleared when enrich starts
  // ── ETA timing (blended all-time + last-10), persisted across sessions ──────────
  timeSum: 0,
  timeCount: 0,
  recentTimes: [] as number[],
  lastTickTs: 0,
  timingLoaded: false,
}

export { sleep, queue, inflight, workers, subscribers, drainWaiters, state }

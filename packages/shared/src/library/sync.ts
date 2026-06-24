/**
 * Sync + enrichment progress/state types and aggregate library stats — the
 * contract between the main-owned sync job and the UI that observes it. Shared
 * across main and renderer via the `@shared` alias.
 */

/** Per-parallel-worker progress, for the multi-bar UI. */
interface WorkerProgress {
  id: number
  current?: string // game currently being fetched
  status: 'idle' | 'fetching' | 'done'
}

/** Streamed progress for the owned-games sync + metadata enrichment job. */
interface SyncProgress {
  phase: 'owned' | 'enrich' | 'done' | 'paused' | 'error'
  total: number
  done: number
  currentName?: string
  message?: string
  /** Live state of each parallel enrichment worker. */
  workers?: WorkerProgress[]
  /** Estimated time remaining for the enrich phase (ms). */
  etaMs?: number
  /** Blended per-game enrichment time (ms): 25% all-time avg + 75% last-10 avg. */
  avgMs?: number
}

/** Aggregate counts for the library, so the UI can show what's been analyzed. */
interface LibraryStats {
  total: number
  installed: number
  owned: number
  enriched: number // has full Store metadata
  pending: number // owned-only + failed (will be fetched on next sync)
  noStorePage: number // delisted/region-locked (terminal)
  lastEnrich: number | null // unix ms
  lastOwnedSync: number | null
}

/** Snapshot of the (main-owned) sync job — queried on mount so any view shows the
 *  true state and resumes the progress bar instead of restarting from 0. */
interface SyncState {
  running: boolean
  progress: SyncProgress | null
}

interface EnrichOptions {
  /** Global min spacing between Store requests across all workers (ms). The Store
   *  API is IP-rate-limited (~200 req / 5 min), so this — not the worker count —
   *  governs throughput; workers just keep that rate saturated. Adapts up on 429. */
  delayMs?: number
  /** Number of parallel in-flight requests. */
  workers?: number
  /** Cap this run to N apps (the rest resume next time). */
  limit?: number
  /** Restrict enrichment to these appids (intersected with the unenriched set).
   *  Used by the wishlist sync to enrich only newly-wishlisted games. */
  appids?: number[]
}

export type {
  WorkerProgress,
  SyncProgress,
  LibraryStats,
  SyncState,
  EnrichOptions,
}

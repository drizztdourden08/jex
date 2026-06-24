import type { EnrichOptions } from '@shared/library'
import { getMeta, setMeta } from '../../db/database'
import { getUnenrichedAppids, requeueStale } from '../../db/games'
import { scanLocal } from '../scan'
import * as scheduler from '../scheduler'
import { DAY_MS, MONTH_MS } from './types'
import type { AutoSyncFlags, ProgressFn } from './types'
import { syncOwned } from './owned'

/**
 * Background auto-sync run on app open. Always refreshes local install state
 * (cheap, no network). Then, per the granular settings: monthly re-queues
 * metadata older than ~30 days, and on-open / daily runs the full owned+enrich
 * pass (incremental — only pending/re-queued games actually hit the Store).
 */
const autoSync = async (flags: AutoSyncFlags): Promise<void> => {
  try {
    await scanLocal() // refresh installed/size/art for every game
  } catch {
    /* local scan failure shouldn't block the network sync */
  }

  const now = Date.now()
  if (flags.monthly) {
    const lastFull = getMeta<number>('lastFullResync') ?? 0
    if (now - lastFull > MONTH_MS) {
      requeueStale(MONTH_MS)
      setMeta('lastFullResync', now)
    }
  }

  const lastSync = getMeta<number>('lastAutoSync') ?? 0
  const due = flags.onOpen || (flags.daily && now - lastSync > DAY_MS)
  if (due) {
    await runFullSync()
    setMeta('lastAutoSync', Date.now())
  }
}

/**
 * The owned-games sync → queue every unenriched game on the shared scheduler. Does
 * NOT block on enrichment (the queue drains in the background, prioritized by the
 * open tab); returns once the owned list is in and the work is queued.
 */
const runFullSync = async (): Promise<void> => {
  try {
    // The owned-games fetch is quick + silent — we DON'T surface a progress phase
    // for it, so a routine auto-sync with nothing to enrich never flashes the panel
    // / shifts the layout. The progress UI appears only once real enrichment work is
    // queued below (the scheduler emits 'enrich' then 'done').
    const owned = await syncOwned()
    if (owned === 0) {
      scheduler.emitPhase({
        phase: 'error',
        total: 0,
        done: 0,
        message: "Steam returned 0 owned games — set your profile's Game details to Public.",
      })
      return
    }
    scheduler.enqueueMany(getUnenrichedAppids())
    // No enrichment queued (everything already synced) → emit a terminal 'done' so a
    // MANUAL sync (which shows its own panel) closes it. Harmless for auto-sync: the
    // panel was never opened, so this just no-ops the (already-false) syncing state.
    if (!scheduler.isBusy()) scheduler.emitPhase({ phase: 'done', total: 0, done: 0 })
  } catch (e) {
    scheduler.emitPhase({ phase: 'error', total: 0, done: 0, message: String(e) })
  }
}

/**
 * Granular enrichment entry point retained for tooling/tests: queue the unenriched
 * set (optionally filtered/capped) and await the queue draining. Real UI flows use
 * runFullSync / runWishlistSync / refreshOne, which don't block.
 */
const enrichLibrary = async (onProgress: ProgressFn, opts: EnrichOptions = {}): Promise<void> => {
  if (opts.delayMs != null) scheduler.setBaseInterval(opts.delayMs)
  let appids = getUnenrichedAppids()
  if (opts.appids) {
    const want = new Set(opts.appids)
    appids = appids.filter((a) => want.has(a))
  }
  if (opts.limit) appids = appids.slice(0, opts.limit)
  const off = scheduler.subscribe(onProgress)
  try {
    scheduler.enqueueMany(appids)
    await scheduler.drain()
  } finally {
    off()
  }
}

export { autoSync, runFullSync, enrichLibrary }

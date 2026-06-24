import type { WorkerProgress } from '@shared/library'
import { fetchFullMetadata } from '../../enrich/metadata'
import { RateLimitError } from '../../steam/store'
import { getGame, markEnrichFailed, markNoStorePage, mergeMetadata } from '../../db/games'
import { persist, setMeta } from '../../db/database'
import { inflight, queue, sleep, state, workers } from './state'
import { IDLE_POLL_MS, MAX_INTERVAL, WORKER_COUNT } from './constants'
import { emit, remaining, resolveDrain } from './progress'
import { takeNext } from './priority'
import { loadTiming, recordGameTime, saveTiming } from './timing'

// ── Workers ───────────────────────────────────────────────────────────────────
const acquire = async (): Promise<void> => {
  const target = Math.max(Date.now(), state.nextAllowed)
  state.nextAllowed = target + state.intervalMs
  while (Date.now() < target) await sleep(Math.min(80, target - Date.now()))
}

const runWorker = async (w: WorkerProgress): Promise<void> => {
  for (;;) {
    const task = takeNext()
    if (!task) {
      if (w.status !== 'idle') {
        w.status = 'idle'
        w.current = undefined
        emit()
      }
      await sleep(IDLE_POLL_MS)
      continue
    }
    inflight.add(task.appid)
    await acquire()
    w.status = 'fetching'
    w.current = getGame(task.appid)?.name
    emit()
    try {
      const patch = await fetchFullMetadata(task.appid)
      if (patch) {
        mergeMetadata(task.appid, patch)
        w.current = patch.name
      } else {
        markNoStorePage(task.appid)
      }
    } catch (e) {
      markEnrichFailed(task.appid)
      if (e instanceof RateLimitError) {
        state.intervalMs = Math.min(Math.round(state.intervalMs * 1.5), MAX_INTERVAL)
        state.nextAllowed = Date.now() + state.intervalMs * 2
        emit({ message: `Rate-limited — easing off to ~${(state.intervalMs / 1000).toFixed(1)}s/req` })
      }
    }
    const now = Date.now()
    if (state.lastTickTs) recordGameTime(now - state.lastTickTs)
    state.lastTickTs = now

    const result = getGame(task.appid)
    inflight.delete(task.appid)
    queue.delete(task.appid)
    state.processed++
    task.waiters.forEach((fn) => fn(result))

    if (state.processed % 20 === 0) {
      saveTiming()
      persist()
    }
    emit()

    if (remaining() === 0 && inflight.size === 0) {
      saveTiming()
      persist()
      setMeta('lastEnrich', Date.now())
      // Reset the wave so the next batch starts the bar from 0.
      state.processed = 0
      state.sessionTotal = 0
      resolveDrain()
      emit({ phase: 'done' })
    }
  }
}

const ensureStarted = (): void => {
  if (state.started) return
  state.started = true
  loadTiming()
  state.lastTickTs = Date.now()
  for (let id = 0; id < WORKER_COUNT; id++) {
    const w: WorkerProgress = { id, status: 'idle' }
    workers.push(w)
    void runWorker(w)
  }
}

export { acquire, runWorker, ensureStarted }

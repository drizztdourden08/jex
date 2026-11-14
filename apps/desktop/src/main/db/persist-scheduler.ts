/**
 * Coalesces DB writes: `schedule()` marks the mirror dirty and arms one timer;
 * `flush()` writes now if dirty. Writes are synchronous, so two never overlap.
 */
const createPersistScheduler = (write: () => void, intervalMs: number) => {
  let dirty = false
  let timer: NodeJS.Timeout | null = null

  const clearTimer = (): void => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const flush = (): void => {
    clearTimer()
    if (!dirty) return
    dirty = false
    write()
  }

  const schedule = (): void => {
    dirty = true
    if (timer) return
    timer = setTimeout(flush, intervalMs)
    timer.unref()
  }

  /** An immediate write supersedes any pending one. */
  const markClean = (): void => {
    dirty = false
    clearTimer()
  }

  return { schedule, flush, markClean }
}

export { createPersistScheduler }

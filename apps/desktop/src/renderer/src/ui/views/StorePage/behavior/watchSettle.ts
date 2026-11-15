import type { SteamWebview } from '../StorePage.type'

interface SettleResult {
  navigated: boolean
  timedOut: boolean
}

const HYDRATE_MS = 300

/**
 * Start listening for a navigation BEFORE the triggering action. `settled(graceMs)` then
 * resolves once: nothing started loading within the grace window (navigated:false), or a
 * load started and finished (navigated:true), or `timeoutMs` passed (timedOut:true).
 * Always call `dispose()` (settled does it for you).
 */
const watchSettle = (wv: SteamWebview, timeoutMs: number) => {
  let started = wv.isLoading()
  let finish: ((r: SettleResult) => void) | null = null
  let hydrate: ReturnType<typeof setTimeout> | undefined

  const onStart = () => {
    started = true
  }
  const onStop = () => {
    if (!started) return
    clearTimeout(hydrate)
    hydrate = setTimeout(() => finish?.({ navigated: true, timedOut: false }), HYDRATE_MS)
  }
  const onInPage = () => {
    started = true
    clearTimeout(hydrate)
    hydrate = setTimeout(() => finish?.({ navigated: true, timedOut: false }), HYDRATE_MS)
  }
  wv.addEventListener('did-start-loading', onStart)
  wv.addEventListener('did-stop-loading', onStop)
  wv.addEventListener('did-navigate-in-page', onInPage)

  const dispose = () => {
    clearTimeout(hydrate)
    wv.removeEventListener('did-start-loading', onStart)
    wv.removeEventListener('did-stop-loading', onStop)
    wv.removeEventListener('did-navigate-in-page', onInPage)
  }

  const settled = (graceMs: number): Promise<SettleResult> =>
    new Promise((resolve) => {
      const timers: ReturnType<typeof setTimeout>[] = []
      finish = (r) => {
        timers.forEach(clearTimeout)
        finish = null
        dispose()
        resolve(r)
      }
      timers.push(
        setTimeout(() => {
          if (!started && !wv.isLoading()) finish?.({ navigated: false, timedOut: false })
        }, graceMs),
      )
      timers.push(setTimeout(() => finish?.({ navigated: started, timedOut: true }), timeoutMs))
      if (started && !wv.isLoading()) onStop()
    })

  return { settled, dispose }
}

export { watchSettle }
export type { SettleResult }

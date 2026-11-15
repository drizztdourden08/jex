import type { StoreActOp, StoreActResult, StoreNavControls } from '@/store/storeNav'
import type { SteamWebview } from '../StorePage.type'
import { buildActScript } from './guest/buildActScript'
import { watchSettle } from './watchSettle'

const LOAD_TIMEOUT_MS = 12_000
const ACT_TIMEOUT_MS = 9_000
const WAIT_CAP_MS = 10_000
const POLL_MS = 250
// How long to watch for a navigation after an op that may trigger one.
const GRACE_MS: Record<StoreActOp, number> = { click: 800, type: 900, select: 500, key: 800, links: 0, state: 0, has: 0 }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const snapshot = (wv: SteamWebview, extra: object = {}): StoreActResult => ({
  url: wv.getURL(),
  title: wv.getTitle(),
  ...extra,
})

const runGuest = (wv: SteamWebview, op: StoreActOp, args: Record<string, unknown>) =>
  wv.executeJavaScript(buildActScript(op, args)) as Promise<StoreActResult>

type ActionControls = Pick<StoreNavControls, 'navigateAndWait' | 'history' | 'pageState' | 'act' | 'waitFor'>

/** Host-side AI browse actions over the webview: load/settle waits + guarded guest ops. */
const buildStoreActions = (wv: SteamWebview): ActionControls => ({
  navigateAndWait: async (url) => {
    const watch = watchSettle(wv, LOAD_TIMEOUT_MS)
    const settled = watch.settled(2_000)
    try {
      wv.loadURL(url).catch(() => {})
    } catch {
      wv.src = url
    }
    return snapshot(wv, await settled)
  },

  history: async (kind) => {
    if (kind === 'back' && !wv.canGoBack()) return snapshot(wv, { error: 'Cannot go back: no earlier page in history.' })
    if (kind === 'forward' && !wv.canGoForward()) return snapshot(wv, { error: 'Cannot go forward: no later page in history.' })
    const watch = watchSettle(wv, LOAD_TIMEOUT_MS)
    const settled = watch.settled(2_000)
    if (kind === 'back') wv.goBack()
    else if (kind === 'forward') wv.goForward()
    else wv.reload()
    return snapshot(wv, await settled)
  },

  pageState: async () => {
    const base = { url: wv.getURL(), title: wv.getTitle(), canGoBack: wv.canGoBack(), canGoForward: wv.canGoForward(), isLoading: wv.isLoading() }
    try {
      return { ...base, ...(await runGuest(wv, 'state', {})) }
    } catch {
      return { ...base, note: 'Page is still loading; scroll/login info unavailable. Try again shortly.' }
    }
  },

  act: async (op, args) => {
    const before = wv.getURL()
    const watch = watchSettle(wv, ACT_TIMEOUT_MS)
    let result: StoreActResult
    try {
      result = await runGuest(wv, op, args)
    } catch (e) {
      watch.dispose()
      return snapshot(wv, { error: `Could not run on the page: ${e instanceof Error ? e.message : String(e)}` })
    }
    if (result.error || GRACE_MS[op] === 0) {
      watch.dispose()
      return op === 'links' ? result : { ...snapshot(wv), ...result }
    }
    const settled = await watch.settled(GRACE_MS[op])
    const now = snapshot(wv)
    return { ...result, ...settled, ...now, urlChanged: now.url !== before }
  },

  waitFor: async ({ text, selector, timeoutMs }) => {
    if (!text && !selector) return snapshot(wv, { error: 'Provide text and/or selector to wait for.' })
    const cap = Math.min(Math.max(timeoutMs ?? 8_000, 500), WAIT_CAP_MS)
    const start = Date.now()
    while (Date.now() - start < cap) {
      try {
        const r = await runGuest(wv, 'has', { text, selector })
        if (r.error) return snapshot(wv, r)
        if (r.found) return snapshot(wv, { found: true, waitedMs: Date.now() - start })
      } catch {
        // page is mid-navigation; keep polling
      }
      await sleep(POLL_MS)
    }
    return snapshot(wv, { found: false, timedOut: true, waitedMs: Date.now() - start })
  },
})

export { buildStoreActions }

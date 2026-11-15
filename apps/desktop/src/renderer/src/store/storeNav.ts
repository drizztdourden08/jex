import { create } from 'zustand'

/**
 * A query into the live store-page DOM. With no fields it returns a page overview
 * (title, text, headings, key actions). With any filter it returns matching
 * elements as HTML + live attributes, paginated.
 */
interface StoreReadQuery {
  /** CSS selector to scope the search (e.g. ".game_purchase_action", "input"). */
  selector?: string
  /** Keep only elements whose visible text contains this (case-insensitive). */
  containsText?: string
  /** Keep only this tag (e.g. "a", "button", "input", "h2"). */
  tag?: string
  /** Keep only elements that have this attribute/property (e.g. "checked", "href"). */
  attribute?: string
  /** ...with this exact value (optional; pairs with `attribute`). */
  attributeValue?: string
  /** Pagination over matches. */
  page?: number
  /** Matches per page (default 5, max 20). */
  pageSize?: number
}

/** One matched element, with live form state that outerHTML alone can't show. */
interface StoreElement {
  tag: string
  classes?: string[]
  text?: string
  /** Live attributes + properties (href, type, value, checked, selected, disabled, aria-*…). */
  attrs?: Record<string, string | boolean>
  /** Cleaned, length-capped outerHTML. */
  html: string
}

/** Result of reading/querying the store page. */
interface StoreReadResult {
  url: string
  title: string
  // Overview mode (no query):
  text?: string
  truncated?: boolean
  headings?: string[]
  actions?: string[]
  // Query mode:
  totalMatches?: number
  page?: number
  totalPages?: number
  returned?: number
  results?: StoreElement[]
  note?: string
  error?: string
}

/** Result of asking the store to scroll to some content. */
interface StoreScrollResult {
  found: boolean
  /** The text of the element we scrolled to (when `found`). */
  matched?: string
}

/** Guest-side operations the AI browse tools run inside the store webview. */
type StoreActOp = 'click' | 'hover' | 'aim' | 'synth' | 'probe' | 'type' | 'select' | 'key' | 'links' | 'state' | 'has'

/** Loose result of a browse op: url/title (+ navigated/timedOut) plus op-specific fields, or `error`. */
type StoreActResult = Record<string, unknown> & { error?: string }

/** Imperative handles the StorePage wires up to drive its <webview>. */
interface StoreNavControls {
  back: () => void
  forward: () => void
  reload: () => void
  stop: () => void
  /** Navigate the embedded store to a URL (used by the AI open_steam_page tool). */
  loadURL: (url: string) => void
  /** Read/query the current page's DOM (AI read_store_page tool). */
  readContent: (query?: StoreReadQuery) => Promise<StoreReadResult>
  /** Scroll the page to top/bottom or to the first element matching `text`. */
  scrollTo: (opts: { to?: 'top' | 'bottom'; text?: string }) => Promise<StoreScrollResult>
  /** Load a URL and resolve once the load settles (or times out) with the new url + title. */
  navigateAndWait: (url: string) => Promise<StoreActResult>
  /** Back / forward / reload, resolving once the load settles. */
  history: (kind: 'back' | 'forward' | 'reload') => Promise<StoreActResult>
  /** Url, title, history + loading flags, scroll position, logged-in hint. */
  pageState: () => Promise<StoreActResult>
  /** Run a guarded click/type/select/key/links op in the guest, then wait for any resulting navigation. */
  act: (op: StoreActOp, args: Record<string, unknown>) => Promise<StoreActResult>
  /** Wait (capped ~10 s) until text or a selector appears on the page. */
  /** Screenshot the visible viewport as a downscaled JPEG (AI screenshot_store_page tool). */
  capture: (maxSide: number) => Promise<StoreCaptureResult>
  waitFor: (opts: { text?: string; selector?: string; timeoutMs?: number }) => Promise<StoreActResult>
}

/** A viewport screenshot (base64 JPEG) or an error. */
interface StoreCaptureResult {
  base64?: string
  mime?: string
  url?: string
  title?: string
  /** Page viewport in CSS pixels (what store_click x,y use). */
  viewport?: { width: number; height: number }
  /** Size of the returned image in pixels. */
  image?: { width: number; height: number }
  error?: string
}

interface StoreNavState {
  /** True only while the Store page is mounted (controls live in the title bar). */
  active: boolean
  canBack: boolean
  canFwd: boolean
  loading: boolean
  controls: StoreNavControls | null
  setStatus: (s: Partial<Pick<StoreNavState, 'active' | 'canBack' | 'canFwd' | 'loading'>>) => void
  setControls: (c: StoreNavControls | null) => void
}

/**
 * Bridges the embedded store's webview (owned by StorePage) and the back/forward/
 * reload buttons that live in the title bar. StorePage publishes status + control
 * handles; the title bar consumes them. Mirrors the useAiDrawer pattern.
 */
const useStoreNav = create<StoreNavState>((set) => ({
  active: false,
  canBack: false,
  canFwd: false,
  loading: false,
  controls: null,
  setStatus: (s) => set(s),
  setControls: (controls) => set({ controls }),
}))

export { useStoreNav }
export type {
  StoreReadQuery,
  StoreElement,
  StoreReadResult,
  StoreScrollResult,
  StoreCaptureResult,
  StoreNavControls,
  StoreActOp,
  StoreActResult,
}

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
  StoreNavControls,
}

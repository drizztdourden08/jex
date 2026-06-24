/**
 * Catalog search types — shared by main (which calls Steam's store search and
 * parses the result rows) and the renderer (the Search tab). Distinct from the
 * library mirror: a SearchResult is a lightweight catalog hit, not a full `Game`.
 * Opening one in the detail view hydrates + caches a real `Game` (Phase C).
 */
import type { FilterSpec } from './filter'

/** Fixed catalog page size — manual Prev/Next paging, never infinite scroll.
 *  Must divide Steam's native 50-result chunk so a UI page never straddles two
 *  chunks (see searchCatalog's chunking). */
const SEARCH_PAGE_SIZE = 10

interface SearchReview {
  desc: string // e.g. "Very Positive"
  percent?: number // % positive
  total?: number // review count
}

/** One catalog hit parsed from a store-search result row. */
interface SearchResult {
  appid: number
  name: string
  /** Release date as Steam prints it (e.g. "12 Mar, 2024" or "Coming soon"). */
  released?: string
  /** Final price in the store's currency minor units (cents). 0 = free. */
  priceCents?: number
  /** Pre-formatted price string from Steam (currency-correct), if present. */
  priceText?: string
  /** Discount percent (e.g. 50 for -50%), when on sale. */
  discountPct?: number
  review?: SearchReview
  platforms?: { windows?: boolean; mac?: boolean; linux?: boolean }
  /** Exact capsule image URL Steam serves for this row (most reliable art source). */
  capsule?: string
  /** The game's Steam tag IDs (from the row) — resolved to names for Advanced filtering. */
  tagIds?: number[]
}

/** A catalog search request. `text` is the free-text term; `spec` carries the
 *  faceted filters + sort (Phase B). `page` is 0-based. */
interface SearchQuery {
  text?: string
  spec?: FilterSpec
  page?: number
}

interface SearchResponse {
  results: SearchResult[]
  /** Total hits across all pages (from Steam's `total_count`). */
  total: number
  /** Echoed 0-based page. */
  page: number
  pageSize: number
}

/** A random sample drawn from the live store catalog (the randomizer's "Store"
 *  source). `total` is the size of the matching catalog pool (Steam's
 *  `total_count`) so the UI can report what it rolled from. */
interface StoreRandomResponse {
  picks: SearchResult[]
  total: number
}

/** The faceted vocabulary synced from Steam (Phase B), persisted in AppData. */
interface SearchVocab {
  /** Tag name → Steam tagid (tags include genres/themes). */
  tags: { name: string; id: number }[]
  genres: string[]
  categories: string[]
  syncedAt: number // unix ms
}

export { SEARCH_PAGE_SIZE }
export type {
  SearchReview,
  SearchResult,
  SearchQuery,
  SearchResponse,
  StoreRandomResponse,
  SearchVocab,
}

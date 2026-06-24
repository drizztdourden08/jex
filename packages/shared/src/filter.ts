/**
 * The FilterSpec is the contract shared by the manual filter UI, the randomizer,
 * and the AI query builder (main process). The AI's only output is a validated
 * FilterSpec — a bounded, declarative structure the engine already understands —
 * so AI output is safe to apply directly: no code execution, no invented queries.
 *
 * Lives in @shared because both the renderer (apply/filter) and main (the AI
 * builder) produce/consume it. Keep the AI schema (main/ai/query.ts) in sync.
 */

type SortKey =
  | 'name'
  | 'playtimeForever'
  | 'playtime2weeks'
  | 'lastPlayed'
  | 'releaseYear'
  | 'metacritic'
  | 'reviewTotal'
  | 'wishlistPriority' // Steam wishlist rank (0 = top)
  | 'wishlistDate' // when it was added to the wishlist
  | 'random'

interface NumberRange {
  min?: number
  max?: number
}

interface FilterSpec {
  /** Free-text match against name + short description. */
  text?: string

  /** Multi-valued facets. Within a facet the match is OR; across facets it's AND. */
  genres?: string[]
  categories?: string[]
  tags?: string[]
  developers?: string[]
  publishers?: string[]

  /** Numeric ranges. */
  playtimeForeverMin?: number // minutes
  playtimeForeverMax?: number
  releaseYear?: NumberRange
  metacriticMin?: number
  reviewPercentMin?: number // Steam overall positive %

  /** Platform requirements (all listed must be supported). */
  platforms?: ('windows' | 'mac' | 'linux')[]

  /** Feature requirements — GameFeatures keys; ALL listed must be present. */
  features?: string[]

  /** Install / engagement flags. */
  installedOnly?: boolean
  unplayedOnly?: boolean // playtimeForever === 0
  playedOnly?: boolean
  freeOnly?: boolean
  hasControllerSupport?: boolean

  /** Catalog-search only (store-native; the library engine ignores these). */
  maxPrice?: number // max price in the store's major currency unit; 0 = free only
  onSaleOnly?: boolean // Steam "Specials"
  hideFreeToPlay?: boolean

  /** Sorting + paging. */
  sortBy?: SortKey
  sortDir?: 'asc' | 'desc'
  limit?: number
}

const EMPTY_FILTER: FilterSpec = {}

export { EMPTY_FILTER }
export type { SortKey, NumberRange, FilterSpec }

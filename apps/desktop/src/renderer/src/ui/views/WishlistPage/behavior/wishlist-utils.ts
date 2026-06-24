import type { Game } from '@shared/library'
import type { SortOption } from '@ui/compounds/SortControls'

const WISHLIST_SORTS: SortOption[] = [
  { key: 'wishlistPriority', label: 'Wishlist rank' },
  { key: 'wishlistDate', label: 'Date added' },
  { key: 'name', label: 'Name' },
  { key: 'releaseYear', label: 'Release year' },
  { key: 'metacritic', label: 'Metacritic' },
  { key: 'reviewTotal', label: 'Reviews' },
]

const SYNC_INTERVAL_MS = 5 * 60_000
const RELOAD_THROTTLE_MS = 1500

/** A wishlist item is shown only once its metadata has been fetched (or proven to
 *  have no store page). Until then it's "pending" and surfaced via the warning bar. */
const isResolved = (g: Game): boolean =>
  g.enrichment === 'enriched' || g.enrichment === 'no-store-page'

const cardSubtitle = (g: Game): string => {
  if (g.releaseDate) return g.releaseDate
  if (g.releaseYear) return String(g.releaseYear)
  if (g.metacritic) return `Metacritic ${g.metacritic}`
  return ''
}

export { WISHLIST_SORTS, SYNC_INTERVAL_MS, RELOAD_THROTTLE_MS, isResolved, cardSubtitle }

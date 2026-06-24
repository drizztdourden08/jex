import type { SortOption } from '@ui/compounds/SortControls'

const DEBOUNCE_MS = 450
/** Pages fetched for Advanced mode's client-side filter (the "scanned" sample).
 *  10 × 10 = 100 results = two Steam 50-chunks (cached), so it's 2 network calls. */
const BUFFER_PAGES = 10

const CATALOG_SORTS: SortOption[] = [
  { key: 'name', label: 'Name' },
  { key: 'releaseYear', label: 'Release date' },
  { key: 'metacritic', label: 'Metacritic' },
  { key: 'reviewTotal', label: 'Reviews' },
]

const CATALOG_FEATURES = [
  'singleplayer',
  'multiplayer',
  'coop',
  'onlineCoop',
  'cloud',
  'controllerFull',
  'controllerPartial',
  'tradingCards',
  'workshop',
  'remotePlayTogether',
  'achievements',
]

const PRICE_TIERS: { label: string; value: number | undefined }[] = [
  { label: 'Any price', value: undefined },
  { label: 'Free', value: 0 },
  { label: 'Under $5', value: 5 },
  { label: 'Under $10', value: 10 },
  { label: 'Under $15', value: 15 },
  { label: 'Under $20', value: 20 },
  { label: 'Under $30', value: 30 },
  { label: 'Under $40', value: 40 },
  { label: 'Under $60', value: 60 },
]

export { DEBOUNCE_MS, BUFFER_PAGES, CATALOG_SORTS, CATALOG_FEATURES, PRICE_TIERS }

import type { WeightMode } from '@/lib/query/randomizer'
import type { ScopeKind } from '@shared/scope'

const WEIGHTS: { key: WeightMode; label: string }[] = [
  { key: 'uniform', label: 'Even odds' },
  { key: 'unplayed', label: 'Favor unplayed' },
  { key: 'short', label: 'Favor short' },
  { key: 'rated', label: 'Favor highly rated' },
]

/** The Randomizer's three base sources are exactly the base scopes (A6). */
type Source = ScopeKind

const SOURCES = [
  { value: 'library', label: 'Library' },
  { value: 'wishlist', label: 'Wishlist' },
  { value: 'store', label: 'Store' },
]

/** Feature keys Steam's catalog search can actually filter on (mirrors Search). */
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

export { WEIGHTS, SOURCES, CATALOG_FEATURES }
export type { Source }

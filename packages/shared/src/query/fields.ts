/**
 * Field catalog for the advanced query model: every filterable Game field,
 * grouped by category, plus the operator sets and labels per field type.
 */
import type { Game } from '../library'
import type { FieldDef, FieldType, QueryOp } from './types'

/** Field-picker category order. */
const FIELD_CATEGORIES = ['Status', 'Engagement', 'Details', 'Tags & genres', 'Scores'] as const

const FEATURE_OPTIONS = [
  { value: 'singleplayer', label: 'Single-player' },
  { value: 'multiplayer', label: 'Multiplayer' },
  { value: 'coop', label: 'Co-op' },
  { value: 'onlineCoop', label: 'Online co-op' },
  { value: 'cloud', label: 'Cloud saves' },
  { value: 'controllerFull', label: 'Full controller' },
  { value: 'controllerPartial', label: 'Partial controller' },
  { value: 'tradingCards', label: 'Trading cards' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'vr', label: 'VR' },
  { value: 'remotePlayTogether', label: 'Remote Play Together' },
  { value: 'antiCheat', label: 'Anti-cheat' },
  { value: 'achievements', label: 'Achievements' },
]

const activeFeatureKeys = (g: Game): string[] =>
  g.features ? Object.entries(g.features).filter(([, v]) => v).map(([k]) => k) : []

const activePlatforms = (g: Game): string[] =>
  (['windows', 'mac', 'linux'] as const).filter((p) => g.platforms?.[p])

/** Every filterable field in the Game schema, grouped by category for the picker. */
const FIELD_DEFS: FieldDef[] = [
  // Status
  { key: 'installed', label: 'Installed', type: 'boolean', category: 'Status', get: (g) => g.installed },
  { key: 'owned', label: 'Owned', type: 'boolean', category: 'Status', get: (g) => g.owned },
  { key: 'wishlisted', label: 'Wishlisted', type: 'boolean', category: 'Status', get: (g) => g.wishlisted },
  { key: 'isFree', label: 'Free', type: 'boolean', category: 'Status', get: (g) => g.isFree },
  {
    key: 'enrichment',
    label: 'Metadata status',
    type: 'enum',
    category: 'Status',
    options: [
      { value: 'owned-only', label: 'Not fetched' },
      { value: 'enriched', label: 'Enriched' },
      { value: 'failed', label: 'Failed' },
      { value: 'no-store-page', label: 'No store page' },
    ],
    get: (g) => g.enrichment,
  },

  // Engagement
  { key: 'playtimeForever', label: 'Playtime', type: 'number', unit: 'min', category: 'Engagement', get: (g) => g.playtimeForever },
  { key: 'playtime2weeks', label: 'Playtime (2 weeks)', type: 'number', unit: 'min', category: 'Engagement', get: (g) => g.playtime2weeks },
  { key: 'lastPlayed', label: 'Last played', type: 'number', unit: 'unix', category: 'Engagement', get: (g) => g.lastPlayed },
  { key: 'currentPlayers', label: 'Players now', type: 'number', category: 'Engagement', get: (g) => g.currentPlayers },
  { key: 'wishlistPriority', label: 'Wishlist rank', type: 'number', category: 'Engagement', get: (g) => g.wishlistPriority },
  { key: 'wishlistedAt', label: 'Wishlisted date', type: 'number', unit: 'unix', category: 'Engagement', get: (g) => g.wishlistedAt },

  // Details
  { key: 'name', label: 'Name', type: 'string', category: 'Details', get: (g) => g.name },
  { key: 'shortDescription', label: 'Description', type: 'string', category: 'Details', get: (g) => g.shortDescription },
  { key: 'developers', label: 'Developers', type: 'stringArray', facet: 'developers', category: 'Details', get: (g) => g.developers },
  { key: 'publishers', label: 'Publishers', type: 'stringArray', facet: 'publishers', category: 'Details', get: (g) => g.publishers },
  { key: 'releaseYear', label: 'Release year', type: 'number', category: 'Details', get: (g) => g.releaseYear },
  { key: 'sizeOnDisk', label: 'Size on disk', type: 'number', unit: 'bytes', category: 'Details', get: (g) => g.sizeOnDisk },
  { key: 'dlcCount', label: 'DLC count', type: 'number', category: 'Details', get: (g) => g.dlcCount },
  { key: 'ageRating', label: 'Age rating', type: 'enum', category: 'Details', get: (g) => g.ageRating },
  {
    key: 'controllerSupport',
    label: 'Controller support',
    type: 'enum',
    category: 'Details',
    options: [
      { value: 'full', label: 'Full' },
      { value: 'partial', label: 'Partial' },
    ],
    get: (g) => g.controllerSupport,
  },

  // Tags & genres
  { key: 'genres', label: 'Genres', type: 'stringArray', facet: 'genres', category: 'Tags & genres', get: (g) => g.genres },
  { key: 'categories', label: 'Categories', type: 'stringArray', facet: 'categories', category: 'Tags & genres', get: (g) => g.categories },
  { key: 'tags', label: 'Tags', type: 'stringArray', facet: 'tags', category: 'Tags & genres', get: (g) => g.tags },
  { key: 'languages', label: 'Languages', type: 'stringArray', facet: 'languages', category: 'Tags & genres', get: (g) => g.languages },
  { key: 'features', label: 'Features', type: 'enumArray', options: FEATURE_OPTIONS, category: 'Tags & genres', get: activeFeatureKeys },
  {
    key: 'platforms',
    label: 'Platforms',
    type: 'enumArray',
    category: 'Tags & genres',
    options: [
      { value: 'windows', label: 'Windows' },
      { value: 'mac', label: 'macOS' },
      { value: 'linux', label: 'Linux' },
    ],
    get: activePlatforms,
  },

  // Scores
  { key: 'metacritic', label: 'Metacritic', type: 'number', unit: '%', category: 'Scores', get: (g) => g.metacritic },
  { key: 'metacriticUser', label: 'Metacritic user', type: 'number', category: 'Scores', get: (g) => g.metacriticUser },
  { key: 'reviewPercent', label: 'Review % positive', type: 'number', unit: '%', category: 'Scores', get: (g) => g.reviews?.overall?.percent },
  { key: 'reviewTotal', label: 'Review count', type: 'number', category: 'Scores', get: (g) => g.reviewTotal },
]

const FIELD_MAP = new Map(FIELD_DEFS.map((d) => [d.key, d]))

/** Operators offered for each field type (first is the sensible default). */
const OPS_BY_TYPE: Record<FieldType, QueryOp[]> = {
  number: ['gte', 'lte', 'eq', 'neq', 'gt', 'lt', 'exists', 'notExists'],
  string: ['contains', 'notContains', 'eq', 'neq', 'exists', 'notExists'],
  enum: ['eq', 'neq', 'exists', 'notExists'],
  boolean: ['isTrue', 'isFalse'],
  stringArray: ['any', 'all', 'none', 'exists', 'notExists'],
  enumArray: ['any', 'all', 'none'],
}

const OP_LABELS: Record<QueryOp, string> = {
  eq: 'is',
  neq: 'is not',
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
  contains: 'contains',
  notContains: "doesn't contain",
  any: 'has any of',
  all: 'has all of',
  none: 'has none of',
  isTrue: 'is yes',
  isFalse: 'is no',
  exists: 'is set',
  notExists: 'is not set',
}

/** Ops that need no value editor. */
const VALUELESS_OPS = new Set<QueryOp>(['isTrue', 'isFalse', 'exists', 'notExists'])

export {
  FIELD_CATEGORIES,
  FEATURE_OPTIONS,
  activeFeatureKeys,
  activePlatforms,
  FIELD_DEFS,
  FIELD_MAP,
  OPS_BY_TYPE,
  OP_LABELS,
  VALUELESS_OPS,
}

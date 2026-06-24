import { FIELD_DEFS } from '@jex/shared/query/index'

const FIELD_KEYS = FIELD_DEFS.map((d) => d.key)
const ALL_OPS = [
  'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'notContains',
  'any', 'all', 'none', 'isTrue', 'isFalse', 'exists', 'notExists',
]
const TABS = ['library', 'wishlist', 'randomizer', 'store', 'search', 'settings'] as const

export { FIELD_KEYS, ALL_OPS, TABS }

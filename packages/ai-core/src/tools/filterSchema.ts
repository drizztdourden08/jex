import type { JsonSchema } from './registry'
import { FEATURE_KEYS } from '../parse'

/**
 * JSON schema for a FilterSpec, used as the `params` for filter-shaped tools
 * (apply_filter, query_library). It mirrors what `sanitize()` accepts so the
 * grammar-constrained model can only express filters the engine supports. All
 * fields are optional — the model includes only what the request needs.
 */
const FILTER_SPEC_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    text: {
      type: 'string',
      description:
        "ONLY a game's NAME (or part of it), e.g. \"hades\". NEVER put a genre/category/tag/feature word here (use genres/categories/tags/features instead). Leave empty unless searching by title.",
    },
    genres: { type: 'array', items: { type: 'string' }, description: 'e.g. RPG, Action, Indie.' },
    categories: { type: 'array', items: { type: 'string' }, description: 'Steam category names. For local/couch co-op use "Shared/Split Screen Co-op" or "Shared/Split Screen" — NOT the generic "Co-op" category (which is online). e.g. "Online Co-op", "Shared/Split Screen Co-op".' },
    tags: { type: 'array', items: { type: 'string' }, description: 'e.g. Roguelike, Metroidvania, Cozy.' },
    developers: { type: 'array', items: { type: 'string' } },
    publishers: { type: 'array', items: { type: 'string' } },
    playtimeForeverMin: { type: 'number', description: 'Minutes.' },
    playtimeForeverMax: { type: 'number', description: 'Minutes.' },
    releaseYear: {
      type: 'object',
      properties: { min: { type: 'number' }, max: { type: 'number' } },
    },
    metacriticMin: { type: 'number', description: '0-100.' },
    reviewPercentMin: { type: 'number', description: '0-100 Steam positive %.' },
    features: {
      type: 'array',
      items: { enum: [...FEATURE_KEYS] },
      description:
        'ALL listed features must be present (AND logic). For OR logic (e.g. controllerFull OR controllerPartial), use apply_advanced_filter with op "any" instead. Controller support = controllerFull alone. Do NOT combine with hasControllerSupport.',
    },
    platforms: { type: 'array', items: { enum: ['windows', 'mac', 'linux'] } },
    installedOnly: { type: 'boolean' },
    unplayedOnly: { type: 'boolean' },
    playedOnly: { type: 'boolean' },
    freeOnly: { type: 'boolean' },
    hasControllerSupport: {
      type: 'boolean',
      description: 'Legacy controller check. Prefer features:["controllerFull"] instead.',
    },
    sortBy: {
      enum: [
        'name',
        'playtimeForever',
        'playtime2weeks',
        'releaseYear',
        'metacritic',
        'reviewTotal',
        'random',
      ],
    },
    sortDir: { enum: ['asc', 'desc'] },
    limit: { type: 'number' },
  },
}

/**
 * Scope properties for the scope-aware verbs (apply_filter, query_library, sort,
 * clear, advanced). Kept separate from FILTER_SPEC_SCHEMA so the filters embedded
 * in roll_randomizer / create_wishlist_group (which have their own scope) don't
 * advertise these.
 */
const SCOPE_PROPS = {
  scope: {
    enum: ['library', 'wishlist'],
    description:
      'Which collection to act on: "library" (games you own — DEFAULT) or "wishlist" (games on your Steam wishlist). Use "wishlist" for requests like "my roguelikes in my wishlist".',
  },
  group: {
    type: 'number',
    description:
      'Optional sub-wishlist (group) id to scope to — implies wishlist. Get ids from list_wishlist_groups.',
  },
} as const

/** FilterSpec params + scope, for the scope-aware show/count verbs. */
const SCOPED_FILTER_SCHEMA: JsonSchema = {
  type: 'object',
  properties: { ...FILTER_SPEC_SCHEMA.properties, ...SCOPE_PROPS },
}

/**
 * Catalog-search params for search_store. Reuses the SAME FilterSpec field names
 * (genres/tags/categories/features/platforms) so the model has ONE filter
 * vocabulary across library and store, but exposes ONLY the fields Steam's catalog
 * search can actually apply (+ price/sale) — library-only fields like playtime,
 * scores, and release-year are omitted because the catalog ignores them.
 */
const STORE_FILTER_SCHEMA: JsonSchema = {
  type: 'object',
  properties: {
    text: FILTER_SPEC_SCHEMA.properties.text,
    genres: FILTER_SPEC_SCHEMA.properties.genres,
    tags: FILTER_SPEC_SCHEMA.properties.tags,
    categories: FILTER_SPEC_SCHEMA.properties.categories,
    features: FILTER_SPEC_SCHEMA.properties.features,
    platforms: FILTER_SPEC_SCHEMA.properties.platforms,
    freeOnly: { type: 'boolean', description: 'Only free-to-play / $0 titles.' },
    maxPrice: {
      type: 'number',
      description:
        'Max price in the store currency, ONLY when the user gave a budget (e.g. 20 for "under $20"). Omit it otherwise — do NOT send 0. For free games use freeOnly:true instead.',
    },
    onSaleOnly: { type: 'boolean', description: 'Only titles currently on sale (Specials).' },
    sortBy: {
      enum: ['name', 'releaseYear', 'metacritic', 'reviewTotal'],
      description:
        'How to order results. For "acclaimed/best/highly-rated" use "metacritic"; for "most popular/most-reviewed" use "reviewTotal". Omit for relevance.',
    },
    limit: { type: 'number', description: 'Max results to return (default 10, max 10).' },
  },
}

export { FILTER_SPEC_SCHEMA, SCOPE_PROPS, SCOPED_FILTER_SCHEMA, STORE_FILTER_SCHEMA }

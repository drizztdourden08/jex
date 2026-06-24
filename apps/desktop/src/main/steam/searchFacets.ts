import type { FilterSpec } from '@shared/filter'
import { CATEGORY_PARAMS, FEATURE_TO_CATEGORY, tagIdMap } from './searchVocab'

/**
 * Translate a FilterSpec's facets + sort into Steam store-search query params
 * (mutates `params` in place). Kept separate from search.ts so it's unit-testable.
 *
 * Mapping (see searchVocab.ts):
 * - genres + tags → numeric tagids (`tags=`), resolved via the synced vocab.
 * - categories + features → `category2` (features) / `category3` (play modes) ids.
 * - platforms → `os`; freeOnly → `maxprice=free`; sort → `sort_by`.
 *
 * Steam ANDs every facet value (a row must match all listed tags/categories) —
 * slightly stricter than the library engine's within-facet OR, but the natural
 * reading for catalog discovery. Library-only concepts the catalog can't express
 * (metacritic/review%/release-year/playtime/install flags) are simply ignored.
 */

const SORT_MAP: Record<string, string> = {
  name: 'Name_ASC',
  releaseYear: 'Released_DESC',
  metacritic: 'Metascore_DESC',
  reviewTotal: 'Reviews_DESC',
}

/** Strip case + punctuation so name variants collapse: "Souls-like" / "Soulslike" /
 *  "souls like" → "soulslike"; "Open-World" → "openworld"; "4X" → "4x". */
const normalize = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '')

/** Stem/synonym aliases the normalizer alone misses (normalized → canonical normalized). */
const TAG_ALIASES: Record<string, string> = {
  deckbuilder: 'deckbuilding',
  roguelikes: 'roguelike',
  roguelites: 'roguelite',
}

/**
 * Resolve a genre/tag NAME to its Steam tagid, tolerating case/punctuation/plural/
 * synonym variants against the synced vocab — so the model can pass natural names
 * ("Soulslike", "Open-World", "RPGs", "deckbuilder") and still hit the right id without
 * the caller needing to know Steam's exact casing. Returns undefined if truly unknown.
 */
const resolveTagId = (name: string, exact: Map<string, number>, norm: Map<string, number>): number | undefined => {
  const lc = name.toLowerCase()
  if (exact.has(lc)) return exact.get(lc)
  const n = normalize(name)
  const aliased = TAG_ALIASES[n]
  return norm.get(n) ?? (aliased ? norm.get(aliased) : undefined) ?? (n.endsWith('s') ? norm.get(n.slice(0, -1)) : undefined)
}

const buildFacetParams = (
  spec: FilterSpec | undefined,
  params: URLSearchParams,
  tagMap: Map<string, number> = tagIdMap(),
): void => {
  if (!spec) return

  // ── Tags + genres → tagids (fuzzy-resolved against the synced vocab) ───────
  const normMap = new Map<string, number>()
  for (const [name, id] of tagMap) if (!normMap.has(normalize(name))) normMap.set(normalize(name), id)
  const tagIds = new Set<number>()
  for (const name of [...(spec.genres ?? []), ...(spec.tags ?? [])]) {
    const id = resolveTagId(name, tagMap, normMap)
    if (id != null) tagIds.add(id)
  }
  if (tagIds.size) params.set('tags', [...tagIds].join(','))

  // ── Categories + features → category2 / category3 ─────────────────────────
  const cat2 = new Set<number>()
  const cat3 = new Set<number>()
  const catNorm = new Map<string, { param: 'category2' | 'category3'; id: number }>()
  for (const [k, v] of Object.entries(CATEGORY_PARAMS)) catNorm.set(normalize(k), v)
  const addCategory = (name?: string) => {
    if (!name) return
    const hit = CATEGORY_PARAMS[name.toLowerCase()] ?? catNorm.get(normalize(name))
    if (!hit) return
    ;(hit.param === 'category2' ? cat2 : cat3).add(hit.id)
  }
  for (const name of spec.categories ?? []) addCategory(name)
  for (const key of spec.features ?? []) addCategory(FEATURE_TO_CATEGORY[key])
  if (spec.hasControllerSupport) addCategory('Full controller support')
  if (cat2.size) params.set('category2', [...cat2].join(','))
  if (cat3.size) params.set('category3', [...cat3].join(','))

  // ── Sort (server-side, across the whole catalog) ──────────────────────────
  const sort = spec.sortBy ? SORT_MAP[spec.sortBy] : undefined
  if (sort) params.set('sort_by', sort)

  // ── Platform + price + sales ──────────────────────────────────────────────
  if (spec.platforms?.length) {
    params.set('os', spec.platforms.map((p) => (p === 'windows' ? 'win' : p)).join(','))
  }
  // maxprice accepts 'free' or a number in the store's major currency unit.
  if (spec.freeOnly || spec.maxPrice === 0) params.set('maxprice', 'free')
  else if (spec.maxPrice && spec.maxPrice > 0) params.set('maxprice', String(spec.maxPrice))
  if (spec.onSaleOnly) params.set('specials', '1')
  if (spec.hideFreeToPlay) params.set('hidef2p', '1')
}

export { buildFacetParams }

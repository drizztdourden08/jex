import { host } from '../host'
import { registerTool } from './registry'
import { STORE_FILTER_SCHEMA } from './filterSchema'
import { FEATURE_KEYS } from '../parse'
import type { FilterSpec } from '@jex/shared/filter'
import type { SearchResult } from '@jex/shared/search'

/** Compact projection of a catalog hit, plus whether the user already has it. */
const brief = (r: SearchResult): Record<string, unknown> => {
  const g = host().db.getGame(r.appid)
  return {
    appid: r.appid,
    name: r.name,
    released: r.released,
    // Flag unreleased titles — they can't be "critically acclaimed" or "already played",
    // so a recommendation should skip them.
    comingSoon: /coming soon|to be announced|\bTBA\b|unreleased/i.test(r.released ?? '') || undefined,
    price: r.priceText,
    reviews: r.review?.desc,
    reviewPercent: r.review?.percent,
    inLibrary: g ? g.owned || g.installed : false,
    wishlisted: g?.wishlisted ?? false,
  }
}

const toArray = (v: unknown): string[] | undefined =>
  Array.isArray(v) ? v.map(String).filter(Boolean) : undefined

const PLATFORMS = ['windows', 'mac', 'linux'] as const

const toPlatforms = (v: unknown): FilterSpec['platforms'] => {
  const list = toArray(v)?.filter((p): p is (typeof PLATFORMS)[number] =>
    PLATFORMS.includes(p as (typeof PLATFORMS)[number]),
  )
  return list?.length ? list : undefined
}

/**
 * Whole-catalog Steam search for the agent — distinct from `search_games`, which
 * only looks inside the user's owned library. Use this to find/recommend games the
 * user does NOT own (new releases, by genre/tag/feature, on sale, etc.).
 */
const registerSearchTools = (): void => {
  registerTool({
    name: 'search_store',
    description:
      'Search the WHOLE Steam catalog (not just the library) to discover or recommend games — by name, genre, tag, feature, platform, price (maxPrice/freeOnly/onSaleOnly), or sort. For "best/acclaimed/highly-rated" recommendations, sort instead of rolling the randomizer: sortBy:"metacritic" (or "reviewTotal" for most-reviewed/popular) with sortDir:"desc". Uses the same genre/tag/category/feature vocabulary as apply_filter. Each result includes appid, price, reviews, and inLibrary/wishlisted flags — for "games I never played / don\'t own", keep only inLibrary:false. Use search_games instead for games the user already owns. (Library-only filters like playtime, scores, and release year are not available on the catalog.)',
    category: 'store',
    sensitivity: 'safe',
    surface: 'main',
    params: STORE_FILTER_SCHEMA,
    run: async (args) => {
      const spec: FilterSpec = {
        genres: toArray(args.genres),
        tags: toArray(args.tags),
        categories: toArray(args.categories),
        features: toArray(args.features)?.filter((f) => FEATURE_KEYS.includes(f)),
        platforms: toPlatforms(args.platforms),
        freeOnly: args.freeOnly === true || undefined,
        // Treat 0/negative as "no price cap" (NOT free-only) — a stray maxPrice:0 from
        // the model must not silently restrict a recommendation to free games. Free-only
        // is expressed explicitly via freeOnly:true.
        maxPrice:
          typeof args.maxPrice === 'number' && args.maxPrice > 0 ? args.maxPrice : undefined,
        onSaleOnly: args.onSaleOnly === true || undefined,
        sortBy: args.sortBy as FilterSpec['sortBy'],
      }
      const text = typeof args.text === 'string' ? args.text : undefined
      // Catalog page 0 returns at most SEARCH_PAGE_SIZE (10) rows, so cap there.
      const limit = Math.max(1, Math.min(10, Number(args.limit) || 10))
      const res = await host().steam.searchCatalog(
        { text, spec, page: 0 },
        (host().settings.get('storeCountry') as string) || undefined,
      )
      const results = res.results.slice(0, limit).map(brief)
      return {
        total: res.total,
        results,
        // The model tends to re-search hunting for "more famous" titles instead of
        // answering. Tell it, in the data it reliably reads, to commit to these.
        note: results.length
          ? 'These are your matches. Recommend the best not-owned, released ones from THIS list now — do NOT search again for other or more-famous titles.'
          : 'No matches. Try ONE broader query (fewer filters), then answer — do not keep searching.',
      }
    },
  })
}

export { registerSearchTools }

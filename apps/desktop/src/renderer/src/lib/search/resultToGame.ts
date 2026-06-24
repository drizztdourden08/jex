import { emptyGame, type Game } from '@shared/library'
import type { SearchResult, SearchVocab } from '@shared/search'

/**
 * Reconstruct a partial `Game` from a catalog SearchResult so the Advanced query
 * engine (evaluateNode) can filter it client-side. Search rows only carry tag IDs,
 * price, review %, release date, and platforms — so only those fields are populated
 * (conditions on other fields, e.g. playtime or Metacritic, simply won't match).
 */
const resultToGame = (
  r: SearchResult,
  tagNameById: Map<number, string>,
  genreSet: Set<string>,
): Game => {
  const tags = (r.tagIds ?? [])
    .map((id) => tagNameById.get(id))
    .filter((n): n is string => !!n)
  const year = r.released?.match(/(\d{4})/)?.[1]
  return {
    ...emptyGame(r.appid, r.name),
    genres: tags.filter((t) => genreSet.has(t)),
    tags,
    releaseYear: year ? Number(year) : undefined,
    isFree: r.priceCents === 0,
    platforms: {
      windows: !!r.platforms?.windows,
      mac: !!r.platforms?.mac,
      linux: !!r.platforms?.linux,
    },
    reviews:
      r.review?.percent != null
        ? {
            overall: { desc: r.review.desc, percent: r.review.percent, total: r.review.total ?? 0 },
            recent: null,
          }
        : undefined,
    enrichment: 'enriched',
  }
}

/** Build the (tagId → name) map and genre-name set from the synced vocab. */
const vocabMaps = (
  vocab: SearchVocab | null,
): {
  tagNameById: Map<number, string>
  genreSet: Set<string>
} => {
  const tagNameById = new Map<number, string>()
  if (vocab) for (const t of vocab.tags) tagNameById.set(t.id, t.name)
  const genreSet = new Set((vocab?.genres ?? []).map((g) => g))
  return { tagNameById, genreSet }
}

export { resultToGame, vocabMaps }

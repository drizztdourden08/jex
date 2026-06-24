import { host } from '../../host'
import { registerTool } from '../registry'
import { facetCounts } from './helpers'
import { FEATURE_KEYS } from '../../parse'
import type { Game } from '@jex/shared/library/index'

const MIN_PLAYED_MIN = 120 // a game counts as "played" once it has ≥ 2h
const SECONDS_PER_DAY = 86400
const TOP_N = 10
type Facet = 'genres' | 'categories' | 'tags'

/** Top-N values of an array facet by how many GAMES have them (hours ignored). */
const topFacet = (games: Game[], key: Facet, n: number) =>
  facetCounts(games, key)
    .slice(0, n)
    .map(([value, count]) => ({ value, count }))

/** Top-N feature flags by how many games have each flag set. */
const topFeatures = (games: Game[], n: number) =>
  FEATURE_KEYS.map((k) => {
    let count = 0
    for (const g of games) if ((g.features as Record<string, boolean> | undefined)?.[k]) count++
    return { value: k, count }
  })
    .filter((f) => f.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, n)

const titles = (games: Game[], n: number) =>
  games.slice(0, n).map((g) => ({ name: g.name, hours: Math.round(g.playtimeForever / 60) }))

/** Aggregate the played library by GAME COUNT (each ≥2h game counts once). */
const libraryTaste = (all: Game[]): Record<string, unknown> => {
  const played = all.filter((g) => g.playtimeForever >= MIN_PLAYED_MIN)
  if (!played.length) {
    return { scope: 'library', threshold: '≥2h played', playedCount: 0, ownedCount: all.filter((g) => g.owned).length, note: 'No games with 2h+ played yet — ask about preferences or recommend broadly.' }
  }
  const now = Math.floor(Date.now() / 1000)
  const recent = played.filter((g) => g.lastPlayed && g.lastPlayed >= now - 730 * SECONDS_PER_DAY)
  return {
    scope: 'library',
    threshold: '≥2h played',
    playedCount: played.length,
    // All ranked by GAME COUNT — each game counts once, hours are NOT weighted.
    topGenres: topFacet(played, 'genres', TOP_N),
    topTags: topFacet(played, 'tags', TOP_N),
    topCategories: topFacet(played, 'categories', TOP_N),
    topFeatures: topFeatures(played, TOP_N),
    mostPlayed: titles([...played].sort((a, b) => b.playtimeForever - a.playtimeForever), 8),
    recent: {
      window: 'games played in the last ~2 years',
      playedCount: recent.length,
      topGenres: topFacet(recent, 'genres', TOP_N),
    },
  }
}

/** Aggregate the wishlist by game count (no playtime exists for unowned games). */
const wishlistTaste = (all: Game[]): Record<string, unknown> => {
  const wl = all.filter((g) => g.wishlisted)
  if (!wl.length) return { scope: 'wishlist', count: 0, note: 'Wishlist is empty.' }
  return {
    scope: 'wishlist',
    count: wl.length,
    topGenres: topFacet(wl, 'genres', TOP_N),
    topTags: topFacet(wl, 'tags', TOP_N),
    topCategories: topFacet(wl, 'categories', TOP_N),
    topFeatures: topFeatures(wl, TOP_N),
  }
}

/**
 * One-call analysis of the user's preferences — the go-to tool for ANY "what do I like /
 * top genres / my taste / what's on my wishlist" question. Computed server-side over the
 * WHOLE collection (never a 10-row sample), so the model never pages the library or
 * hand-counts games (which makes weak models loop). Counts each PLAYED game once (≥2h
 * playtime; hours are NOT weighted) and returns the top 10 genres, tags, categories, and
 * features by game count.
 */
const registerTasteTool = (): void => {
  registerTool({
    name: 'taste_profile',
    description:
      "Analyze the user's preferences in ONE call — use this for ANY question about their taste, top genres/tags/categories/features, or what's on their wishlist, INSTEAD of listing or counting games yourself. Counts each PLAYED game once (games with 2h+ playtime; hours are NOT weighted) and returns the top 10 genres, tags, categories, and features by how many games have them, plus the most-played titles and a recent (last ~2 years) view. scope:\"library\" (default) or scope:\"wishlist\" (analyzes all wishlisted games). Covers the whole collection, not a sample. Read-only.",
    category: 'library',
    sensitivity: 'safe',
    surface: 'main',
    params: {
      type: 'object',
      properties: { scope: { enum: ['library', 'wishlist'], description: 'Which collection to analyze (default library).' } },
    },
    run: async (args) => {
      const all = host().db.getAllGames()
      return args.scope === 'wishlist' ? wishlistTaste(all) : libraryTaste(all)
    },
  })
}

export { registerTasteTool }

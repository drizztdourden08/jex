import type { Game, GameFeatures } from './library'
import type { FilterSpec, SortKey } from './filter'

/**
 * The FilterSpec engine — pure, isomorphic, no I/O. Lives in @shared so BOTH the
 * renderer (Library/Wishlist/Randomizer views) and main (library tools, wishlist-
 * group match counts) apply filters through one implementation. Keep it free of
 * electron/node/DOM.
 */
const applyFilter = (games: Game[], spec: FilterSpec): Game[] => {
  let out = games.filter((g) => matches(g, spec))
  out = sortGames(out, spec.sortBy, spec.sortDir)
  if (spec.limit && spec.limit > 0) out = out.slice(0, spec.limit)
  return out
}

const matches = (g: Game, spec: FilterSpec): boolean => {
  if (spec.text) {
    const q = spec.text.toLowerCase()
    const hay = `${g.name} ${g.shortDescription ?? ''}`.toLowerCase()
    if (!hay.includes(q)) return false
  }

  if (!facetMatch(g.genres, spec.genres)) return false
  if (!facetMatch(g.categories, spec.categories)) return false
  if (!facetMatch(g.tags, spec.tags)) return false
  if (!facetMatch(g.developers, spec.developers)) return false
  if (!facetMatch(g.publishers, spec.publishers)) return false

  if (spec.playtimeForeverMin != null && g.playtimeForever < spec.playtimeForeverMin)
    return false
  if (spec.playtimeForeverMax != null && g.playtimeForever > spec.playtimeForeverMax)
    return false

  if (spec.releaseYear?.min != null && (g.releaseYear ?? -Infinity) < spec.releaseYear.min)
    return false
  if (spec.releaseYear?.max != null && (g.releaseYear ?? Infinity) > spec.releaseYear.max)
    return false

  if (spec.metacriticMin != null && (g.metacritic ?? -1) < spec.metacriticMin) return false

  if (spec.reviewPercentMin != null && (g.reviews?.overall?.percent ?? -1) < spec.reviewPercentMin)
    return false

  if (spec.platforms?.length) {
    for (const p of spec.platforms) {
      if (!g.platforms[p]) return false
    }
  }

  if (spec.features?.length) {
    for (const f of spec.features) {
      if (!g.features?.[f as keyof GameFeatures]) return false
    }
  }

  if (spec.installedOnly && !g.installed) return false
  if (spec.unplayedOnly && g.playtimeForever > 0) return false
  if (spec.playedOnly && g.playtimeForever === 0) return false
  if (spec.freeOnly && !g.isFree) return false
  if (spec.hasControllerSupport && !g.controllerSupport) return false

  return true
}

/** Case-insensitive OR match of a multi-valued field against requested values. */
const facetMatch = (field: string[], wanted?: string[]): boolean => {
  if (!wanted?.length) return true
  const lower = field.map((v) => v.toLowerCase())
  return wanted.some((w) => lower.includes(w.toLowerCase()))
}

const sortGames = (games: Game[], sortBy?: SortKey, dir: 'asc' | 'desc' = 'desc'): Game[] => {
  if (!sortBy || sortBy === 'random') return games
  const mult = dir === 'asc' ? 1 : -1
  const get = (g: Game): number | string => {
    switch (sortBy) {
      case 'name':
        return g.name.toLowerCase()
      case 'playtimeForever':
        return g.playtimeForever
      case 'playtime2weeks':
        return g.playtime2weeks
      case 'lastPlayed':
        return g.lastPlayed ?? 0
      case 'releaseYear':
        return g.releaseYear ?? 0
      case 'metacritic':
        return g.metacritic ?? 0
      case 'reviewTotal':
        return g.reviewTotal ?? 0
      case 'wishlistPriority':
        // 0 = top of the wishlist; un-ranked items sort to the bottom (asc) /
        // top (desc) — push them to the far end either way.
        return g.wishlistPriority ?? Number.MAX_SAFE_INTEGER
      case 'wishlistDate':
        return g.wishlistedAt ?? 0
    }
  }
  return [...games].sort((a, b) => {
    const va = get(a)
    const vb = get(b)
    if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * mult
    return ((va as number) - (vb as number)) * mult
  })
}

/** Distinct, frequency-sorted facet values across the library (for filter UI). */
const facetValues = (games: Game[], key: 'genres' | 'categories' | 'tags'): string[] => {
  const counts = new Map<string, number>()
  for (const g of games) {
    for (const v of g[key]) counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v)
}

export { applyFilter, matches, facetValues }

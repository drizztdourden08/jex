import type { Game } from '@jex/shared/library/index'

/** Count distinct values of an array-valued facet across the library. */
const facetCounts = (games: Game[], key: 'genres' | 'categories' | 'tags'): [string, number][] => {
  const counts = new Map<string, number>()
  for (const g of games) for (const v of g[key] ?? []) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

/** A compact projection of a Game — keeps the model's context small. */
const brief = (g: Game): Record<string, unknown> => {
  return {
    appid: g.appid,
    name: g.name,
    installed: g.installed,
    owned: g.owned,
    playtimeHours: Math.round((g.playtimeForever / 60) * 10) / 10,
    genres: g.genres?.slice(0, 6),
    releaseYear: g.releaseYear ?? undefined,
    metacritic: g.metacritic ?? undefined,
  }
}

export { facetCounts, brief }

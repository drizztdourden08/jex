import type { Game } from '@shared/library'
import type { FilterSpec } from '@shared/filter'
import { applyFilter } from '@shared/filterApply'

type WeightMode = 'uniform' | 'unplayed' | 'short' | 'rated'

interface RandomOptions {
  count?: number
  /** appids to exclude from the pool (reroll-without-repeats / "not this one"). */
  exclude?: number[]
  weight?: WeightMode
}

interface RandomResult {
  picks: Game[]
  poolSize: number
}

/**
 * Pick N games matching a FilterSpec's criteria (sort/limit ignored — randomness
 * is the point), optionally weighted and excluding given appids. Weighting uses
 * the Efraimidis–Spirakis scheme (key = U^(1/weight)) for correct weighted
 * sampling without replacement.
 */
const randomPick = (
  games: Game[],
  spec: FilterSpec = {},
  opts: RandomOptions = {},
): RandomResult => {
  const { count = 1, exclude = [], weight = 'uniform' } = opts
  const { sortBy: _s, sortDir: _d, limit: _l, ...criteria } = spec
  void _s
  void _d
  void _l
  const excluded = new Set(exclude)
  const pool = applyFilter(games, criteria).filter((g) => !excluded.has(g.appid))
  const picks = weightedSample(pool, Math.min(count, pool.length), weightOf(weight))
  return { picks, poolSize: pool.length }
}

const weightOf = (mode: WeightMode): ((g: Game) => number) => {
  switch (mode) {
    case 'unplayed':
      return (g) => (g.playtimeForever === 0 ? 4 : 1)
    case 'short':
      return (g) => 1 / (1 + g.playtimeForever / 60) // favor fewer hours played
    case 'rated':
      return (g) => Math.max(0.2, (g.metacritic ?? 50) / 50)
    default:
      return () => 1
  }
}

const weightedSample = (pool: Game[], n: number, weight: (g: Game) => number): Game[] => {
  return pool
    .map((g) => ({ g, key: Math.random() ** (1 / Math.max(1e-6, weight(g))) }))
    .sort((a, b) => b.key - a.key)
    .slice(0, n)
    .map((x) => x.g)
}

export { randomPick }
export type { WeightMode, RandomOptions, RandomResult }

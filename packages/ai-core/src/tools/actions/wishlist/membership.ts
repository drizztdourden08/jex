import { host } from '../../../host'
import { applyFilter } from '@jex/shared/filterApply'
import { describeFilters } from '@jex/shared/filterSummary'
import type { Game } from '@jex/shared/library/game'
import type { FilterSpec } from '@jex/shared/filter'
import type { WishlistGroup } from '@jex/shared/wishlist'

/** Every wishlisted game (including not-yet-enriched ones). */
const wishlistedGames = (): Game[] => host().db.getAllGames().filter((g) => g.wishlisted)

/** How many wishlisted games a filter matches (feedback so the model can self-correct). */
const wishlistMatchCount = (spec: FilterSpec): number =>
  applyFilter(wishlistedGames(), { ...spec, limit: undefined }).length

/** A group's members: smart-filter matches ∪ manual pins, restricted to the wishlist. */
const groupMembers = (group: WishlistGroup): Game[] => {
  const all = wishlistedGames()
  const manual = new Set(group.manualAppids)
  const matched = group.filterSpec ? new Set(applyFilter(all, { ...group.filterSpec, limit: undefined }).map((g) => g.appid)) : new Set<number>()
  return all.filter((g) => manual.has(g.appid) || matched.has(g.appid))
}

const groupMode = (g: WishlistGroup): 'manual' | 'filter' | 'filter+manual' => {
  if (g.filterSpec && g.manualAppids.length) return 'filter+manual'
  return g.filterSpec ? 'filter' : 'manual'
}

const filterSummary = (spec: FilterSpec | null): string | null =>
  spec ? describeFilters(spec).join('; ') || 'any game' : null

/** Compact game row for the model. */
const gameRow = (g: Game) => ({
  appid: g.appid,
  name: g.name,
  release: g.releaseDate ?? g.releaseYear ?? null,
  genres: g.genres.slice(0, 4),
  free: g.isFree ?? undefined,
  metacritic: g.metacritic ?? undefined,
  reviewPercent: g.reviews?.overall?.percent ?? undefined,
})

/** Slice a list into a 1-based page. */
const paginate = <T>(items: T[], page: unknown, size = 30) => {
  const pages = Math.max(1, Math.ceil(items.length / size))
  const p = Math.min(pages, Math.max(1, Math.floor(Number(page)) || 1))
  return { page: p, pages, total: items.length, items: items.slice((p - 1) * size, p * size) }
}

export { wishlistedGames, wishlistMatchCount, groupMembers, groupMode, filterSummary, gameRow, paginate }

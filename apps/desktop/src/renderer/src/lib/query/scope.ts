import type { Game } from '@shared/library'
import type { WishlistGroup } from '@shared/wishlist'
import type { Scope } from '@shared/scope'
import { inScope } from '@shared/scope'
import { groupMembers } from './wishlist'

/** The in-memory data a scope resolves against: the full mirror + loaded groups. */
interface ScopeData {
  games: Game[]
  groups: WishlistGroup[]
}

/**
 * Resolve a Scope to its `Game[]` from the local mirror. Base scopes partition by
 * the shared predicate; a `{ group }` scope unions the group's saved filter with
 * its manual pins over the wishlisted set (an unknown id resolves to empty).
 */
const resolveScope = (scope: Scope, { games, groups }: ScopeData): Game[] => {
  if (typeof scope === 'object') {
    const group = groups.find((g) => g.id === scope.group)
    if (!group) return []
    return groupMembers(games.filter((g) => g.wishlisted), group)
  }
  return games.filter((g) => inScope(g, scope))
}

export { resolveScope }
export type { ScopeData }

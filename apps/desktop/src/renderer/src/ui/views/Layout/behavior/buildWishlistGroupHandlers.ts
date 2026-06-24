import type { NavigateFunction } from 'react-router-dom'
import { useAgentWishlist } from '@/store/agentWishlist'
import { resolveScope } from '@/lib/query/scope'
import type { Game } from '@shared/library'
import type { WishlistGroup } from '@shared/wishlist'
import type { UiHandler } from '@/lib/ai/uiToolHost'

interface WishlistGroupDeps {
  navigate: NavigateFunction
  games: Game[]
  groups: WishlistGroup[]
}

const buildWishlistGroupHandlers = (deps: WishlistGroupDeps): Record<string, UiHandler> => ({
  // Open a specific sub-wishlist: select it on the Wishlist page and show it.
  openWishlistGroup: (payload) => {
    const id = payload.id != null ? Number(payload.id) : undefined
    const name = payload.name != null ? String(payload.name).toLowerCase() : undefined
    const group = deps.groups.find(
      (g) => (id != null && g.id === id) || (name != null && g.name.toLowerCase() === name),
    )
    if (!group) {
      const which = name != null ? `named "${payload.name}"` : id != null ? `with id ${id}` : 'requested'
      return { error: `No sub-wishlist ${which}. Use list_wishlist_groups to see them.` }
    }
    useAgentWishlist.getState().apply({ group: group.id })
    deps.navigate('/wishlist')
    const members = resolveScope({ group: group.id }, { games: deps.games, groups: deps.groups }).length
    return { opened: true, id: group.id, name: group.name, members }
  },
})

export { buildWishlistGroupHandlers }
export type { WishlistGroupDeps }

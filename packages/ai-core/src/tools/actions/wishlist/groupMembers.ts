import { host } from '../../../host'
import { registerTool } from '../../registry'
import { GROUP_REF_PROPS, resolveGroup, isError, toAppids } from './groupRef'

const APPIDS = { type: 'array', items: { type: 'number' } }

const registerGroupMemberTools = (): void => {
  registerTool({
    name: 'add_to_wishlist_group',
    description:
      'Pin specific games (by appid) into a sub-wishlist, on top of its smart filter. Use list_wishlist / search_games for appids. Address the group by `id` or `group` (name).',
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: { type: 'object', properties: { ...GROUP_REF_PROPS, appids: APPIDS }, required: ['appids'] },
    summarize: (a) => `Add ${toAppids(a.appids).length} game(s) to wishlist group ${a.group ?? a.id}`,
    run: async (args) => {
      const group = resolveGroup(args)
      if (isError(group)) return group
      const add = toAppids(args.appids)
      if (!add.length) return { error: 'Provide at least one appid to add.' }
      const manualAppids = [...new Set([...group.manualAppids, ...add])]
      host().wishlist.updateGroup(group.id, { manualAppids })
      return { added: manualAppids.length - group.manualAppids.length, id: group.id, pinnedTotal: manualAppids.length }
    },
  })

  registerTool({
    name: 'remove_from_wishlist_group',
    description:
      'Unpin specific games (by appid) from a sub-wishlist. Only removes manual pins; games still matching the smart filter stay (change the filter to drop those). Address by `id` or `group` (name).',
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: { type: 'object', properties: { ...GROUP_REF_PROPS, appids: APPIDS }, required: ['appids'] },
    summarize: (a) => `Remove ${toAppids(a.appids).length} game(s) from wishlist group ${a.group ?? a.id}`,
    run: async (args) => {
      const group = resolveGroup(args)
      if (isError(group)) return group
      const drop = new Set(toAppids(args.appids))
      const manualAppids = group.manualAppids.filter((a) => !drop.has(a))
      host().wishlist.updateGroup(group.id, { manualAppids })
      return { removed: group.manualAppids.length - manualAppids.length, id: group.id, pinnedTotal: manualAppids.length }
    },
  })

  registerTool({
    name: 'reorder_wishlist_groups',
    description:
      'Set the order of the sub-wishlists. Pass `order`: group ids or names (case-insensitive) in the desired order; groups not listed keep their relative order after the listed ones.',
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: {
      type: 'object',
      properties: { order: { type: 'array', items: { type: 'string' }, description: 'Ids or names, first to last.' } },
      required: ['order'],
    },
    summarize: (a) => `Reorder ${Array.isArray(a.order) ? a.order.length : 0} wishlist group(s)`,
    run: async (args) => {
      const refs = Array.isArray(args.order) ? args.order : []
      if (!refs.length) return { error: 'Provide `order`: a list of group ids or names.' }
      const ids: number[] = []
      for (const ref of refs) {
        const g = resolveGroup({ id: ref })
        if (isError(g)) return g
        if (!ids.includes(g.id)) ids.push(g.id)
      }
      const rest = host().wishlist.listGroups().map((g) => g.id).filter((id) => !ids.includes(id))
      host().wishlist.reorderGroups([...ids, ...rest])
      return { reordered: true, order: [...ids, ...rest] }
    },
  })
}

export { registerGroupMemberTools }

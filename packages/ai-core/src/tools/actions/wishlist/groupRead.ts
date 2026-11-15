import { host } from '../../../host'
import { registerTool } from '../../registry'
import { FILTER_SPEC_SCHEMA } from '../../filterSchema'
import { sanitize } from '../../../parse'
import { applyFilter } from '@jex/shared/filterApply'
import { GROUP_REF_PROPS, resolveGroup, isError } from './groupRef'
import { wishlistedGames, groupMembers, groupMode, filterSummary, gameRow, paginate } from './membership'

const PAGE = { type: 'number', description: 'Page number, 1-based (30 per page).' }

const registerGroupReadTools = (): void => {
  registerTool({
    name: 'list_wishlist_groups',
    description:
      'List the sub-wishlists in order: id, name, mode (manual | filter | filter+manual), a short filter summary, manual pin count and total number of games in the group.',
    category: 'wishlist',
    sensitivity: 'safe',
    surface: 'main',
    params: { type: 'object', properties: {} },
    run: async () => {
      const groups = host().wishlist.listGroups()
      return {
        count: groups.length,
        groups: groups.map((g) => ({
          id: g.id,
          name: g.name,
          mode: groupMode(g),
          filter: filterSummary(g.filterSpec),
          manualCount: g.manualAppids.length,
          total: groupMembers(g).length,
        })),
      }
    },
  })

  registerTool({
    name: 'get_wishlist_group',
    description:
      "One sub-wishlist in full: its filter spec, manual appids, and its games (appid, name, release, genres…), paged — pass `page` for big groups. Address by `id` or `group` (name).",
    category: 'wishlist',
    sensitivity: 'safe',
    surface: 'main',
    params: { type: 'object', properties: { ...GROUP_REF_PROPS, page: PAGE } },
    run: async (args) => {
      const group = resolveGroup(args)
      if (isError(group)) return group
      const p = paginate(groupMembers(group), args.page)
      return {
        id: group.id,
        name: group.name,
        mode: groupMode(group),
        filterSpec: group.filterSpec,
        manualAppids: group.manualAppids,
        total: p.total,
        page: p.page,
        pages: p.pages,
        games: p.items.map(gameRow),
      }
    },
  })

  registerTool({
    name: 'list_wishlist',
    description:
      "List the user's Steam wishlist (all wishlisted games), optionally narrowed by a `filter` (same fields as groups, incl. sortBy) and paged with `page`. Use it to find games/appids to add to a group.",
    category: 'wishlist',
    sensitivity: 'safe',
    surface: 'main',
    params: { type: 'object', properties: { filter: FILTER_SPEC_SCHEMA, page: PAGE } },
    run: async (args) => {
      const spec = args.filter ? sanitize(args.filter as Record<string, unknown>) : {}
      const matched = applyFilter(wishlistedGames(), { ...spec, limit: undefined })
      const p = paginate(matched, args.page)
      return { total: p.total, page: p.page, pages: p.pages, games: p.items.map(gameRow) }
    },
  })
}

export { registerGroupReadTools }

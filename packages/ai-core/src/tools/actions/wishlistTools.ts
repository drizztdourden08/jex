import { host } from '../../host'
import { registerTool } from '../registry'
import { FILTER_SPEC_SCHEMA } from '../filterSchema'
import { sanitize } from '../../parse'
import { applyFilter } from '@jex/shared/filterApply'
import type { FilterSpec } from '@jex/shared/filter'
import type { WishlistGroupPatch } from '@jex/shared/wishlist'

/** How many wishlisted games a smart filter matches — the feedback that lets the
 *  model verify "all action games = 78" and self-correct (e.g. genre vs category).
 *  Counts ALL wishlisted games (incl. not-yet-enriched ones), so it can exceed the
 *  Wishlist page's on-screen count until enrichment finishes — fine for this signal. */
const wishlistMatchCount = (spec: FilterSpec): number =>
  applyFilter(
    host().db.getAllGames().filter((g) => g.wishlisted),
    { ...spec, limit: undefined },
  ).length

const toAppids = (v: unknown): number[] =>
  Array.isArray(v) ? v.map(Number).filter((n) => Number.isFinite(n) && n > 0) : []

/**
 * Wishlist action tools — create / update / delete sub-wishlist groups, pin/unpin
 * games, and refresh the Steam wishlist. Membership = saved smart filter ∪ manual
 * pins; the create/update tools return the smart-filter match count so the agent
 * sees whether its filter did what the user asked.
 */
const registerWishlistTools = (): void => {
  registerTool({
    name: 'create_wishlist_group',
    description:
      'Create a named sub-wishlist (group) defined by a filter built from the user\'s request — e.g. "co-op games under $20". Provide a name and the filter fields. Returns how many of the user\'s wishlisted games match the filter — CHECK this against what the user asked (if it looks wrong, the facet was likely off, e.g. Action is a genre not a category).',
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        filter: FILTER_SPEC_SCHEMA,
      },
      required: ['name'],
    },
    summarize: (a) => `Create wishlist group "${a.name}"`,
    run: async (args) => {
      const name = String(args.name ?? '').trim()
      if (!name) return { error: 'Provide a group name.' }
      const filter = args.filter ? sanitize(args.filter as Record<string, unknown>) : null
      const group = host().wishlist.createGroup(name, filter, [])
      return { created: true, id: group.id, name: group.name, matches: filter ? wishlistMatchCount(filter) : null }
    },
  })

  registerTool({
    name: 'update_wishlist_group',
    description:
      'Update a sub-wishlist: rename it and/or replace its smart filter. Use list_wishlist_groups for ids. Returns the new smart-filter match count so you can verify the change.',
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: {
      type: 'object',
      properties: { id: { type: 'number' }, name: { type: 'string' }, filter: FILTER_SPEC_SCHEMA },
      required: ['id'],
    },
    summarize: (a) => `Update wishlist group ${a.id}`,
    run: async (args) => {
      const id = Number(args.id)
      if (!Number.isFinite(id)) return { error: 'Provide a valid group id.' }
      const patch: WishlistGroupPatch = {}
      if (typeof args.name === 'string' && args.name.trim()) patch.name = args.name.trim()
      if (args.filter !== undefined)
        patch.filterSpec = args.filter ? sanitize(args.filter as Record<string, unknown>) : null
      const updated = host().wishlist.updateGroup(id, patch)
      if (!updated) return { error: `No wishlist group with id ${id}.` }
      return {
        updated: id,
        name: updated.name,
        matches: updated.filterSpec ? wishlistMatchCount(updated.filterSpec) : null,
      }
    },
  })

  registerTool({
    name: 'add_to_wishlist_group',
    description:
      'Pin specific games (by appid) into a sub-wishlist, on top of its smart filter. Use search_games/get_game to find appids and list_wishlist_groups for the group id.',
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: {
      type: 'object',
      properties: { id: { type: 'number' }, appids: { type: 'array', items: { type: 'number' } } },
      required: ['id', 'appids'],
    },
    summarize: (a) => `Add ${toAppids(a.appids).length} game(s) to wishlist group ${a.id}`,
    run: async (args) => {
      const id = Number(args.id)
      if (!Number.isFinite(id)) return { error: 'Provide a valid group id.' }
      const group = host().wishlist.getGroup(id)
      if (!group) return { error: `No wishlist group with id ${id}.` }
      const add = toAppids(args.appids)
      if (!add.length) return { error: 'Provide at least one appid to add.' }
      const manualAppids = [...new Set([...group.manualAppids, ...add])]
      host().wishlist.updateGroup(id, { manualAppids })
      return { added: add.length, id, pinnedTotal: manualAppids.length }
    },
  })

  registerTool({
    name: 'remove_from_wishlist_group',
    description:
      'Unpin specific games (by appid) from a sub-wishlist. Only removes manual pins; games still matching the smart filter stay. Use list_wishlist_groups for the id.',
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: {
      type: 'object',
      properties: { id: { type: 'number' }, appids: { type: 'array', items: { type: 'number' } } },
      required: ['id', 'appids'],
    },
    summarize: (a) => `Remove ${toAppids(a.appids).length} game(s) from wishlist group ${a.id}`,
    run: async (args) => {
      const id = Number(args.id)
      if (!Number.isFinite(id)) return { error: 'Provide a valid group id.' }
      const group = host().wishlist.getGroup(id)
      if (!group) return { error: `No wishlist group with id ${id}.` }
      const drop = new Set(toAppids(args.appids))
      const manualAppids = group.manualAppids.filter((a) => !drop.has(a))
      host().wishlist.updateGroup(id, { manualAppids })
      return { removed: group.manualAppids.length - manualAppids.length, id, pinnedTotal: manualAppids.length }
    },
  })

  registerTool({
    name: 'list_wishlist_groups',
    description: 'List the user\'s wishlist groups (sub-wishlists) with their ids.',
    category: 'wishlist',
    sensitivity: 'safe',
    surface: 'main',
    params: { type: 'object', properties: {} },
    run: async () => {
      const groups = host().wishlist.listGroups()
      return { count: groups.length, groups: groups.map((g) => ({ id: g.id, name: g.name })) }
    },
  })

  registerTool({
    name: 'delete_wishlist_group',
    description: 'Delete a wishlist group by its numeric id (use list_wishlist_groups first).',
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] },
    summarize: (a) => `Delete wishlist group ${a.id}`,
    run: async (args) => {
      const id = Number(args.id)
      if (!Number.isFinite(id)) return { error: 'Provide a valid group id.' }
      host().wishlist.deleteGroup(id)
      return { deleted: id }
    },
  })

  registerTool({
    name: 'sync_wishlist',
    description: "Refresh the user's Steam wishlist from their public Steam profile.",
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: { type: 'object', properties: {} },
    summarize: () => 'Sync your Steam wishlist',
    run: async () => {
      const r = await host().library.runWishlistSync()
      return { synced: true, ...r }
    },
  })
}

export { registerWishlistTools }

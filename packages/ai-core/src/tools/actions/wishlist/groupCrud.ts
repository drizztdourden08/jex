import { host } from '../../../host'
import { registerTool } from '../../registry'
import { FILTER_SPEC_SCHEMA } from '../../filterSchema'
import { sanitize } from '../../../parse'
import type { WishlistGroupPatch } from '@jex/shared/wishlist'
import { GROUP_REF_PROPS, resolveGroup, isError, toAppids } from './groupRef'
import { wishlistMatchCount, groupMode } from './membership'

const registerGroupCrudTools = (): void => {
  registerTool({
    name: 'create_wishlist_group',
    description:
      'Create a named sub-wishlist (group). Smart: pass `filter` built from the request (e.g. "co-op games under $20"). Manual: omit `filter` and pass `appids` to pin. Both may be combined (members = filter matches + pinned). Returns how many wishlisted games the filter matches — CHECK it against the request (if it looks wrong the facet was likely off, e.g. Action is a genre not a category).',
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        filter: FILTER_SPEC_SCHEMA,
        appids: { type: 'array', items: { type: 'number' }, description: 'Games to pin manually.' },
      },
      required: ['name'],
    },
    summarize: (a) => `Create wishlist group "${a.name}"`,
    run: async (args) => {
      const name = String(args.name ?? '').trim()
      if (!name) return { error: 'Provide a group name.' }
      const filter = args.filter ? sanitize(args.filter as Record<string, unknown>) : null
      const group = host().wishlist.createGroup(name, filter, toAppids(args.appids))
      return { created: true, id: group.id, name: group.name, mode: groupMode(group), matches: filter ? wishlistMatchCount(filter) : null }
    },
  })

  registerTool({
    name: 'update_wishlist_group',
    description:
      'Edit a sub-wishlist. `name` renames it. `filter` sets/replaces its smart filter (the group becomes filter, or filter+manual if it has pins). `clear_filter: true` removes the filter so the group is purely manual (only pinned games remain). `appids` REPLACES the whole manual pin list (use add_to_wishlist_group / remove_from_wishlist_group to change just some). Returns the new mode and filter match count — verify it. Address the group by `id` or `group` (name).',
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: {
      type: 'object',
      properties: {
        ...GROUP_REF_PROPS,
        name: { type: 'string', description: 'New name.' },
        filter: FILTER_SPEC_SCHEMA,
        clear_filter: { type: 'boolean', description: 'Drop the filter; group becomes manual-only.' },
        appids: { type: 'array', items: { type: 'number' }, description: 'Replace the manual pin list.' },
      },
    },
    summarize: (a) => {
      const bits = [a.name && 'rename', a.filter && 'set filter', a.clear_filter && 'clear filter', a.appids && 'replace pins'].filter(Boolean)
      return `Update wishlist group ${a.group ?? a.id} (${bits.join(', ') || 'no change'})`
    },
    run: async (args) => {
      const group = resolveGroup(args)
      if (isError(group)) return group
      const patch: WishlistGroupPatch = {}
      if (typeof args.name === 'string' && args.name.trim()) patch.name = args.name.trim()
      if (args.filter) patch.filterSpec = sanitize(args.filter as Record<string, unknown>)
      else if (args.clear_filter === true) patch.filterSpec = null
      if (Array.isArray(args.appids)) patch.manualAppids = [...new Set(toAppids(args.appids))]
      if (!Object.keys(patch).length) return { error: 'Nothing to change: pass name, filter, clear_filter or appids.' }
      const updated = host().wishlist.updateGroup(group.id, patch)
      if (!updated) return { error: `No wishlist group with id ${group.id}.` }
      return {
        updated: updated.id,
        name: updated.name,
        mode: groupMode(updated),
        manualCount: updated.manualAppids.length,
        matches: updated.filterSpec ? wishlistMatchCount(updated.filterSpec) : null,
      }
    },
  })

  registerTool({
    name: 'delete_wishlist_group',
    description: 'Delete a wishlist group (the games stay on the wishlist). Address by `id` or `group` (name).',
    category: 'wishlist',
    sensitivity: 'sensitive',
    surface: 'main',
    params: { type: 'object', properties: { ...GROUP_REF_PROPS } },
    summarize: (a) => `Delete wishlist group ${a.group ?? a.id}`,
    run: async (args) => {
      const group = resolveGroup(args)
      if (isError(group)) return group
      host().wishlist.deleteGroup(group.id)
      return { deleted: group.id, name: group.name }
    },
  })
}

export { registerGroupCrudTools }

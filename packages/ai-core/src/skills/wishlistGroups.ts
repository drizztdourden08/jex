import type { Skill } from './types'

/** The sub-wishlist (group) CRUD workflow. Needed only for wishlist-group requests. */
const wishlistGroups: Skill = {
  id: 'wishlist-groups',
  whenToUse:
    'creating, editing, opening, or filtering a sub-wishlist ("group" / saved filter over the wishlist).',
  guidance: [
    'WISHLIST GROUPS (sub-wishlists = saved filters over the wishlist).',
    '- list_wishlist_groups → get ids.',
    '- create_wishlist_group({name, filter}) → CHECK the returned match count looks right before confirming.',
    '- update_wishlist_group({id, name?, filter?}).',
    '- add_to_wishlist_group / remove_from_wishlist_group({id, appids}) → pin/unpin specific games.',
    '- delete_wishlist_group({id}).',
    '- open_wishlist_group({id|name}) → SHOW one.',
    '- To filter WITHIN a group, pass its numeric id as `group` to apply_filter / query_library.',
    '',
    'Examples:',
    '- "make a wishlist of all my action games" → create_wishlist_group({name:"Action", filter:{genres:["Action"]}}) → CHECK matches looks right (Action is a genre) → confirm the count.',
    '- "open my Cozy sub-wishlist" → open_wishlist_group({name:"Cozy"}).',
  ].join('\n'),
}

export { wishlistGroups }

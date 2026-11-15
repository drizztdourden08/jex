import type { Skill } from './types'

/** The sub-wishlist (group) CRUD workflow. Needed only for wishlist-group requests. */
const wishlistGroups: Skill = {
  id: 'wishlist-groups',
  whenToUse:
    'creating, editing, opening, or filtering a sub-wishlist ("group" / saved filter over the wishlist).',
  guidance: [
    'WISHLIST GROUPS (sub-wishlists = saved filter ∪ manual pins over the wishlist). Address any group by id OR name.',
    '- list_wishlist_groups → ids, mode (manual|filter|filter+manual), filter summary, counts. get_wishlist_group({group, page?}) → full filter + games. list_wishlist({filter?, page?}) → find games/appids.',
    '- create_wishlist_group({name, filter?, appids?}) → CHECK the returned match count looks right before confirming.',
    '- update_wishlist_group({group, name?, filter?, clear_filter?, appids?}): rename; filter sets/replaces the smart filter; clear_filter:true makes it manual-only; appids REPLACES the pin list.',
    '- add_to_wishlist_group / remove_from_wishlist_group({group, appids}) → pin/unpin (filter matches cannot be unpinned; change the filter).',
    '- reorder_wishlist_groups({order:[names or ids]}); delete_wishlist_group({group}).',
    '- add_to_steam_wishlist({appid}) adds to the real Steam wishlist (needs Steam sign-in in the Store tab; removing is not supported).',
    '- open_wishlist_group({id|name}) → SHOW one.',
    '- To filter WITHIN a group, pass its numeric id as `group` to apply_filter / query_library.',
    '',
    'Examples:',
    '- "make a wishlist of all my action games" → create_wishlist_group({name:"Action", filter:{genres:["Action"]}}) → CHECK matches looks right (Action is a genre) → confirm the count.',
    '- "open my Cozy sub-wishlist" → open_wishlist_group({name:"Cozy"}).',
  ].join('\n'),
}

export { wishlistGroups }

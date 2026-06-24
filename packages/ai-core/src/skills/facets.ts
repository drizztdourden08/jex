import type { Skill } from './types'

/** The full genre/category/tag map + gaming-jargon translation. Lifted out of the
 *  always-on prompt: dense, only needed when a filter value is ambiguous. */
const facets: Skill = {
  id: 'facets',
  whenToUse:
    'classifying a filter value (is X a genre, category, or tag?) or translating gaming slang/jargon before filtering.',
  guidance: [
    'FACETS — genre vs category vs tag. The wrong bucket returns almost nothing.',
    '- GENRES = broad kinds → genres[]: Action, Adventure, RPG, Strategy, Indie, Simulation, Casual, Racing, Sports, Massively Multiplayer. ("Action" is a GENRE, never a category.)',
    '- CATEGORIES = play modes / Steam features → categories[]: Single-player, Multi-player, Co-op, Online Co-op, "Shared/Split Screen Co-op", PvP, Steam Achievements, Full controller support. (For co-op/controller, features[] is usually cleaner.)',
    '- TAGS = community labels / sub-genres → tags[]: Roguelike, Metroidvania, Cozy, Bullet Hell, Soulslike, Open World, Deckbuilder.',
    '- If unsure whether a value exists, call list_filter_values first, then filter with values that exist.',
    '',
    'GAMING JARGON — translate BEFORE filtering. For ANY fuzzy/slang term call interpret_gaming_terms FIRST, then filter with the exact values it returns.',
    "- 'couch co-op' / 'local co-op' = categories ['Shared/Split Screen Co-op','Shared/Split Screen'] — NEVER 'Co-op' (that is online co-op only).",
    '- Also: soulslike, roguelite vs roguelike, metroidvania, 4X, CRPG, boomer shooter, bullet hell, cozy, walking sim, deckbuilder, Steam Deck, party game.',
    '',
    'VERIFY THE COUNT. Filtering tools report how many matched (apply_filter→matches, query_library→count, create/update_wishlist_group→matches, roll_randomizer→poolSize). If the count is surprisingly small (e.g. 1 when dozens are expected), your facet is almost certainly wrong — most often a genre placed in categories (or vice-versa), or a tag in genres. Re-classify and try again BEFORE reporting success.',
    '',
    'Examples:',
    '- "show me my couch co-op games playable with a controller" → interpret_gaming_terms("couch co-op, controller") → apply_advanced_filter({match:"all", rules:[{field:"categories",op:"any",value:["Shared/Split Screen Co-op","Shared/Split Screen"]},{field:"features",op:"any",value:["controllerFull"]}]}).',
    '- "RPGs OR strategy games under 20 hours" → apply_advanced_filter with the OR rule + a playtimeForever lte 1200 (minutes) rule.',
  ].join('\n'),
}

export { facets }

/**
 * Static facet data for catalog search (the unchanging part of the vocabulary). Kept
 * apart from searchVocab.ts (the fetch/sync/resolve logic) so each file stays focused
 * and within the line budget. See searchVocab.ts for how these are used.
 */

/** Store category name (lowercased) → search facet param + id. category3 = play
 *  modes, category2 = features. (28/18 are legacy controller IDs the backend
 *  still honors but the modern panel no longer lists.) */
const CATEGORY_PARAMS: Record<string, { param: 'category2' | 'category3'; id: number }> = {
  'single-player': { param: 'category3', id: 2 },
  'multi-player': { param: 'category3', id: 1 },
  pvp: { param: 'category3', id: 49 },
  'online pvp': { param: 'category3', id: 36 },
  'co-op': { param: 'category3', id: 9 },
  'online co-op': { param: 'category3', id: 38 },
  'shared/split screen': { param: 'category3', id: 24 },
  'cross-platform multiplayer': { param: 'category3', id: 27 },
  'steam achievements': { param: 'category2', id: 22 },
  'full controller support': { param: 'category2', id: 28 },
  'partial controller support': { param: 'category2', id: 18 },
  'steam cloud': { param: 'category2', id: 23 },
  'steam trading cards': { param: 'category2', id: 29 },
  'steam workshop': { param: 'category2', id: 30 },
  'remote play together': { param: 'category2', id: 44 },
  'captions available': { param: 'category2', id: 13 },
  'family sharing': { param: 'category2', id: 62 },
}

/** Display order for the Categories facet section (keys into CATEGORY_PARAMS). */
const CATEGORY_NAMES = [
  'Single-player',
  'Multi-player',
  'Co-op',
  'Online Co-op',
  'PvP',
  'Online PvP',
  'Shared/Split Screen',
  'Cross-Platform Multiplayer',
  'Steam Achievements',
  'Full controller support',
  'Partial controller support',
  'Steam Cloud',
  'Steam Trading Cards',
  'Steam Workshop',
  'Remote Play Together',
  'Captions available',
  'Family Sharing',
]

/** GameFeatures key → the store category it maps to (for FilterSpec.features). */
const FEATURE_TO_CATEGORY: Record<string, string> = {
  singleplayer: 'Single-player',
  multiplayer: 'Multi-player',
  coop: 'Co-op',
  onlineCoop: 'Online Co-op',
  cloud: 'Steam Cloud',
  controllerFull: 'Full controller support',
  controllerPartial: 'Partial controller support',
  tradingCards: 'Steam Trading Cards',
  workshop: 'Steam Workshop',
  remotePlayTogether: 'Remote Play Together',
  achievements: 'Steam Achievements',
}

/** Canonical Steam genre → tagid, a built-in fallback so the core genres ALWAYS resolve
 *  for catalog filtering even before the popular-tags list has synced (these ids are
 *  long-stable). The synced vocab overlays/extends this with the long tail. */
const GENRE_TAG_IDS: Record<string, number> = {
  action: 19,
  adventure: 21,
  casual: 597,
  indie: 492,
  'massively multiplayer': 128,
  racing: 699,
  rpg: 122,
  simulation: 599,
  sports: 701,
  strategy: 9,
  'free to play': 113,
  'early access': 493,
}

/** Steam's primary genres (a curated subset of tags shown in the Genres section). */
const GENRE_NAMES = [
  'Action',
  'Adventure',
  'Casual',
  'Indie',
  'Massively Multiplayer',
  'Racing',
  'RPG',
  'Simulation',
  'Sports',
  'Strategy',
  'Free to Play',
  'Early Access',
  'Visual Novel',
  'Gore',
  'Violent',
  'Nudity',
  'Sexual Content',
]

export { CATEGORY_PARAMS, CATEGORY_NAMES, FEATURE_TO_CATEGORY, GENRE_TAG_IDS, GENRE_NAMES }

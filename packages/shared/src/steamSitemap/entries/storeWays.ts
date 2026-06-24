import type { SitemapEntry } from '../types'

/**
 * Store top-nav destinations from the redesigned menus: the Recommendations
 * dropdown, the "Ways to Play" featured pages, and the GENERIC category/tag
 * browse entries (dynamic — the agent supplies the slug/tag as `value`).
 */
const STORE_WAYS: SitemapEntry[] = [
  {
    id: 'communityRecommendations',
    title: 'Community Recommendations',
    url: 'https://store.steampowered.com/communityrecommendations/',
    section: 'discovery',
    description:
      'Game recommendations sourced from the Steam community and curators. Use for "community recommendations" / "what does the community recommend".',
    keywords: ['community recommendations', 'community picks', 'recommended by the community'],
    functionalities: ['discover', 'browse'],
    needsAuth: false,
  },
  {
    id: 'popularAmongFriends',
    title: 'Popular Among Friends',
    url: 'https://store.steampowered.com/recommended/friendactivity/',
    section: 'discovery',
    description:
      'Games that are popular with / recently bought by your Steam friends. Use for "popular among friends" / "what my friends are buying/playing on the store".',
    keywords: ['popular among friends', 'what my friends are buying', 'friends activity', 'games my friends own'],
    functionalities: ['discover', 'browse'],
    needsAuth: true,
  },
  {
    id: 'dlcForYou',
    title: 'DLC For You',
    url: 'https://store.steampowered.com/dlcforyou/',
    section: 'discovery',
    description:
      'DLC suggestions for games you already own. Use for "DLC for my games" / "add-ons for games I own".',
    keywords: ['dlc for you', 'dlc for my games', 'add-ons for games i own', 'expansions for my games'],
    functionalities: ['discover', 'browse'],
    needsAuth: true,
  },
  {
    id: 'personalCalendar',
    title: 'Your Personal Calendar',
    url: 'https://store.steampowered.com/personalcalendar/',
    section: 'discovery',
    description:
      'A personalized release calendar of games (recent and upcoming) tuned to your wishlist/library. Use for "my release calendar" / "what\'s releasing for me".',
    keywords: ['personal calendar', 'my release calendar', 'release calendar', "what's releasing for me", 'my calendar'],
    functionalities: ['discover', 'browse'],
    needsAuth: true,
  },
  {
    id: 'remotePlay',
    title: 'Remote Play Together',
    url: 'https://store.steampowered.com/remoteplay_together',
    section: 'store',
    description:
      'Games that support Remote Play Together (stream local multiplayer to friends online). Use for "remote play" / "remote play together games".',
    keywords: ['remote play', 'remote play together', 'stream to friends', 'play together online'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'controllerFriendly',
    title: 'Controller-Friendly Games',
    url: 'https://store.steampowered.com/controller/',
    section: 'store',
    description:
      'The store hub for games with full controller support. Use for "controller-friendly games" / "games I can play with a controller" (on the store).',
    keywords: ['controller friendly', 'controller support', 'games with a controller', 'gamepad games'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'storeCategory',
    title: 'Browse a Store Category / Genre',
    url: 'https://store.steampowered.com/category/<slug>',
    section: 'store',
    description:
      'Browse a store genre/theme/way-to-play hub by its category slug. Pass the slug as `value`. Common slugs: action, adventure, rpg, rpg_action (Action RPG), rpg_jrpg, strategy, strategy_turn_based, strategy_real_time, simulation, casual, racing, sports, horror, science_fiction (Sci-Fi/Cyberpunk), action_fps (FPS), action_tps, metroidvania, rogue_like_rogue_lite, multiplayer, singleplayer, multiplayer_coop (Co-op), multiplayer_local_party, multiplayer_lan, multiplayer_mmo (MMO), multiplayer_online_competitive. Use for "browse <genre> on the store" / "co-op games on the store" / "singleplayer games".',
    keywords: ['category', 'genre', 'browse by genre', 'co-op games', 'multiplayer games', 'singleplayer games', 'horror games', 'racing games', 'shooter games', 'first person shooter', 'fps games', 'action rpg', 'strategy games', 'metroidvania games', 'browse store category'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
    dynamic: true,
    param: 'slug',
  },
  {
    id: 'storeTag',
    title: 'Browse a Store Tag',
    url: 'https://store.steampowered.com/tags/en/<tag>/',
    section: 'discovery',
    description:
      'Browse the store by a specific tag name (passed as `value`, e.g. "Roguelike", "Auto Battler", "Open World", "Soulslike"). Use for "games tagged X" / "browse the <tag> tag". For the tag directory use tagBrowse.',
    keywords: ['tag', 'browse by tag', 'games tagged', 'roguelike', 'soulslike', 'auto battler', 'open world tag'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
    dynamic: true,
    param: 'tag',
  },
]

export { STORE_WAYS }

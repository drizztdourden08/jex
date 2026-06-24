import type { SitemapEntry } from '../types'

/** Store-domain catalog sections: genres/tags, formats, hardware, news, events. */
const STORE_CATALOG: SitemapEntry[] = [
  {
    id: 'freeToPlay',
    title: 'Free to Play',
    url: 'https://store.steampowered.com/genre/Free%20to%20Play/',
    section: 'store',
    description:
      'Landing page for free-to-play games (trending free, top free). Use for "free games" / "f2p" / "play for free".',
    keywords: ['free to play', 'free games', 'f2p', 'no cost games', 'play for free'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'demos',
    title: 'Free Demos',
    url: 'https://store.steampowered.com/demos/',
    section: 'store',
    description:
      'Hub for game demos to try before buying. Use for "demos" / "try before you buy" / "game trials".',
    keywords: ['demos', 'free demos', 'try before you buy', 'game trials', 'playable demo'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'earlyAccess',
    title: 'Early Access',
    url: 'https://store.steampowered.com/genre/Early%20Access/',
    section: 'store',
    description:
      'Games in active Early Access development you can buy and play now. Use for "early access" / "in development" / "alpha/beta games".',
    keywords: ['early access', 'in development', 'alpha', 'beta games', 'work in progress'],
    functionalities: ['browse', 'discover', 'buy'],
    needsAuth: false,
  },
  {
    id: 'vr',
    title: 'Steam VR Titles',
    url: 'https://store.steampowered.com/vr/',
    section: 'store',
    description:
      'The Virtual Reality storefront section (VR games and apps). Use for "VR games" / "SteamVR titles" / "headset games".',
    keywords: ['vr', 'virtual reality', 'steamvr', 'vr games', 'headset games'],
    functionalities: ['browse', 'discover', 'buy'],
    needsAuth: false,
  },
  {
    id: 'tagBrowse',
    title: 'Browse by Tag',
    url: 'https://store.steampowered.com/tag/browse/',
    section: 'discovery',
    description:
      'Directory of popular Steam tags to browse from (a specific tag lives at /tags/en/<Tag>/, e.g. /tags/en/Roguelike/). Use to explore by theme/tag.',
    keywords: ['tags', 'by tag', 'roguelike', 'soulslike', 'open world', 'theme', 'popular tags', 'browse tags'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'soundtracks',
    title: 'Soundtracks',
    url: 'https://store.steampowered.com/category/soundtrack',
    section: 'store',
    description:
      'Game soundtracks (OSTs) on Steam. Use for "soundtrack" / "game music" / "OST".',
    keywords: ['soundtrack', 'ost', 'game music', 'music', 'soundtracks'],
    functionalities: ['browse', 'buy'],
    needsAuth: false,
  },
  {
    id: 'software',
    title: 'Software',
    url: 'https://store.steampowered.com/software/',
    section: 'store',
    description:
      'Non-game software on Steam (creative tools, utilities, game-dev tools). Use for "apps" / "tools" / "non-game software".',
    keywords: ['software', 'apps', 'tools', 'non-game', 'utilities', 'creative software'],
    functionalities: ['browse', 'buy'],
    needsAuth: false,
  },
  {
    id: 'dlcBrowse',
    title: 'DLC Browsing',
    url: 'https://store.steampowered.com/search/?category1=21',
    section: 'store',
    description:
      'Downloadable content (DLC) for games, via the search type filter. Use for "DLC" / "expansions" / "add-ons".',
    keywords: ['dlc', 'expansions', 'add-ons', 'downloadable content', 'extra content'],
    functionalities: ['browse', 'buy'],
    needsAuth: false,
  },
  {
    id: 'steamDeck',
    title: 'Steam Deck',
    url: 'https://store.steampowered.com/steamdeck/',
    section: 'hardware',
    description:
      'The Steam Deck handheld product page (overview, models, specs, buy). Use for "Steam Deck" / "handheld" / "buy a Deck".',
    keywords: ['steam deck', 'handheld', 'deck', 'portable steam', 'buy steam deck'],
    functionalities: ['browse', 'buy', 'discover'],
    needsAuth: false,
  },
  {
    id: 'greatOnDeck',
    title: 'Great on Deck (Deck Verified)',
    url: 'https://store.steampowered.com/greatondeck/',
    section: 'hardware',
    description:
      'Curated hub of games rated Verified/Playable on Steam Deck. Use for "Deck compatible" / "playable on Deck" / "Deck verified games".',
    keywords: ['deck verified', 'great on deck', 'steam deck compatible', 'playable on deck', 'deck games'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'hardware',
    title: 'Steam Hardware',
    url: 'https://store.steampowered.com/hardware/',
    section: 'hardware',
    description:
      'The hardware storefront (Steam Deck and other Valve/partner hardware). Use for "Steam hardware" / "devices" / "controller".',
    keywords: ['hardware', 'steam hardware', 'devices', 'controller', 'valve hardware'],
    functionalities: ['browse', 'buy'],
    needsAuth: false,
  },
  {
    id: 'news',
    title: 'Steam News Hub',
    url: 'https://store.steampowered.com/news/',
    section: 'news',
    description:
      'Aggregated news and update posts across games and Steam. Use for "gaming news" / "patch notes" / "announcements".',
    keywords: ['news', 'steam news', 'updates', 'announcements', 'patch notes', "what's happening"],
    functionalities: ['browse', 'read'],
    needsAuth: false,
  },
  {
    id: 'specials',
    title: 'Specials / Deals',
    url: 'https://store.steampowered.com/specials/',
    section: 'sales',
    description:
      'The ongoing discounts & deals page — the default "on sale" destination outside a named seasonal sale. Use for "sales" / "deals" / "discounts" / "cheap games".',
    keywords: ['on sale', 'deals', 'discounts', 'cheap games', 'sales', 'specials', 'bargains', 'price drop'],
    functionalities: ['browse', 'buy', 'discover'],
    needsAuth: false,
  },
  {
    id: 'steamAwards',
    title: 'Steam Awards',
    url: 'https://store.steampowered.com/steamawards/',
    section: 'sales',
    description:
      'The annual community-voted Steam Awards hub (active mainly around the Winter Sale). Use for "Steam Awards" / "game of the year" / "vote".',
    keywords: ['steam awards', 'game of the year', 'awards', 'vote', 'nominations'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'steamLabs',
    title: 'Steam Labs',
    url: 'https://store.steampowered.com/labs/',
    section: 'discovery',
    description:
      'Hub of experimental discovery features (Micro Trailers, Interactive Recommender, DLC For You). Use for "experimental" / "beta features".',
    keywords: ['steam labs', 'experiments', 'beta features', 'micro trailers', 'experimental'],
    functionalities: ['discover', 'browse'],
    needsAuth: false,
  },
  {
    id: 'aboutSteam',
    title: 'About / Install Steam',
    url: 'https://store.steampowered.com/about/',
    section: 'store',
    description:
      'The "About Steam" page describing the client and offering the download. Use for "download Steam" / "install Steam" / "what is Steam".',
    keywords: ['about steam', 'download steam', 'install steam', 'get steam', 'what is steam'],
    functionalities: ['download', 'browse'],
    needsAuth: false,
  },
]

export { STORE_CATALOG }

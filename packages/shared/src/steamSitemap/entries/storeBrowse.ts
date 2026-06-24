import type { SitemapEntry } from '../types'

/** Store-domain browse & discovery destinations (find/explore games). */
const STORE_BROWSE: SitemapEntry[] = [
  {
    id: 'storeHome',
    title: 'Steam Store Home',
    url: 'https://store.steampowered.com/',
    section: 'store',
    description:
      'The storefront landing page (featured carousel, specials, recommendations). The default "go to the store" destination; personalized as "Your Store" when signed in.',
    keywords: ['steam store', 'storefront', 'home', 'shop', 'browse games', 'buy games', 'your store'],
    functionalities: ['browse', 'discover', 'buy'],
    needsAuth: false,
  },
  {
    id: 'discoveryQueue',
    title: 'Discovery Queue',
    url: 'https://store.steampowered.com/explore/',
    section: 'discovery',
    description:
      'A guided, one-at-a-time queue of games the user has not seen yet. Use for "discover new games" or "show me something I haven\'t seen". Personalized when signed in.',
    keywords: ['discovery queue', 'explore', 'discover games', 'what to play', 'new to me'],
    functionalities: ['discover', 'browse'],
    needsAuth: false,
  },
  {
    id: 'newReleases',
    title: "What's New / New Releases",
    url: 'https://store.steampowered.com/explore/new/',
    section: 'discovery',
    description:
      'Recently launched games: new top sellers, popular new releases, and a chronological list. Use for "what just came out" / "what\'s new on Steam".',
    keywords: ['new releases', "what's new", 'just released', 'recently released', 'new games', 'new releases queue'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'upcoming',
    title: 'Upcoming Releases / Coming Soon',
    url: 'https://store.steampowered.com/explore/upcoming/',
    section: 'discovery',
    description:
      'Games scheduled for future release (top wishlisted, popular upcoming, by date). Use for "coming soon", "release dates", "not out yet".',
    keywords: ['coming soon', 'upcoming', 'upcoming releases', 'release dates', 'pre-release', 'not out yet'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'recommended',
    title: 'Recommendations',
    url: 'https://store.steampowered.com/recommended/',
    section: 'discovery',
    description:
      "Steam's personalized recommendation hub based on play history, owned games, and friends. Use for \"games for me\" / \"Steam's picks\".",
    keywords: ['recommendations', 'recommended games', 'games for me', 'suggestions', 'similar games'],
    functionalities: ['discover', 'browse'],
    needsAuth: true,
  },
  {
    id: 'curators',
    title: 'Curators',
    url: 'https://store.steampowered.com/curators/',
    section: 'discovery',
    description:
      'People and groups who recommend games; shows curators the user follows when signed in. Use to find/follow curators or get curated picks.',
    keywords: ['curators', 'curated', 'recommendations from people', 'follow curators'],
    functionalities: ['discover', 'browse'],
    needsAuth: false,
  },
  {
    id: 'storeSearch',
    title: 'Store Search',
    url: 'https://store.steampowered.com/search/',
    section: 'store',
    description:
      'The faceted catalog search/browse engine (filter by price, tags, features, OS, VR, Deck). Use to find games by keyword or criteria. For a plain keyword search prefer the open_steam_search tool.',
    keywords: ['search', 'find games', 'filter games', 'browse catalog', 'look for'],
    functionalities: ['browse', 'discover', 'buy'],
    needsAuth: false,
  },
  {
    id: 'charts',
    title: 'Steam Charts (hub)',
    url: 'https://store.steampowered.com/charts/',
    section: 'charts',
    description:
      'The official charts hub combining top sellers and most played, with tabs to each. Use for "the charts" / popularity rankings.',
    keywords: ['steam charts', 'charts', 'rankings', 'popular games', 'most popular'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'topSellers',
    title: 'Top Sellers chart',
    url: 'https://store.steampowered.com/charts/topselling',
    section: 'charts',
    description:
      'Best-selling games chart (by revenue), filterable by region/global. Use for "best selling" / "what\'s selling".',
    keywords: ['top sellers', 'best selling', 'best sellers', 'top selling', "what's selling"],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'mostPlayed',
    title: 'Most Played chart',
    url: 'https://store.steampowered.com/charts/mostplayed',
    section: 'charts',
    description:
      'Games ranked by current/peak concurrent players. Use for "most played", "highest player count right now".',
    keywords: ['most played', 'most players', 'concurrent players', 'active players', 'player count'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'topWishlisted',
    title: 'Top Wishlisted',
    url: 'https://store.steampowered.com/search/?filter=popularwishlist',
    section: 'charts',
    description:
      'Most-wishlisted games (largely upcoming titles), via the search filter. Use for "most anticipated" / "most wishlisted".',
    keywords: ['top wishlisted', 'most wishlisted', 'most anticipated', 'popular wishlist'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'newAndTrending',
    title: 'New & Trending',
    url: 'https://store.steampowered.com/search/?filter=popularnew',
    section: 'charts',
    description:
      'Recently released games gaining traction. Use for "trending" / "hot new games".',
    keywords: ['new and trending', 'trending', 'popular new', 'hot new games'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'nextFest',
    title: 'Steam Next Fest',
    url: 'https://store.steampowered.com/sale/nextfest',
    section: 'discovery',
    description:
      'The recurring festival of free playable demos for upcoming games, with dev livestreams. Use for "Next Fest" / "demo festival" / "upcoming game demos".',
    keywords: ['next fest', 'demo festival', 'free demos event', 'upcoming game demos'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'interactiveRecommender',
    title: 'Interactive Recommender',
    url: 'https://store.steampowered.com/recommender/',
    section: 'discovery',
    description:
      'A machine-learning recommender that suggests games from your playtime, with niche/popular and recency sliders + tag filters. Use for "tune my recommendations" / "personalized picks".',
    keywords: ['recommender', 'tune recommendations', 'personalized picks', 'games for me'],
    functionalities: ['discover', 'configure'],
    needsAuth: true,
  },
  {
    id: 'followedCurators',
    title: 'Followed Curators',
    url: 'https://store.steampowered.com/curators/mycurators/',
    section: 'discovery',
    description:
      'Manage the curators you follow (follow/unfollow, tune their influence on your store). Use for "my curators" / "manage followed curators".',
    keywords: ['my curators', 'followed curators', 'manage curators', 'unfollow curator'],
    functionalities: ['view', 'configure'],
    needsAuth: true,
  },
  {
    id: 'steamworksPartner',
    title: 'Steamworks (Distribute on Steam)',
    url: 'https://partner.steamgames.com/',
    section: 'store',
    description:
      'The developer/publisher portal for publishing games on Steam (Steam Direct, partner sign-up, Steamworks docs). Use for "sell my game" / "become a partner" / "publish on Steam".',
    keywords: ['steamworks', 'sell my game', 'distribute on steam', 'become a partner', 'steam direct', 'publish game'],
    functionalities: ['browse', 'learn'],
    needsAuth: false,
  },
]

export { STORE_BROWSE }

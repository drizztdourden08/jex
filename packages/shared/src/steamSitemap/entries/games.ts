import type { SitemapEntry } from '../types'

/**
 * Per-game (appid) destinations — the community-hub sub-tabs and store-side
 * per-app pages. All are `dynamic` (need an appid filled into `<appid>`); the
 * agent resolves the game with get_game/search_games, then calls
 * open_steam_page({ id, appid }). For the plain store page / community hub root,
 * prefer the dedicated open_store_page / open_community_hub tools.
 */
const GAMES: SitemapEntry[] = [
  {
    id: 'gameDiscussions',
    title: 'Game Discussions / Forums',
    url: 'https://steamcommunity.com/app/<appid>/discussions/',
    section: 'community',
    description:
      "A game's community discussion forums (general, trading, bug reports). Use for \"discussions/forum for <game>\" / \"ask the community about <game>\" / \"find co-op partners\".",
    keywords: ['discussions for this game', 'game forum', 'community discussions', 'ask the community', 'find co-op partners', 'bug reports'],
    functionalities: ['browse', 'view', 'create'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'gameGuides',
    title: 'Game Guides',
    url: 'https://steamcommunity.com/app/<appid>/guides/',
    section: 'community',
    description:
      "Player-created guides for a game (walkthroughs, achievement guides, tips). Use for \"guides for <game>\" / \"walkthrough\" / \"how to beat\".",
    keywords: ['guides for this game', 'walkthrough', 'how to beat', 'achievement guide', 'tips and tricks'],
    functionalities: ['browse', 'view', 'create'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'gameScreenshots',
    title: 'Game Screenshots',
    url: 'https://steamcommunity.com/app/<appid>/screenshots/',
    section: 'community',
    description:
      "Community-uploaded screenshots for a game. Use for \"screenshots of <game>\" / \"player screenshots\".",
    keywords: ['screenshots of this game', 'player screenshots', 'community screenshots', 'game images'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'gameArtwork',
    title: 'Game Artwork',
    url: 'https://steamcommunity.com/app/<appid>/images/',
    section: 'community',
    description:
      "Community-uploaded artwork/fan art for a game (the Artwork tab, served from /images/). Use for \"fan art of <game>\".",
    keywords: ['artwork for this game', 'fan art', 'community artwork', 'game art'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'gameVideos',
    title: 'Game Videos',
    url: 'https://steamcommunity.com/app/<appid>/videos/',
    section: 'community',
    description:
      "Community-uploaded videos and clips for a game. Use for \"videos/clips of <game>\" / \"gameplay videos\".",
    keywords: ['videos for this game', 'gameplay videos', 'clips', 'community videos'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'gameBroadcasts',
    title: 'Game Broadcasts (Live)',
    url: 'https://steamcommunity.com/app/<appid>/broadcasts/',
    section: 'community',
    description:
      "Live Steam broadcasts of people currently playing a game. Use for \"who is streaming <game>\" / \"watch <game> live\".",
    keywords: ['broadcasts of this game', 'live streams of this game', 'who is streaming', 'watch live'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'gameLeaderboards',
    title: 'Game Leaderboards',
    url: 'https://steamcommunity.com/stats/<appid>/leaderboards/',
    section: 'community',
    description:
      "A game's global leaderboards (per-challenge rankings, high scores, fastest times). Use for \"leaderboards for <game>\" / \"high scores\".",
    keywords: ['leaderboards', 'high scores', 'rankings', 'fastest times', 'top players'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'gameDlcList',
    title: 'Game DLC List',
    url: 'https://store.steampowered.com/dlc/<appid>/',
    section: 'store',
    description:
      "The store page listing all DLC/add-ons for a game. Use for \"what DLC does <game> have\" / \"expansions for <game>\".",
    keywords: ['dlc for this game', 'add-ons', 'expansions', 'downloadable content', 'extra content'],
    functionalities: ['browse', 'view', 'buy'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'gameStoreReviews',
    title: 'Game Reviews (store)',
    url: 'https://store.steampowered.com/recommended/app/<appid>/',
    section: 'reviews',
    description:
      "The store-side aggregated user reviews/recommendation breakdown for a game. Use for \"reviews of <game>\" / \"is <game> good\" / \"review score\".",
    keywords: ['reviews of this game', 'is this game good', 'user reviews', 'review score', 'recommendations'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'gamePointsShop',
    title: 'Points Shop (this game)',
    url: 'https://store.steampowered.com/points/shop/app/<appid>',
    section: 'store',
    description:
      "The Steam Points Shop filtered to a game's items (backgrounds, emoticons, stickers, animated avatars). Use for \"points shop items for <game>\".",
    keywords: ['emoticons for this game', 'profile backgrounds for this game', 'stickers for this game', 'spend points on this game', 'cosmetics for this game'],
    functionalities: ['browse', 'redeem'],
    needsAuth: true,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'marketListingForApp',
    title: 'Market Listings (this game)',
    url: 'https://steamcommunity.com/market/search?appid=<appid>',
    section: 'market',
    description:
      "The Community Market filtered to a game's items (cases, skins, cards). Use for \"market items for <game>\" / \"<game> skins prices\".",
    keywords: ['market items for this game', 'skins market', 'item prices', 'browse market for game'],
    functionalities: ['browse', 'trade', 'view'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'myGameScreenshots',
    title: 'My Screenshots (this game)',
    url: 'https://steamcommunity.com/my/screenshots/?appid=<appid>',
    section: 'profile',
    description:
      "Your own screenshots filtered to one game. Use for \"my screenshots in <game>\" / \"screenshots I took of <game>\".",
    keywords: ['my screenshots for this game', 'screenshots i took', 'my captures'],
    functionalities: ['view', 'configure'],
    needsAuth: true,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'myGameWorkshopItems',
    title: 'My Workshop Items (this game)',
    url: 'https://steamcommunity.com/my/myworkshopfiles/?appid=<appid>',
    section: 'workshop',
    description:
      "Your own published Workshop items for one game. Use for \"my mods for <game>\" / \"items I uploaded for <game>\".",
    keywords: ['my workshop items for this game', 'mods i made for', 'my uploads for'],
    functionalities: ['view', 'configure'],
    needsAuth: true,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'myGameWorkshopSubs',
    title: 'My Subscribed Mods (this game)',
    url: 'https://steamcommunity.com/my/myworkshopfiles/?appid=<appid>&browsefilter=mysubscriptions',
    section: 'workshop',
    description:
      "The Workshop items you're subscribed to (mods you're using) for one game. Use for \"my mods for <game>\" / \"manage subscribed mods\".",
    keywords: ['my subscribed mods for this game', 'mods i am using', 'manage my mods', 'enabled mods'],
    functionalities: ['view', 'configure'],
    needsAuth: true,
    dynamic: true,
    param: 'appid',
  },
]

export { GAMES }

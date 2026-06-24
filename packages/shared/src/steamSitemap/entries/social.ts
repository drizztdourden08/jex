import type { SitemapEntry } from '../types'

/** Community-domain: Workshop, Community Market, inventory & trading. */
const SOCIAL: SitemapEntry[] = [
  {
    id: 'workshopHome',
    title: 'Steam Workshop',
    url: 'https://steamcommunity.com/workshop/',
    section: 'workshop',
    description:
      'The Workshop landing page (featured/popular items across games that support it). Use as the generic "mods" / "Workshop" entry point.',
    keywords: ['workshop', 'steam workshop', 'mods', 'workshop home', 'browse mods'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
  },
  {
    id: 'workshopBrowse',
    title: 'Workshop for a Game',
    url: 'https://steamcommunity.com/app/<appid>/workshop/',
    section: 'workshop',
    description:
      "A specific game's Workshop browse page (needs its appid). Use for \"mods for <game>\".",
    keywords: ['browse workshop', 'game mods', 'workshop for a game', 'find mods for'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'myWorkshopSubscriptions',
    title: 'My Workshop Subscriptions',
    url: 'https://steamcommunity.com/my/myworkshopfiles/?browsefilter=mysubscriptions',
    section: 'workshop',
    description:
      'The Workshop items the user is subscribed to. Use for "my subscribed mods" / "unsubscribe from items".',
    keywords: ['my subscriptions', 'workshop subscriptions', 'subscribed mods', 'unsubscribe'],
    functionalities: ['view', 'configure'],
    needsAuth: true,
  },
  {
    id: 'myWorkshopSubmissions',
    title: 'My Workshop Submissions',
    url: 'https://steamcommunity.com/my/myworkshopfiles/?browsefilter=myfiles',
    section: 'workshop',
    description:
      'The Workshop items the user has created/published. Use for "mods I made" / "manage my workshop uploads".',
    keywords: ['my workshop items', 'my submissions', 'mods i made', 'my uploads', 'manage my workshop'],
    functionalities: ['view', 'configure', 'create'],
    needsAuth: true,
  },
  {
    id: 'marketHome',
    title: 'Community Market',
    url: 'https://steamcommunity.com/market/',
    section: 'market',
    description:
      'Buy and sell in-game items and cards for wallet funds; the logged-in page also has the "My Listings" and "My Market History" tabs. Use for "sell my items/cards" / "buy market items" / "my listings".',
    keywords: ['community market', 'marketplace', 'buy items', 'sell items', 'sell my trading cards', 'sell my cards', 'trading cards', 'my listings', 'market history'],
    functionalities: ['browse', 'buy', 'trade', 'view'],
    needsAuth: false,
  },
  {
    id: 'marketFaq',
    title: 'Community Market FAQ',
    url: 'https://help.steampowered.com/en/faqs/view/61F0-72B7-9A18-C70B',
    section: 'market',
    description:
      'Market eligibility, fees, holds, and rules (on the support domain). Use for "why can\'t I sell" / "market fees" / "market hold".',
    keywords: ['market faq', 'market rules', "why can't i sell", 'market fees', 'market hold'],
    functionalities: ['view', 'learn'],
    needsAuth: false,
  },
  {
    id: 'myInventory',
    title: 'My Inventory',
    url: 'https://steamcommunity.com/my/inventory/',
    section: 'inventory',
    description:
      'The user\'s items, trading cards, gifts, coupons, backgrounds, and emoticons. Use for "my items" / "my cards" / "my gifts" / "see my inventory".',
    keywords: ['my inventory', 'my items', 'my cards', 'trading cards', 'my gifts', 'see my items'],
    functionalities: ['view', 'trade', 'browse'],
    needsAuth: true,
  },
  {
    id: 'tradeOffers',
    title: 'Trade Offers',
    url: 'https://steamcommunity.com/my/tradeoffers/',
    section: 'inventory',
    description:
      'Incoming and pending trade offers. Use for "my trade offers" / "accept a trade" / "pending trades".',
    keywords: ['trade offers', 'my trades', 'incoming trades', 'accept a trade', 'pending trades'],
    functionalities: ['view', 'trade', 'configure'],
    needsAuth: true,
  },
  {
    id: 'tradeUrl',
    title: 'Trade URL / Trade Settings',
    url: 'https://steamcommunity.com/my/tradeoffers/privacy',
    section: 'inventory',
    description:
      'Find/regenerate the Trade URL and set who may send trade offers. Use for "my trade link" / "get my trade URL" / "who can trade with me".',
    keywords: ['trade url', 'my trade link', 'trade offer settings', 'who can trade with me', 'get my trade url'],
    functionalities: ['configure', 'view'],
    needsAuth: true,
  },
  {
    id: 'pendingGifts',
    title: 'Pending Gifts / Gift History',
    url: 'https://steamcommunity.com/my/inventory/#gifts',
    section: 'inventory',
    description:
      'Gifts sent or received that await acceptance, plus gift history (in the Steam section of your inventory; unaccepted gifts auto-refund). Use for "did I get a gift" / "accept a gift" / "gift history".',
    keywords: ['pending gifts', 'gift history', 'received a gift', 'sent gifts', 'unaccepted gift', 'accept a gift'],
    functionalities: ['view', 'trade'],
    needsAuth: true,
  },
  {
    id: 'workshopFavorites',
    title: 'My Workshop Favorites',
    url: 'https://steamcommunity.com/my/myworkshopfiles/?section=favorites',
    section: 'workshop',
    description:
      'Workshop items you have favorited across all games. Use for "my favorited workshop items" / "saved mods".',
    keywords: ['workshop favorites', 'favorited items', 'saved workshop', 'my favorites workshop'],
    functionalities: ['view', 'configure'],
    needsAuth: true,
  },
  {
    id: 'workshopCollections',
    title: 'My Workshop Collections',
    url: 'https://steamcommunity.com/my/myworkshopfiles/?section=collections',
    section: 'workshop',
    description:
      'Collections you created to group Workshop items, plus collections you follow. Use for "my workshop collections" / "manage collections".',
    keywords: ['workshop collections', 'my collections', 'item collections', 'mod collections'],
    functionalities: ['view', 'create', 'configure'],
    needsAuth: true,
  },
  {
    id: 'pointsSummary',
    title: 'Points Summary / Balance',
    url: 'https://store.steampowered.com/points/summary/',
    section: 'wallet',
    description:
      'Your Steam Points balance and the history of points earned and spent (companion to the Points Shop). Use for "my points balance" / "how many points do I have" / "points history".',
    keywords: ['points balance', 'my steam points balance', 'points earned', 'points history', 'how many points do i have'],
    functionalities: ['view'],
    needsAuth: true,
  },
]

export { SOCIAL }

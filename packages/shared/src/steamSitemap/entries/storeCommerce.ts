import type { SitemapEntry } from '../types'

/** Store-domain commerce: wishlist, cart, wallet, redeem, and page patterns. */
const STORE_COMMERCE: SitemapEntry[] = [
  {
    id: 'wishlist',
    title: 'Wishlist',
    url: 'https://store.steampowered.com/wishlist/',
    section: 'store',
    description:
      "The user's store wishlist of games they want, with sale notifications. Use for \"my wishlist\" / \"saved games\". (This is the web wishlist; the app also has its own Wishlist tab.)",
    keywords: ['wishlist', 'my wishlist', 'saved games', 'want list', 'saved for later'],
    functionalities: ['browse', 'manage'],
    needsAuth: true,
  },
  {
    id: 'cart',
    title: 'Shopping Cart',
    url: 'https://store.steampowered.com/cart/',
    section: 'store',
    description:
      'The shopping cart holding games queued for purchase. Use for "my cart" / "checkout" / "buy now".',
    keywords: ['cart', 'shopping cart', 'basket', 'checkout', 'buy now'],
    functionalities: ['buy', 'manage'],
    needsAuth: true,
  },
  {
    id: 'pointsShop',
    title: 'Points Shop',
    url: 'https://store.steampowered.com/points/shop/',
    section: 'store',
    description:
      'Spend Steam Points (earned from purchases/events) on profile cosmetics, chat effects, stickers, and animated items. Use for "Steam Points" / "spend points" / "profile items".',
    keywords: ['points shop', 'steam points', 'rewards', 'cosmetics', 'stickers', 'spend points', 'profile items'],
    functionalities: ['browse', 'redeem', 'buy'],
    needsAuth: true,
  },
  {
    id: 'addFunds',
    title: 'Add Wallet Funds',
    url: 'https://store.steampowered.com/account/addfunds',
    section: 'wallet',
    description:
      'Top up the Steam Wallet balance with a payment method. Use for "add funds" / "add money" / "top up wallet".',
    keywords: ['add funds', 'wallet', 'top up', 'add money', 'steam wallet', 'add credit', 'fund my account'],
    functionalities: ['buy', 'redeem'],
    needsAuth: true,
  },
  {
    id: 'redeemWalletCode',
    title: 'Redeem a Wallet / Gift Card Code',
    url: 'https://store.steampowered.com/account/redeemwalletcode',
    section: 'wallet',
    description:
      'Redeem a Steam wallet code or digital gift card to add balance (distinct from a game CD key). Use for "redeem a gift card" / "wallet code".',
    keywords: ['redeem wallet code', 'gift card', 'steam card', 'redeem code', 'add gift card balance'],
    functionalities: ['redeem'],
    needsAuth: true,
  },
  {
    id: 'activateProduct',
    title: 'Activate a Product (CD key)',
    url: 'https://store.steampowered.com/account/registerkey',
    section: 'wallet',
    description:
      'Redeem a Steam product/CD key to add a game to the library. Use for "activate a key" / "redeem a game code" / "register a key".',
    keywords: ['activate a product', 'redeem key', 'cd key', 'product code', 'register key', 'add game with key'],
    functionalities: ['redeem', 'activate'],
    needsAuth: true,
  },
  {
    id: 'giftCards',
    title: 'Steam Digital Gift Cards',
    url: 'https://store.steampowered.com/digitalgiftcards/',
    section: 'wallet',
    description:
      'Send a digital Steam gift card (wallet credit) to a friend. Use for "send a gift card" / "gift Steam credit".',
    keywords: ['gift card', 'digital gift card', 'steam gift', 'send credit', 'gift wallet funds'],
    functionalities: ['buy', 'redeem'],
    needsAuth: false,
  },
  {
    id: 'appPage',
    title: 'Game Store Page',
    url: 'https://store.steampowered.com/app/<appid>/',
    section: 'store',
    description:
      'The store page for a single game/app (media, price, reviews, buy). Prefer the open_store_page tool when you have an appid; this entry documents the URL pattern.',
    keywords: ['game page', 'store page', 'buy this game', 'game details'],
    functionalities: ['buy', 'browse'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'gameNews',
    title: 'Game News (per game)',
    url: 'https://store.steampowered.com/news/app/<appid>',
    section: 'news',
    description:
      "A single game's news/update feed. Use for patch notes/announcements for one game (needs its appid).",
    keywords: ['game news', 'update for', 'patch notes for', 'game announcements'],
    functionalities: ['read', 'browse'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'publisherPage',
    title: 'Publisher / Developer Page',
    url: 'https://store.steampowered.com/publisher/',
    section: 'store',
    description:
      'A creator homepage listing a studio\'s games (pattern: /publisher/<name> or /developer/<name>). Use for "all games by <studio>".',
    keywords: ['publisher', 'developer', 'studio', 'all games by', 'from this developer'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
  {
    id: 'franchisePage',
    title: 'Franchise Hub',
    url: 'https://store.steampowered.com/franchise/',
    section: 'store',
    description:
      'A franchise hub gathering all titles in a series (pattern: /franchise/<name>). Use for "all games in the series".',
    keywords: ['franchise', 'series', 'all games in series', 'saga'],
    functionalities: ['browse', 'discover'],
    needsAuth: false,
  },
]

export { STORE_COMMERCE }

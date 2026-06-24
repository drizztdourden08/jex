import type { SitemapEntry } from '../types'

/** User content (screenshots/artwork/guides), reviews, badges & achievements. */
const CONTENT: SitemapEntry[] = [
  {
    id: 'myScreenshots',
    title: 'My Screenshots',
    url: 'https://steamcommunity.com/my/screenshots/',
    section: 'content',
    description:
      'The user\'s uploaded screenshots, with manage/upload. Use for "where are my screenshots" / "upload a screenshot" / "manage screenshots".',
    keywords: ['my screenshots', 'where are my screenshots', 'upload screenshot', 'manage screenshots', 'delete screenshot'],
    functionalities: ['view', 'create', 'configure'],
    needsAuth: true,
  },
  {
    id: 'myArtwork',
    title: 'My Artwork',
    url: 'https://steamcommunity.com/my/images/',
    section: 'content',
    description:
      'The user\'s uploaded artwork. Use for "my artwork" / "manage my art".',
    keywords: ['my artwork', 'my art', 'uploaded artwork', 'manage artwork'],
    functionalities: ['view', 'create', 'configure'],
    needsAuth: true,
  },
  {
    id: 'myVideos',
    title: 'My Videos',
    url: 'https://steamcommunity.com/my/videos/',
    section: 'content',
    description:
      'Videos the user has linked/published to the community. Use for "my videos" / "manage my game videos".',
    keywords: ['my videos', 'uploaded videos', 'manage videos', 'my game videos'],
    functionalities: ['view', 'create', 'configure'],
    needsAuth: true,
  },
  {
    id: 'myGuides',
    title: 'My Guides',
    url: 'https://steamcommunity.com/my/myworkshopfiles/?section=guides',
    section: 'content',
    description:
      'Guides the user has authored. Use for "my guides" / "manage my published guides". (Write a new guide from a game\'s community hub.)',
    keywords: ['my guides', 'guides i wrote', 'manage my guides', 'my published guides'],
    functionalities: ['view', 'create', 'configure'],
    needsAuth: true,
  },
  {
    id: 'myReviews',
    title: 'My Reviews',
    url: 'https://steamcommunity.com/my/recommended/',
    section: 'reviews',
    description:
      'The game reviews/recommendations the user has written. Use for "my reviews" / "edit my review".',
    keywords: ['my reviews', 'reviews i wrote', 'edit my review', 'my recommendations'],
    functionalities: ['view', 'configure'],
    needsAuth: true,
  },
  {
    id: 'writeReview',
    title: 'Review a Game',
    url: 'https://steamcommunity.com/app/<appid>/reviews/',
    section: 'reviews',
    description:
      "A game's reviews page, where owners get the Write-a-Review control (needs appid). Use for \"write a review\" / \"recommend a game\" / \"rate a game\".",
    keywords: ['write a review', 'recommend a game', 'review this game', 'leave a review', 'rate a game'],
    functionalities: ['create', 'view', 'browse'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'myBadges',
    title: 'My Badges & Steam Level',
    url: 'https://steamcommunity.com/my/badges/',
    section: 'profile',
    description:
      'Earned and craftable badges, the user\'s Steam Level, and XP. Crafting a completed trading-card set here raises the level. Use for "my badges" / "my level" / "level up" / "craft a badge".',
    keywords: ['my badges', 'badges', 'steam level', 'my level', 'xp', 'level up', 'craft a badge'],
    functionalities: ['view', 'create'],
    needsAuth: true,
  },
  {
    id: 'tradingCardsInfo',
    title: 'Trading Cards & Badges FAQ',
    url: 'https://steamcommunity.com/tradingcards/faq/Badges',
    section: 'community',
    description:
      'Explains trading cards, sets, booster packs, badges, and leveling. Use to LEARN how cards/badges work (not to manage your own).',
    keywords: ['what are trading cards', 'how do badges work', 'trading card faq', 'booster packs', 'card sets'],
    functionalities: ['learn', 'view'],
    needsAuth: false,
  },
  {
    id: 'myAchievements',
    title: 'My Achievements (per game)',
    url: 'https://steamcommunity.com/my/stats/<appid>/achievements/',
    section: 'profile',
    description:
      "The user's achievements for one game (needs appid). Use for \"my achievements in <game>\" / \"achievement progress\".",
    keywords: ['my achievements', 'achievements for', 'what achievements do i have', 'achievement progress'],
    functionalities: ['view'],
    needsAuth: true,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'globalAchievements',
    title: 'Global Achievement Stats (per game)',
    url: 'https://steamcommunity.com/stats/<appid>/achievements/',
    section: 'community',
    description:
      'Global achievement-unlock percentages across all players for one game (needs appid). Use for "achievement rarity" / "how many players got X".',
    keywords: ['global achievement stats', 'achievement rarity', 'how many players got', 'achievement percentages'],
    functionalities: ['view'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'gameCommunityHub',
    title: 'Game Community Hub',
    url: 'https://steamcommunity.com/app/<appid>',
    section: 'community',
    description:
      "A game's community hub (screenshots, artwork, broadcasts, guides, discussions, reviews). Prefer the open_community_hub tool when you have an appid; this documents the pattern.",
    keywords: ['game hub', 'community hub', 'game community page', 'game discussions', 'game artwork'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
    dynamic: true,
    param: 'appid',
  },
  {
    id: 'broadcasts',
    title: 'Broadcasts (Live Streaming)',
    url: 'https://steamcommunity.com/?subsection=broadcasts',
    section: 'community',
    description:
      'Community live broadcasts (Steam Broadcasting). Use for "watch live streams" / "who is streaming".',
    keywords: ['broadcasts', 'live streams', 'watch streams', 'steam broadcasting', 'who is streaming'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
  },
]

export { CONTENT }

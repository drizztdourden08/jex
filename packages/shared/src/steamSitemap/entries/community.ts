import type { SitemapEntry } from '../types'

/** Community-domain: home/forums, profile, friends, chat, groups. */
const COMMUNITY: SitemapEntry[] = [
  {
    id: 'communityHome',
    title: 'Steam Community Home',
    url: 'https://steamcommunity.com/',
    section: 'community',
    description:
      'The Community front page (recent activity, featured content) and entry to all community sections. Use as the generic community landing.',
    keywords: ['community home', 'steam community', 'community front page', 'community hub'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
  },
  {
    id: 'discussions',
    title: 'Community Discussions / Forums',
    url: 'https://steamcommunity.com/discussions/',
    section: 'community',
    description:
      'The global discussion forums across all games and Steam topics. Use for "forums" / "discussions" not tied to one game.',
    keywords: ['forums', 'discussions', 'steam forum', 'help and tips', 'community forum'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
  },
  {
    id: 'myProfile',
    title: 'My Profile',
    url: 'https://steamcommunity.com/my',
    section: 'profile',
    description:
      'The user\'s own Steam profile (/my redirects to their canonical profile). Use for "view my profile" / "my page".',
    keywords: ['my profile', 'my steam profile', 'view my profile', 'my page'],
    functionalities: ['view'],
    needsAuth: true,
  },
  {
    id: 'editProfile',
    title: 'Edit Profile',
    url: 'https://steamcommunity.com/my/edit/info',
    section: 'profile',
    description:
      'Edit profile info: display name, summary, custom URL, country, featured badge. (The profile PICTURE/avatar is a separate page — see editAvatar.)',
    keywords: ['edit profile', 'change my name', 'change display name', 'customize profile', 'set custom url', 'profile summary'],
    functionalities: ['configure', 'edit'],
    needsAuth: true,
  },
  {
    id: 'editAvatar',
    title: 'Edit Avatar / Profile Picture',
    url: 'https://steamcommunity.com/my/edit/avatar',
    section: 'profile',
    description:
      'Change your profile picture / avatar — upload a new image or pick an animated avatar. Use for "change/edit my profile picture", "change my avatar", "upload a new profile photo".',
    keywords: [
      'change profile picture',
      'edit profile picture',
      'change avatar',
      'edit avatar',
      'profile photo',
      'upload avatar',
      'profile picture',
      'change my picture',
      'set avatar',
    ],
    functionalities: ['configure', 'edit'],
    needsAuth: true,
  },
  {
    id: 'editBackground',
    title: 'Profile Background',
    url: 'https://steamcommunity.com/my/edit/background',
    section: 'profile',
    description:
      'Change the profile background image (the banner behind your profile). Use for "change my profile background" / "profile banner". Backgrounds come from inventory items / the Points Shop.',
    keywords: ['profile background', 'change my background', 'profile banner', 'background image', 'edit background', 'change profile background'],
    functionalities: ['configure', 'edit'],
    needsAuth: true,
  },
  {
    id: 'editTheme',
    title: 'Profile Theme',
    url: 'https://steamcommunity.com/my/edit/theme',
    section: 'profile',
    description:
      'Pick the profile theme/style (color scheme and layout). Use for "change my profile theme" / "profile style".',
    keywords: ['profile theme', 'change profile theme', 'profile style', 'profile color', 'theme my profile'],
    functionalities: ['configure', 'edit'],
    needsAuth: true,
  },
  {
    id: 'profileShowcases',
    title: 'Profile Showcases',
    url: 'https://steamcommunity.com/my/edit/showcases',
    section: 'profile',
    description:
      'Add/arrange profile showcases (games, screenshots, badges, items, artwork). Use for "add a showcase" / "featured showcase".',
    keywords: ['showcases', 'profile showcase', 'add a showcase', 'featured showcase', 'screenshot showcase'],
    functionalities: ['configure', 'edit'],
    needsAuth: true,
  },
  {
    id: 'profilePrivacy',
    title: 'Profile Privacy Settings',
    url: 'https://steamcommunity.com/my/edit/settings',
    section: 'profile',
    description:
      'Privacy for profile, game details, playtime, friends list, inventory, and comments. Use for "make my profile private/public" / "hide my games" / "private inventory".',
    keywords: ['privacy settings', 'make profile private', 'make profile public', 'inventory privacy', 'who can see my games', 'hide my games'],
    functionalities: ['configure'],
    needsAuth: true,
  },
  {
    id: 'recentActivity',
    title: 'Activity Feed',
    url: 'https://steamcommunity.com/my/home/',
    section: 'profile',
    description:
      'The user\'s home activity feed: friends\' posts, achievements, screenshots, status updates. Use for "activity feed" / "what my friends are doing".',
    keywords: ['activity feed', 'recent activity', 'my home', 'what my friends are doing', 'news feed'],
    functionalities: ['view', 'browse'],
    needsAuth: true,
  },
  {
    id: 'myGamesList',
    title: 'My Games (Community)',
    url: 'https://steamcommunity.com/my/games/',
    section: 'community',
    description:
      'The community-side list of all games on your account, with playtime and recently-played sorting. Use for "my games list" / "recently played", or to jump into per-game community hubs.',
    keywords: ['my games', 'games list', 'community games', 'recently played games', 'playtime list'],
    functionalities: ['view', 'browse'],
    needsAuth: true,
  },
  {
    id: 'myPerfectGames',
    title: 'Perfect Games (100% Achievements)',
    url: 'https://steamcommunity.com/my/games/?tab=perfect',
    section: 'profile',
    description:
      'Your games where you have unlocked 100% of achievements. Use for "perfect games" / "100% completed games" / "games I fully completed".',
    keywords: ['perfect games', '100% achievements', 'completed games', 'fully completed', 'achievement completion'],
    functionalities: ['view'],
    needsAuth: true,
  },
  {
    id: 'commentNotifications',
    title: 'Comment Notifications / Inbox',
    url: 'https://steamcommunity.com/my/commentnotifications/',
    section: 'profile',
    description:
      'An inbox of recent comments left on your profile, screenshots, and other content. Use for "who commented on my profile" / "comment inbox".',
    keywords: ['comment notifications', 'comment inbox', 'who commented', 'profile comments', 'comment history'],
    functionalities: ['view'],
    needsAuth: true,
  },
  {
    id: 'communityGuidelines',
    title: 'Community Guidelines / Online Conduct',
    url: 'https://store.steampowered.com/online_conduct/',
    section: 'community',
    description:
      'The Steam Online Conduct / community rules (acceptable behavior, content, trading). Use for "community rules" / "what\'s allowed" / "code of conduct".',
    keywords: ['community guidelines', 'community rules', 'online conduct', 'code of conduct', "what's allowed"],
    functionalities: ['learn'],
    needsAuth: false,
  },
]

export { COMMUNITY }

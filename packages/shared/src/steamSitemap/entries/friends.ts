import type { SitemapEntry } from '../types'

/** Community-domain: friends, chat, and groups. */
const FRIENDS: SitemapEntry[] = [
  {
    id: 'friendsList',
    title: 'Friends List',
    url: 'https://steamcommunity.com/my/friends/',
    section: 'friends',
    description:
      'The friends list with online status. Use for "my friends" / "who is online".',
    keywords: ['friends list', 'my friends', 'who is online', 'see my friends'],
    functionalities: ['view', 'browse'],
    needsAuth: true,
  },
  {
    id: 'addFriends',
    title: 'Add Friends / Invite',
    url: 'https://steamcommunity.com/my/friends/add/',
    section: 'friends',
    description:
      'Add friends by name, friend code, or invite link, and respond to pending invites. Use for "add a friend" / "friend code" / "send a friend request".',
    keywords: ['add friend', 'invite friend', 'friend code', 'send friend request', 'friend invite link'],
    functionalities: ['create', 'configure'],
    needsAuth: true,
  },
  {
    id: 'blockedFriends',
    title: 'Blocked / Manage Friends',
    url: 'https://steamcommunity.com/my/friends/blocked/',
    section: 'friends',
    description:
      'Manage friends including the blocked/ignored list. Use for "unblock someone" / "blocked users" / "remove a friend".',
    keywords: ['blocked users', 'manage friends', 'unblock', 'ignored users', 'remove friend'],
    functionalities: ['configure', 'view'],
    needsAuth: true,
  },
  {
    id: 'steamChat',
    title: 'Steam Chat (Web)',
    url: 'https://steamcommunity.com/chat',
    section: 'friends',
    description:
      'The full web Steam Chat client: 1:1/group text and voice chat. Use for "message a friend" / "open chat" / "voice chat".',
    keywords: ['steam chat', 'message a friend', 'web chat', 'voice chat', 'group chat', 'open chat'],
    functionalities: ['view', 'configure'],
    needsAuth: true,
  },
  {
    id: 'myGroups',
    title: 'My Groups',
    url: 'https://steamcommunity.com/my/groups/',
    section: 'groups',
    description:
      'The Steam groups the user belongs to. Use for "my groups" / "leave a group".',
    keywords: ['my groups', "groups i'm in", 'see my groups', 'leave a group'],
    functionalities: ['view', 'browse'],
    needsAuth: true,
  },
  {
    id: 'createGroup',
    title: 'Create a Group',
    url: 'https://steamcommunity.com/groups/creategroup',
    section: 'groups',
    description:
      'Form to create a new Steam group (name, clan tag, custom link, public/private). Use for "make a group" / "start a clan".',
    keywords: ['create group', 'make a group', 'new group', 'start a group', 'create clan'],
    functionalities: ['create'],
    needsAuth: true,
  },
  {
    id: 'findGroups',
    title: 'Find Groups',
    url: 'https://steamcommunity.com/search/groups/',
    section: 'groups',
    description:
      'Search community groups by name or topic. Use for "find groups" / "join a group" / "discover groups".',
    keywords: ['find groups', 'search groups', 'join a group', 'discover groups', 'group search'],
    functionalities: ['browse', 'view'],
    needsAuth: false,
  },
  {
    id: 'pendingFriendInvites',
    title: 'Pending Friend Invites',
    url: 'https://steamcommunity.com/my/home/invites/',
    section: 'friends',
    description:
      'Incoming and outgoing friend requests awaiting action. Use for "friend requests" / "pending invites" / "accept/decline a request".',
    keywords: ['pending invites', 'friend requests', 'incoming requests', 'outgoing requests', 'invitations'],
    functionalities: ['view', 'configure'],
    needsAuth: true,
  },
  {
    id: 'followingUsers',
    title: 'Following (Users)',
    url: 'https://steamcommunity.com/my/following/',
    section: 'friends',
    description:
      'The Steam users (non-friends) you follow to see their activity, guides, and reviews. Use for "users I follow" / "people I follow".',
    keywords: ['following', 'users i follow', 'people i follow', 'followed users', 'creators i follow'],
    functionalities: ['view', 'configure'],
    needsAuth: true,
  },
  {
    id: 'followedGames',
    title: 'Followed Games & Software',
    url: 'https://steamcommunity.com/my/followedgames/',
    section: 'friends',
    description:
      'Games/software you follow (not own) to get their announcements in your feed — separate from the store wishlist. Use for "games I follow" / "followed games".',
    keywords: ['followed games', 'games i follow', 'following games', 'software i follow', 'game announcements'],
    functionalities: ['view', 'configure'],
    needsAuth: true,
  },
]

export { FRIENDS }

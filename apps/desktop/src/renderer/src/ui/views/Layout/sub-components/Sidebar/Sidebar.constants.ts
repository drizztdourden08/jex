import type { GlyphName } from '@ds/primitives/media/Glyph'

// AI lives in the top command bar (the drawer), so it's not a nav item.
const links: { to: string; label: string; icon: GlyphName }[] = [
  { to: '/store', label: 'Store', icon: 'store' },
  { to: '/search', label: 'Search', icon: 'search' },
  { to: '/wishlist', label: 'Wishlist', icon: 'heart' },
  { to: '/library', label: 'Library', icon: 'library' },
  { to: '/randomizer', label: 'Randomizer', icon: 'shuffle' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

export { links }

import type { Game } from '@shared/library'

/** Map an origin pathname to the back link's destination + label. */
const backTarget = (from?: string): { to: string; label: string } => {
  if (from?.startsWith('/wishlist')) return { to: '/wishlist', label: 'Wishlist' }
  if (from?.startsWith('/randomizer')) return { to: '/randomizer', label: 'Randomizer' }
  if (from?.startsWith('/search')) return { to: '/search', label: 'Search' }
  return { to: '/library', label: 'Library' }
}

const statusFor = (game: Game, sizeGb: string | null): string =>
  game.installed
    ? `Installed${sizeGb ? ` · ${sizeGb} GB` : ''}`
    : game.owned
      ? 'Owned (not installed)'
      : 'Not installed'

export { backTarget, statusFor }

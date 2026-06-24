import type { Game } from '@shared/library'
import { capsuleUrl, heroCdnUrl, localArtUrl } from '@/lib/steam/media'

const hrs = (min?: number): string | null => {
  if (!min || min <= 0) return null
  return `${Math.round(min / 60)}h`
}

const num = (n?: number): string => {
  return typeof n === 'number' ? n.toLocaleString() : '—'
}

/** Map an origin pathname to the back link's destination + label. */
const backTarget = (from?: string): { to: string; label: string } => {
  if (from?.startsWith('/wishlist')) return { to: '/wishlist', label: 'Wishlist' }
  if (from?.startsWith('/randomizer')) return { to: '/randomizer', label: 'Randomizer' }
  if (from?.startsWith('/search')) return { to: '/search', label: 'Search' }
  return { to: '/library', label: 'Library' }
}

// Poster fallback chain: tall CDN cover → locally-cached header (the one the
// library card uses, so it's known to exist) → CDN header. object-fit:cover
// crops a wide header to fill the tall poster cleanly.
const posterSources = (game: Game): string[] => [
  heroCdnUrl(game.appid),
  localArtUrl(game.appid, 'header'),
  capsuleUrl(game),
]

const statusFor = (game: Game, sizeGb: string | null): string =>
  game.installed
    ? `Installed${sizeGb ? ` · ${sizeGb} GB` : ''}`
    : game.owned
      ? 'Owned (not installed)'
      : 'Not installed'

export { hrs, num, backTarget, posterSources, statusFor }

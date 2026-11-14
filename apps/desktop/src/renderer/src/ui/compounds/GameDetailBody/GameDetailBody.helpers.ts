import type { Game } from '@shared/library'
import { capsuleUrl, heroCdnUrl, localArtUrl } from '@/lib/steam/media'

const hrs = (min?: number): string | null => {
  if (!min || min <= 0) return null
  return `${Math.round(min / 60)}h`
}

const num = (n?: number): string => {
  return typeof n === 'number' ? n.toLocaleString() : '—'
}

// Poster fallback chain: tall CDN cover → locally-cached header (the one the
// library card uses, so it's known to exist) → CDN header. object-fit:cover
// crops a wide header to fill the tall poster cleanly.
const posterSources = (game: Game): string[] => [
  heroCdnUrl(game.appid),
  localArtUrl(game.appid, 'header'),
  capsuleUrl(game),
]

export { hrs, num, posterSources }

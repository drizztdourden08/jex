import { memo, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Game } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'
import { Image } from '@ds/primitives/media/Image'
import { capsuleUrl, localArtUrl } from '@/lib/steam/media'
import { FeatureIcon, activeFeatures } from '@ui/compounds/FeatureIcon'
import { ArtFallback } from '@ui/compounds/ArtFallback'

const sizeLabel = (bytes?: number): string => {
  if (!bytes) return ''
  const gb = bytes / 1e9
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${Math.round(bytes / 1e6)} MB`
}

const subtitle = (g: Game): string => {
  if (g.playtimeForever > 0) return `${Math.round(g.playtimeForever / 60)}h played`
  if (g.installed) return sizeLabel(g.sizeOnDisk) || 'Installed'
  return g.owned ? 'Unplayed' : 'Not installed'
}

/** Library cover card. Uses locally-cached art first, CDN as fallback.
 *  Memoized: a 1000+ grid otherwise re-reconciles every card on each filter click.
 *  `action` renders an overlay control in the top-right (e.g. add-to-sub-wishlist). */
const GameCard = memo(function GameCard({
  game,
  action,
  showStatus = true,
  subtitle: subtitleOverride,
}: {
  game: Game
  action?: ReactNode
  /** Show the install/owned dot + status line. Off for surfaces (e.g. Wishlist)
   *  where install state is irrelevant. */
  showStatus?: boolean
  /** Replace the status line text (used with showStatus=false). */
  subtitle?: ReactNode
}) {
  const badges = activeFeatures(game.features, true).slice(0, 3)
  // Remember where we came from so the detail page's back link is dynamic.
  const from = useLocation().pathname
  const [failed, setFailed] = useState(false)
  return (
    <Link to={`/game/${game.appid}`} state={{ from }} className="card">
      <Box className="card-art">
        {failed ? (
          <ArtFallback />
        ) : (
          <Image
            src={localArtUrl(game.appid)}
            alt=""
            loading="lazy"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement
              if (t.dataset.fb) {
                setFailed(true)
                return
              }
              t.dataset.fb = '1'
              t.src = capsuleUrl(game)
            }}
          />
        )}
        {action && <Box className="card-action">{action}</Box>}
        {badges.length > 0 && (
          <Box className="card-badges">
            {badges.map((b) => (
              <Box as="span" key={b.key} className="card-badge" title={b.label}>
                <FeatureIcon name={b.icon} size={13} />
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <Box className="body">
        <Box className="title">{game.name}</Box>
        {showStatus ? (
          <Box className="row muted" style={{ gap: 6, fontSize: 12 }}>
            <Box as="span" className={`dot ${game.installed ? 'inst' : 'own'}`} />
            {subtitle(game)}
          </Box>
        ) : subtitleOverride != null && subtitleOverride !== '' ? (
          <Box className="row muted" style={{ gap: 6, fontSize: 12 }}>
            {subtitleOverride}
          </Box>
        ) : null}
      </Box>
    </Link>
  )
})

export { GameCard }

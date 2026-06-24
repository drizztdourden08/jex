import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Game } from '@shared/library'
import { capsuleUrl, localArtUrl } from '@/lib/steam/media'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { Image } from '@ds/primitives/media/Image'
import { ArtFallback } from '@ui/compounds/ArtFallback'

type PickCardProps = {
  game: Game
  onExclude: (appid: number) => void
}

const PickCard = ({ game: g, onExclude }: PickCardProps) => {
  const [failed, setFailed] = useState(false)
  return (
    <Box key={g.appid} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <Link to={`/game/${g.appid}`}>
        {failed ? (
          <ArtFallback />
        ) : (
          <Image
            src={localArtUrl(g.appid)}
            alt=""
            loading="lazy"
            onError={(e) => {
              const t = e.currentTarget as HTMLImageElement
              if (t.dataset.fb) {
                setFailed(true)
                return
              }
              t.dataset.fb = '1'
              t.src = capsuleUrl(g)
            }}
          />
        )}
      </Link>
      <Box className="body" style={{ flex: 1 }}>
        <Box className="title">{g.name}</Box>
        <Box className="row" style={{ gap: 6, marginTop: 8 }}>
          {g.installed ? (
            <Button
              style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={() => window.api.app.openExternal(`steam://run/${g.appid}`)}
            >
              ▶ Launch
            </Button>
          ) : (
            <Link to={`/game/${g.appid}`} className="pill" style={{ alignSelf: 'center' }}>
              Details
            </Link>
          )}
          <IconButton
            label="Not this one — reroll"
            style={{ padding: '4px 10px', fontSize: 12, background: 'var(--glass-2-bg)', marginLeft: 'auto' }}
            onClick={() => onExclude(g.appid)}
            title="Not this one — reroll"
          >
            ✕
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

export { PickCard }
export type { PickCardProps }

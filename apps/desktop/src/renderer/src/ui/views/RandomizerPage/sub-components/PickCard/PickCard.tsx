import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Game } from '@shared/library'
import { capsuleUrl, localArtUrl } from '@/lib/steam/media'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { StatusLine } from '@ds/primitives/text/StatusLine'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { Image } from '@ds/primitives/media/Image'
import { ArtFallback } from '@ui/compounds/ArtFallback'

const FROM = { from: '/randomizer' }

type PickCardProps = {
  game: Game
  launchBusy: boolean
  launchText: string
  onExclude: (appid: number) => void
  onLaunch: (appid: number) => void
}

const PickCard = ({ game: g, launchBusy, launchText, onExclude, onLaunch }: PickCardProps) => {
  const [failed, setFailed] = useState(false)
  return (
    <Box className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <Link to={`/game/${g.appid}`} state={FROM}>
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
              busy={launchBusy}
              style={{ padding: '4px 10px', fontSize: 12 }}
              onClick={() => onLaunch(g.appid)}
            >
              ▶ Launch
            </Button>
          ) : (
            <Link to={`/game/${g.appid}`} state={FROM} className="pill" style={{ alignSelf: 'center' }}>
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
        <StatusLine text={launchText} />
      </Box>
    </Box>
  )
}

export { PickCard }
export type { PickCardProps }

import type { Game } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'

type DetailHeaderProps = {
  game: Game
  statusText: string
  wlBusy: boolean
  wlMsg: string | null
  onOpen: (url: string) => void
  onOpenInStore: (url: string) => void
  onAddWishlist: () => void
}

const DetailHeader = ({
  game,
  statusText,
  wlBusy,
  wlMsg,
  onOpen,
  onOpenInStore,
  onAddWishlist,
}: DetailHeaderProps) => {
  return (
    <Box as="header" className="detail-header">
      <Box as="h1">{game.name}</Box>
      <Box className="row detail-status">
        <Box as="span" className={`dot ${game.installed ? 'inst' : 'own'}`} />
        <Box as="span" className="muted">
          {statusText}
          {game.playtimeForever > 0 && ` · ${Math.round(game.playtimeForever / 60)}h played`}
          {game.releaseYear ? ` · ${game.releaseYear}` : ''}
        </Box>
      </Box>
      <Box className="row detail-actions">
        {game.installed && <Button onClick={() => onOpen(`steam://run/${game.appid}`)}>▶ Launch</Button>}
        {!game.installed && game.owned && (
          <Button onClick={() => onOpen(`steam://install/${game.appid}`)}>⬇ Install</Button>
        )}
        {!game.owned &&
          (game.wishlisted ? (
            <Button variant="ghost" className="ghost" disabled title="On your Steam wishlist">
              ✓ Wishlisted
            </Button>
          ) : (
            <Button onClick={onAddWishlist} disabled={wlBusy}>
              {wlBusy ? 'Adding…' : '＋ Wishlist'}
            </Button>
          ))}
        <Button variant="ghost" className="ghost" onClick={() => onOpenInStore(`https://store.steampowered.com/app/${game.appid}`)}>
          Store page
        </Button>
        <Button
          variant="ghost"
          className="ghost"
          onClick={() => onOpenInStore(`https://steamcommunity.com/app/${game.appid}/discussions/`)}
        >
          Discussions
        </Button>
      </Box>
      {wlMsg && (
        <Box as="p" className="muted" style={{ marginTop: 8, fontSize: 13 }}>
          {wlMsg}
        </Box>
      )}
    </Box>
  )
}

export { DetailHeader }
export type { DetailHeaderProps }

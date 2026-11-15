import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { StatusLine } from '@ds/primitives/text/StatusLine'
import { statusFor } from './GameDetailHeader.helpers'
import type { GameDetailHeaderProps } from './GameDetailHeader.type'
import './GameDetailHeader.css'

/**
 * A game's detail header: name, install status line and the action row (launch /
 * install, wishlist, store page, discussions). Shared by the full detail page and
 * the Library's detail pane. The wishlist button only shows when `onAddWishlist`
 * is given (and the game is not owned).
 */
const GameDetailHeader = ({
  game,
  wlBusy = false,
  wlMsg = null,
  launchBusy = false,
  launchText = '',
  onLaunch,
  onOpenInStore,
  onAddWishlist,
}: GameDetailHeaderProps) => {
  return (
    <Box as="header" className="detail-header">
      <Box as="h1">{game.name}</Box>
      <Box className="row detail-status">
        <Box as="span" className={`dot ${game.installed ? 'inst' : 'own'}`} />
        <Box as="span" className="muted">
          {statusFor(game)}
          {game.playtimeForever > 0 && ` · ${Math.round(game.playtimeForever / 60)}h played`}
          {game.releaseYear ? ` · ${game.releaseYear}` : ''}
        </Box>
      </Box>
      <Box className="row detail-actions">
        {game.installed && (
          <Button busy={launchBusy} onClick={() => onLaunch('run')}>
            ▶ Launch
          </Button>
        )}
        {!game.installed && game.owned && (
          <Button busy={launchBusy} onClick={() => onLaunch('install')}>
            ⬇ Install
          </Button>
        )}
        {!game.owned &&
          onAddWishlist &&
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
      <StatusLine text={launchText} className="detail-launch-status" />
      {wlMsg && (
        <Box as="p" className="muted detail-wl-msg">
          {wlMsg}
        </Box>
      )}
    </Box>
  )
}

export { GameDetailHeader }

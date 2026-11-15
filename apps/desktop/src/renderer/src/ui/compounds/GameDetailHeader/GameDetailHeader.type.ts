import type { Game } from '@shared/library'
import type { LaunchAction } from '@shared/launch'

interface GameDetailHeaderProps {
  game: Game
  wlBusy?: boolean
  wlMsg?: string | null
  /** Launch / install through Steam; progress arrives via `launchBusy` / `launchText`. */
  onLaunch: (action: LaunchAction) => void
  launchBusy?: boolean
  /** The game is running now: Launch turns into Stop. */
  running?: boolean
  onStop?: () => void
  launchText?: string
  /** Open a Steam web page in the embedded Store tab. */
  onOpenInStore: (url: string) => void
  /** Add to the Steam wishlist; omit to hide the wishlist button. */
  onAddWishlist?: () => void
}

export type { GameDetailHeaderProps }

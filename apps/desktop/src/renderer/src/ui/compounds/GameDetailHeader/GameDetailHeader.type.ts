import type { Game } from '@shared/library'

interface GameDetailHeaderProps {
  game: Game
  wlBusy?: boolean
  wlMsg?: string | null
  /** Open a URL outside the app (steam:// launch/install links). */
  onOpen: (url: string) => void
  /** Open a Steam web page in the embedded Store tab. */
  onOpenInStore: (url: string) => void
  /** Add to the Steam wishlist; omit to hide the wishlist button. */
  onAddWishlist?: () => void
}

export type { GameDetailHeaderProps }

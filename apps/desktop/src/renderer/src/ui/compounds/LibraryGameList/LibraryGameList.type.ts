import type { Game } from '@shared/library'

type LibraryGameListProps = {
  games: Game[]
  /** appid of the selected game, or null when none is selected. */
  selectedAppid: number | null
  onSelect: (appid: number) => void
  className?: string
}

type LibraryGameRowProps = {
  game: Game
}

export type { LibraryGameListProps, LibraryGameRowProps }

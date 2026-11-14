import type { ReactNode } from 'react'
import type { Game } from '@shared/library'

type GameQuickActionsProps = {
  game: Game
  /** Opens a steam:// or https:// URL outside the app. */
  onOpen: (url: string) => void
  /** Extra controls after Play / Install (e.g. an "open full page" link). */
  extra?: ReactNode
}

export type { GameQuickActionsProps }

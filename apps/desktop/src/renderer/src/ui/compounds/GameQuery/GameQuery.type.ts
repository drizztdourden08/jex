import type { Game } from '@shared/library'
import type { QueryGroup } from '@shared/query'

interface GameQueryProps {
  query: QueryGroup
  onChange: (q: QueryGroup) => void
  games: Game[]
}

export type { GameQueryProps }

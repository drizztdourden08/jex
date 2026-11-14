import type { Game } from '@shared/library'

type SanitizedRequirements = {
  min: string | null
  rec: string | null
}

type GameDetailBodyProps = {
  /** null renders the loading skeleton. */
  game: Game | null
  extrasLoading: boolean
  /** Description HTML, already sanitized by the caller. */
  sanitized: string | null
  reqs: SanitizedRequirements | null
  autoplay: boolean
  /** Opens an external http(s) link (description links, Metacritic). */
  onOpen: (url: string) => void
}

export type { GameDetailBodyProps, SanitizedRequirements }

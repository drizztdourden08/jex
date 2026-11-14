import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Game } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'
import { GameDetailBody } from '@ui/compounds/GameDetailBody'
import type { SanitizedRequirements } from '@ui/compounds/GameDetailBody'
import { GameQuickActions } from '@ui/compounds/GameQuickActions'

type LibraryDetailPaneProps = {
  game: Game | null
  extrasLoading: boolean
  sanitized: string | null
  reqs: SanitizedRequirements | null
  autoplay: boolean
  onOpen: (url: string) => void
}

const FROM = { from: '/library' }

/** The Library's right pane: quick actions, then the shared detail body. Scrolls on its own. */
const LibraryDetailPane = ({ game, extrasLoading, sanitized, reqs, autoplay, onOpen }: LibraryDetailPaneProps) => {
  const ref = useRef<HTMLElement>(null)
  const appid = game?.appid

  // A new selection starts at its top, not at the previous game's scroll offset.
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 })
  }, [appid])

  if (!game)
    return (
      <Box as="section" className="lib-detail lib-detail-empty muted">
        Pick a game to see its details.
      </Box>
    )

  return (
    <Box ref={ref} as="section" className="lib-detail" aria-label={game.name}>
      <Box as="h2" className="lib-detail-title">
        {game.name}
      </Box>
      <GameQuickActions
        game={game}
        onOpen={onOpen}
        extra={
          <Link to={`/game/${game.appid}`} state={FROM} className="muted lib-detail-full">
            Open full page →
          </Link>
        }
      />
      {extrasLoading && (
        <Box as="p" className="muted lib-detail-loading">
          Loading details…
        </Box>
      )}
      <GameDetailBody
        game={game}
        extrasLoading={extrasLoading}
        sanitized={sanitized}
        reqs={reqs}
        autoplay={autoplay}
        onOpen={onOpen}
      />
    </Box>
  )
}

export { LibraryDetailPane }
export type { LibraryDetailPaneProps }

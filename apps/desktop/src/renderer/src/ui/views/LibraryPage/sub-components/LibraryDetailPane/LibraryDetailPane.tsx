import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Game } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'
import { GameDetailBody } from '@ui/compounds/GameDetailBody'
import type { SanitizedRequirements } from '@ui/compounds/GameDetailBody'
import { GameDetailHeader } from '@ui/compounds/GameDetailHeader'

type LibraryDetailPaneProps = {
  game: Game | null
  extrasLoading: boolean
  sanitized: string | null
  reqs: SanitizedRequirements | null
  autoplay: boolean
  onOpen: (url: string) => void
  onOpenInStore: (url: string) => void
}

const FROM = { from: '/library' }

/**
 * The Library's right pane, inside its own glass container: the game shown exactly as
 * its full detail page shows it (hero backdrop, header with status + actions, then the
 * shared detail body), with a link to that page. Scrolls on its own.
 */
const LibraryDetailPane = ({ game, extrasLoading, sanitized, reqs, autoplay, onOpen, onOpenInStore }: LibraryDetailPaneProps) => {
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

  const background = game.media?.background
  return (
    <Box as="section" className="lib-detail" aria-label={game.name}>
      {background && (
        <Box
          className="lib-detail-backdrop"
          style={{ backgroundImage: `url("${background.replace(/["\\]/g, '')}")` }}
        />
      )}
      <Box ref={ref} className="lib-detail-scroll">
        <Box className="lib-detail-topbar">
          <Link to={`/game/${game.appid}`} state={FROM} className="muted">
            Open full page →
          </Link>
          {extrasLoading && (
            <Box as="span" className="muted lib-detail-loading">
              Loading details…
            </Box>
          )}
        </Box>
        <GameDetailHeader game={game} onOpen={onOpen} onOpenInStore={onOpenInStore} />
        <GameDetailBody
          game={game}
          extrasLoading={extrasLoading}
          sanitized={sanitized}
          reqs={reqs}
          autoplay={autoplay}
          onOpen={onOpen}
        />
      </Box>
    </Box>
  )
}

export { LibraryDetailPane }
export type { LibraryDetailPaneProps }

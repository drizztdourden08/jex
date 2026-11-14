import type { MouseEvent } from 'react'
import type { Game } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'

type DetailDescriptionProps = {
  game: Game
  sanitized: string | null
  onDescClick: (e: MouseEvent<HTMLDivElement>) => void
}

const DetailDescription = ({ game, sanitized, onDescClick }: DetailDescriptionProps) => {
  return (
    <Box className="detail-desc">
      {sanitized ? (
        <Box
          className="steam-html"
          onClick={onDescClick}
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      ) : game.shortDescription ? (
        <Box as="p">{game.shortDescription}</Box>
      ) : (
        <Box as="p" className="muted">
          {game.enrichment === 'enriched'
            ? 'No description available.'
            : 'Metadata not fetched yet — add your Steam key (Settings) and sync.'}
        </Box>
      )}
    </Box>
  )
}

export { DetailDescription }
export type { DetailDescriptionProps }

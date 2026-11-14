import './GameDetailBody.css'
import type { MouseEvent } from 'react'
import { trailers } from '@/lib/steam/media'
import { Box } from '@ds/primitives/layout/Box'
import { MediaCarousel } from '@ui/compounds/MediaCarousel'
import { DetailPoster } from './sub-components/DetailPoster'
import { DetailHeadline } from './sub-components/DetailHeadline'
import { DetailDescription } from './sub-components/DetailDescription'
import { MetaSidebar } from './sub-components/MetaSidebar'
import { BodySkeleton } from './sub-components/BodySkeleton'
import type { GameDetailBodyProps } from './GameDetailBody.type'

/**
 * Everything a game's detail shows below its header: poster + media, the review /
 * score strip, system requirements, the description and the metadata sidebar.
 * Shared by the full detail page and the Library's detail pane. Its columns
 * collapse on the body's own width (a container query), not the window's, so it
 * fits a narrow pane as well as a full page.
 */
const GameDetailBody = ({ game, extrasLoading, sanitized, reqs, autoplay, onOpen }: GameDetailBodyProps) => {
  if (!game)
    return (
      <Box className="gd-body">
        <BodySkeleton />
      </Box>
    )

  // Description HTML may contain <a href>; open those outside instead of navigating
  // the renderer away from the app shell.
  const onDescClick = (e: MouseEvent<HTMLDivElement>) => {
    const href = (e.target as HTMLElement).closest('a')?.getAttribute('href')
    if (href && /^https?:/i.test(href)) {
      e.preventDefault()
      onOpen(href)
    }
  }

  return (
    <Box className="gd-body">
      <Box className="detail-row1">
        <DetailPoster key={game.appid} game={game} />
        <Box className="detail-media">
          {/* Keyed per game so the selected slide and "user picked a video" state
              never leak into the next game (which would autoplay its trailer). */}
          <MediaCarousel
            key={game.appid}
            videos={trailers(game)}
            shots={game.media?.screenshots ?? []}
            autoplay={autoplay}
          />
        </Box>
      </Box>

      <DetailHeadline game={game} extrasLoading={extrasLoading} onOpen={onOpen} />

      {reqs && (
        <Box as="details" className="detail-reqs">
          <Box as="summary">System requirements</Box>
          <Box className="reqs-cols">
            {reqs.min && <Box className="steam-html" dangerouslySetInnerHTML={{ __html: reqs.min }} />}
            {reqs.rec && <Box className="steam-html" dangerouslySetInnerHTML={{ __html: reqs.rec }} />}
          </Box>
        </Box>
      )}

      <Box className="detail-row2">
        <DetailDescription game={game} sanitized={sanitized} onDescClick={onDescClick} />
        <MetaSidebar game={game} extrasLoading={extrasLoading} />
      </Box>
    </Box>
  )
}

export { GameDetailBody }

import type { Game } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { num } from '../../behavior/detail-utils'
import { ReviewBar } from '../ReviewBar'
import { ReviewBarSkeleton } from '../ReviewBarSkeleton'

type DetailHeadlineProps = {
  game: Game
  extrasLoading: boolean
  onOpen: (url: string) => void
}

const DetailHeadline = ({ game, extrasLoading, onOpen }: DetailHeadlineProps) => {
  const mc = game.metacritic
  const mcTone = mc == null ? '' : mc >= 75 ? 'mc-good' : mc >= 50 ? 'mc-mid' : 'mc-bad'
  return (
    <Box className="detail-headline">
      {extrasLoading && !game.reviews && (
        <>
          <ReviewBarSkeleton />
          <ReviewBarSkeleton />
        </>
      )}
      {game.reviews?.recent && <ReviewBar label="Recent reviews" r={game.reviews.recent} />}
      {game.reviews?.overall && <ReviewBar label="All reviews" r={game.reviews.overall} />}
      {mc != null &&
        (game.metacriticUrl ? (
          <Button
            variant="ghost"
            type="button"
            className="headline-chip headline-link"
            onClick={() => onOpen(game.metacriticUrl!)}
            title="Open on Metacritic"
          >
            <Box as="span" className={`mc-badge ${mcTone}`}>{mc}</Box>
            <Box as="span" className="muted">Metacritic ↗</Box>
          </Button>
        ) : (
          <Box className="headline-chip">
            <Box as="span" className={`mc-badge ${mcTone}`}>{mc}</Box>
            <Box as="span" className="muted">Metacritic</Box>
          </Box>
        ))}
      {game.metacriticUser != null && (
        <Box className="headline-chip">
          <Box as="span" className="mc-user">{game.metacriticUser.toFixed(1)}</Box>
          <Box as="span" className="muted">User score</Box>
        </Box>
      )}
      {game.currentPlayers != null && (
        <Box className="headline-chip">
          <Box as="span" className="stat-big">{num(game.currentPlayers)}</Box>
          <Box as="span" className="muted">Playing now</Box>
        </Box>
      )}
    </Box>
  )
}

export { DetailHeadline }
export type { DetailHeadlineProps }

import { Link } from 'react-router-dom'
import { Box } from '@ds/primitives/layout/Box'
import { GameDetailBody } from '@ui/compounds/GameDetailBody'

type DetailSkeletonProps = {
  back: { to: string; label: string }
}

const noop = () => {}

/** Full-page skeleton shown before any core data (a new catalog game from Search). */
const DetailSkeleton = ({ back }: DetailSkeletonProps) => {
  return (
    <Box className="detail">
      <Box className="detail-topbar">
        <Link to={back.to} className="muted">
          ← {back.label}
        </Link>
      </Box>
      <Box as="header" className="detail-header">
        <Box className="skeleton skeleton-line" style={{ width: 320, height: 28 }} />
        <Box className="skeleton skeleton-line" style={{ width: 200, marginTop: 12 }} />
      </Box>
      <GameDetailBody game={null} extrasLoading sanitized={null} reqs={null} autoplay={false} onOpen={noop} />
    </Box>
  )
}

export { DetailSkeleton }
export type { DetailSkeletonProps }

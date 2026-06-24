import { Link } from 'react-router-dom'
import { Box } from '@ds/primitives/layout/Box'
import { ReviewBarSkeleton } from '../ReviewBarSkeleton'

type DetailSkeletonProps = {
  back: { to: string; label: string }
}

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
      <Box className="detail-row1">
        <Box className="skeleton detail-poster" />
        <Box className="skeleton detail-media-skeleton" />
      </Box>
      <Box className="detail-headline">
        <ReviewBarSkeleton />
        <ReviewBarSkeleton />
      </Box>
      <Box className="detail-row2">
        <Box className="detail-desc">
          {[100, 96, 90, 98, 80].map((w, i) => (
            <Box key={i} className="skeleton skeleton-line" style={{ width: `${w}%`, marginBottom: 8 }} />
          ))}
        </Box>
        <Box as="aside" className="meta-sidebar">
          <Box className="skeleton skeleton-block" />
          <Box className="skeleton skeleton-block" />
        </Box>
      </Box>
    </Box>
  )
}

export { DetailSkeleton }
export type { DetailSkeletonProps }

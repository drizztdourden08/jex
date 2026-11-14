import { Box } from '@ds/primitives/layout/Box'
import { ReviewBarSkeleton } from '../ReviewBarSkeleton'

const LINE_WIDTHS = [100, 96, 90, 98, 80]

/** Placeholder for the whole body before any core data has arrived. */
const BodySkeleton = () => (
  <>
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
        {LINE_WIDTHS.map((w, i) => (
          <Box key={i} className="skeleton skeleton-line" style={{ width: `${w}%`, marginBottom: 8 }} />
        ))}
      </Box>
      <Box as="aside" className="meta-sidebar">
        <Box className="skeleton skeleton-block" />
        <Box className="skeleton skeleton-block" />
      </Box>
    </Box>
  </>
)

export { BodySkeleton }

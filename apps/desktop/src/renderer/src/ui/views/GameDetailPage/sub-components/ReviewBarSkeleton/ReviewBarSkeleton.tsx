import { Box } from '@ds/primitives/layout/Box'

/** A pulsing placeholder for the review bars while stage-2 metadata loads. */
const ReviewBarSkeleton = () => {
  return (
    <Box className="review-bar">
      <Box className="review-bar-head">
        <Box as="span" className="skeleton skeleton-line" style={{ width: 90 }} />
        <Box as="span" className="skeleton skeleton-line" style={{ width: 70 }} />
      </Box>
      <Box className="skeleton skeleton-track" />
      <Box className="skeleton skeleton-line" style={{ width: 120, marginTop: 6 }} />
    </Box>
  )
}

export { ReviewBarSkeleton }

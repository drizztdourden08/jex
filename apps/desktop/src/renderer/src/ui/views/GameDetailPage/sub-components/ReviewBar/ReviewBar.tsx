import type { ReviewSummary } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'
import { num } from '../../behavior/detail-utils'

type ReviewBarProps = {
  label: string
  r: ReviewSummary
}

/** A positive-share bar, colored by sentiment. */
const ReviewBar = ({ label, r }: ReviewBarProps) => {
  const tone = r.percent >= 70 ? 'good' : r.percent >= 40 ? 'mid' : 'bad'
  return (
    <Box className="review-bar">
      <Box className="review-bar-head">
        <Box as="span" className="muted">{label}</Box>
        <Box as="span" className={`review-desc ${tone}`}>{r.desc}</Box>
      </Box>
      <Box className="review-track">
        <Box as="span" className={tone} style={{ width: `${r.percent}%` }} />
      </Box>
      <Box className="review-meta muted">
        {r.percent}% of {num(r.total)} reviews
      </Box>
    </Box>
  )
}

export { ReviewBar }
export type { ReviewBarProps }

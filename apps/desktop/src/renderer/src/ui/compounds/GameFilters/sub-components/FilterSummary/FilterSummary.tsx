import { Box } from '@ds/primitives/layout/Box'
import { Tag } from '@ds/primitives/feedback/Tag'
import { MAX_SUMMARY_TAGS } from '../../GameFilters.constants'
import type { FilterSummaryProps } from './FilterSummary.type'

/** Compact one-line recap of the active filters, shown while the panel is collapsed. */
const FilterSummary = ({ labels }: FilterSummaryProps) => {
  if (!labels.length) return <Box as="span" className="muted">No filters</Box>
  const shown = labels.slice(0, MAX_SUMMARY_TAGS)
  const extra = labels.length - shown.length
  return (
    <>
      {shown.map((l) => (
        <Tag key={l} label={l} />
      ))}
      {extra > 0 && <Box as="span" className="muted">+{extra} more</Box>}
    </>
  )
}

export { FilterSummary }

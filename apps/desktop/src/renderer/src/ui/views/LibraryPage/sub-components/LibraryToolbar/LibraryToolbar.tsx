import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { SegmentedControl } from '@ds/primitives/form/SegmentedControl'
import { SortControls } from '@ui/compounds/SortControls'
import type { FilterSpec } from '@shared/filter'
import type { LibraryDisplay } from '../../behavior/useLibraryDisplay'
import { DISPLAY_OPTIONS } from './LibraryToolbar.constants'
import './LibraryToolbar.css'

type LibraryToolbarProps = {
  shown: number
  spec: FilterSpec
  onSort: (patch: Partial<FilterSpec>) => void
  display: LibraryDisplay
  onDisplay: (display: LibraryDisplay) => void
  /** Show the clear-filters button (a filter is active). */
  canClear: boolean
  onClear: () => void
}

/** The right side of the Library's filter bar: result count, sort, display mode. */
const LibraryToolbar = ({ shown, spec, onSort, display, onDisplay, canClear, onClear }: LibraryToolbarProps) => (
  <>
    {canClear && (
      <Button variant="ghost" size="slim" onClick={onClear} title="Clear filters" className="lib-tools-clear">
        ✕ Clear
      </Button>
    )}
    <Box as="span" className="muted lib-tools-count">
      {shown} shown
    </Box>
    <SortControls value={spec} onChange={onSort} size="sm" />
    <SegmentedControl
      size="sm"
      options={DISPLAY_OPTIONS}
      value={display}
      onChange={(v) => onDisplay(v as LibraryDisplay)}
    />
  </>
)

export { LibraryToolbar }
export type { LibraryToolbarProps }

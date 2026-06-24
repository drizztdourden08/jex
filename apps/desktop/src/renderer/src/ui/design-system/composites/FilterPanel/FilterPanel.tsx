import { Box } from '@ds/primitives/layout/Box'
import { ResetOverlay } from './sub-components/ResetOverlay'
import type { FilterPanelProps } from './FilterPanel.type'
import './FilterPanel.css'

/** Generic faceted-filter panel shell: a topbar slot + a body that shows a reset
 *  overlay when dirty. Domain-agnostic — driven entirely by props. */
const FilterPanel = ({ topbar, dirty = false, reset, children }: FilterPanelProps) => (
  <Box className="panel filter-panel">
    <Box className="filter-topbar">{topbar}</Box>
    <Box className={`filter-body${dirty ? ' has-overlay' : ''}`}>
      {children}
      {dirty && reset && <ResetOverlay onClick={reset} />}
    </Box>
  </Box>
)

export { FilterPanel }

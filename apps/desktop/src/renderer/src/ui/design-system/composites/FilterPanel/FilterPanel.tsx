import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { Glyph } from '@ds/primitives/media/Glyph'
import { ResetOverlay } from './sub-components/ResetOverlay'
import type { FilterPanelProps } from './FilterPanel.type'
import './FilterPanel.css'

/** Generic faceted-filter panel shell: a topbar slot + a body that shows a reset
 *  overlay when dirty, and an optional collapse toggle that swaps the body for a
 *  `summary`. Domain-agnostic — driven entirely by props. */
const FilterPanel = ({
  topbar,
  dirty = false,
  reset,
  collapsed = false,
  onToggleCollapsed,
  summary,
  children,
}: FilterPanelProps) => {
  const isCollapsed = collapsed && !!onToggleCollapsed
  return (
    <Box className="panel filter-panel">
      <Box className="filter-topbar">
        {topbar}
        {onToggleCollapsed && (
          <IconButton
            label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
            size="sm"
            className="filter-collapse"
            aria-expanded={!isCollapsed}
            onClick={onToggleCollapsed}
          >
            <Glyph name="chevron-down" size={14} />
          </IconButton>
        )}
      </Box>
      {isCollapsed && summary && (
        <Button variant="ghost" className="filter-summary" onClick={onToggleCollapsed}>
          {summary}
        </Button>
      )}
      <Box className={`filter-collapse-wrap${isCollapsed ? ' is-collapsed' : ''}`} aria-hidden={isCollapsed || undefined}>
        <Box className={`filter-body${dirty ? ' has-overlay' : ''}`}>
          {children}
          {dirty && reset && <ResetOverlay onClick={reset} />}
        </Box>
      </Box>
    </Box>
  )
}

export { FilterPanel }

import './Tabs.css'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import type { TabsProps } from './Tabs.type'

// A row of tabs (the active one marked). Presentational: the view owns the selected id
// and renders the matching panel.
const Tabs = ({ tabs, value, onChange, 'aria-label': ariaLabel }: TabsProps) => (
  <Box className="ds-tabs" role="tablist" aria-label={ariaLabel}>
    {tabs.map((t) => (
      <Button
        key={t.id}
        variant="ghost"
        role="tab"
        aria-selected={t.id === value}
        className={`ds-tab${t.id === value ? ' ds-tab--active' : ''}`}
        onClick={() => onChange(t.id)}
      >
        {t.label}
      </Button>
    ))}
  </Box>
)

export { Tabs }

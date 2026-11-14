import './FactStrip.css'
import { Box } from '@ds/primitives/layout/Box'
import type { FactStripProps } from './FactStrip.type'

/**
 * A row of primary actions followed by small label/value facts. It wraps onto
 * extra lines in a narrow container instead of overflowing.
 */
const FactStrip = ({ actions, facts, className }: FactStripProps) => (
  <Box className={className ? `ds-facts ${className}` : 'ds-facts'}>
    {actions && <Box className="ds-facts-actions">{actions}</Box>}
    {facts.length > 0 && (
      <Box as="dl" className="ds-facts-list">
        {facts.map((f) => (
          <Box key={f.key} className="ds-fact" title={f.title}>
            <Box as="dt" className="ds-fact-label">
              {f.label}
            </Box>
            <Box as="dd" className="ds-fact-value">
              {f.value}
            </Box>
          </Box>
        ))}
      </Box>
    )}
  </Box>
)

export { FactStrip }

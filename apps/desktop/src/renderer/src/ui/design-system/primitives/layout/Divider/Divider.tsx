import './Divider.css'
import type { DividerProps } from './Divider.type'

// Thin hairline separator — horizontal by default, `vertical` for inline use.
const Divider = ({ vertical, className }: DividerProps) => (
  <div
    role="separator"
    aria-orientation={vertical ? 'vertical' : 'horizontal'}
    className={['ds-divider', vertical && 'ds-divider--v', className].filter(Boolean).join(' ')}
  />
)

export { Divider }

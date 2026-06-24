import './Chip.css'
import type { ChipProps } from './Chip.type'

// Interactive selectable pill — reflects `selected` via aria-pressed and a class.
const Chip = ({ selected, className, children, ...rest }: ChipProps) => (
  <button
    type="button"
    aria-pressed={selected}
    className={['ds-chip', selected && 'is-selected', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {children}
  </button>
)

export { Chip }

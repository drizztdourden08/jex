import { Box } from '@ds/primitives/layout/Box'
import type { ToggleProps } from './Toggle.type'
import './Toggle.css'

/** Switch primitive. Track + sliding knob. Hover adds a purple border + glow to the
 *  knob only — the track never changes color on hover. */
const Toggle = ({ on, onChange, disabled, className, title, label }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    title={title}
    disabled={disabled}
    className={['ds-toggle', on && 'is-on', className].filter(Boolean).join(' ')}
    onClick={() => onChange(!on)}
  >
    <Box as="span" className="ds-toggle-knob" />
  </button>
)

export { Toggle }

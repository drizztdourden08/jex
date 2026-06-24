import './Checkbox.css'
import type { CheckboxProps } from './Checkbox.type'

// The check glyph (provided SVG path). currentColor → the box's text color.
const CheckIcon = () => (
  <svg
    className="ds-checkbox-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 13L9 17L19 7" />
  </svg>
)

/**
 * Checkbox primitive — a real button with role="checkbox" (shadcn/Radix architecture),
 * so the visual never depends on a hidden native input. The check is a rendered SVG
 * shown only when checked; styling keys off :checked-equivalent `data-state`.
 */
const Checkbox = ({ checked = false, onCheckedChange, disabled = false, className, ...rest }: CheckboxProps) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    data-state={checked ? 'checked' : 'unchecked'}
    disabled={disabled}
    onClick={() => onCheckedChange?.(!checked)}
    className={['ds-checkbox', className].filter(Boolean).join(' ')}
    {...rest}
  >
    {checked && <CheckIcon />}
  </button>
)

export { Checkbox }

import './Button.css'
import type { ButtonProps } from './Button.type'

// Token-driven button — variant and size are expressed via CSS classes, not duplicated components.
const Button = ({
  variant = 'primary',
  size = 'md',
  busy = false,
  disabled,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    className={['ds-btn', `ds-btn--${variant}`, `ds-btn--${size}`, busy && 'ds-btn--busy', className]
      .filter(Boolean)
      .join(' ')}
    disabled={disabled || busy}
    aria-busy={busy || undefined}
    {...rest}
  >
    {children}
  </button>
)

export { Button }

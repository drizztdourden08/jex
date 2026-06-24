import './IconButton.css'
import type { IconButtonProps } from './IconButton.type'

// Square, icon-only button — `label` is required and becomes the aria-label.
const IconButton = ({
  label,
  size = 'md',
  plain = false,
  type = 'button',
  className,
  children,
  ...rest
}: IconButtonProps) => (
  <button
    type={type}
    aria-label={label}
    className={['ds-iconbtn', `ds-iconbtn--${size}`, plain && 'ds-iconbtn--plain', className]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  >
    {children}
  </button>
)

export { IconButton }

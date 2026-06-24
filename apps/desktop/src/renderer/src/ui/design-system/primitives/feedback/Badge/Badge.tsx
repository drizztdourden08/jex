import './Badge.css'
import type { BadgeProps } from './Badge.type'

// Small non-interactive status pill — tone selects the color treatment.
const Badge = ({ tone = 'neutral', className, children, ...rest }: BadgeProps) => (
  <span className={['ds-badge', `ds-badge--${tone}`, className].filter(Boolean).join(' ')} {...rest}>
    {children}
  </span>
)

export { Badge }

import type { IconProps } from './Icon.type'

// Sizing wrapper for icon glyphs. `label` makes it a labelled image; without it the
// icon is decorative (aria-hidden, no role) so screen readers skip it.
const Icon = ({ size = 16, label, style, children, ...rest }: IconProps) => (
  <span
    {...rest}
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      ...style,
    }}
  >
    {children}
  </span>
)

export { Icon }

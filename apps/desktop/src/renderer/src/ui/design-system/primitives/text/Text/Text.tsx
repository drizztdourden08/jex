import type { TextProps } from './Text.type'

const TONE = {
  default: 'var(--text-1)',
  muted: 'var(--text-2)',
  faint: 'var(--text-3)',
} as const

const WEIGHT = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

// Polymorphic text element — tone maps to a text color token, weight to a numeric weight.
const Text = ({ as, tone = 'default', weight, style, children, ...rest }: TextProps) => {
  const Tag = as ?? 'span'
  return (
    <Tag
      style={{ color: TONE[tone], fontWeight: weight ? WEIGHT[weight] : undefined, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

export { Text }

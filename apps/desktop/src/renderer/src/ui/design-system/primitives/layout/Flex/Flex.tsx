import { Box } from '../Box'
import { sp } from '../../scales'
import type { FlexProps } from './Flex.type'

// Flexbox container — composes Box with the common flex props as a token-driven style.
const Flex = ({ direction, align, justify, gap, wrap, style, ...rest }: FlexProps) => (
  <Box
    style={{
      display: 'flex',
      flexDirection: direction,
      alignItems: align,
      justifyContent: justify,
      gap: sp(gap),
      flexWrap: wrap ? 'wrap' : undefined,
      ...style,
    }}
    {...rest}
  />
)

export { Flex }

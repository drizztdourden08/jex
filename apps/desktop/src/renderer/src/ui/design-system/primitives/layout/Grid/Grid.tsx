import { Box } from '../Box'
import { sp } from '../../scales'
import type { GridProps } from './Grid.type'

// CSS-grid container — numeric `columns` becomes N equal minmax columns.
const Grid = ({ columns, gap, style, ...rest }: GridProps) => (
  <Box
    style={{
      display: 'grid',
      gridTemplateColumns:
        typeof columns === 'number' ? `repeat(${columns}, minmax(0, 1fr))` : columns,
      gap: sp(gap),
      ...style,
    }}
    {...rest}
  />
)

export { Grid }

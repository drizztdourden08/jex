import type { BoxProps } from '../Box/Box.type'
import type { Space } from '../../scales'

interface GridProps extends BoxProps {
  columns?: number | string
  gap?: Space
}

export type { GridProps }

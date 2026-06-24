import type { CSSProperties } from 'react'
import type { BoxProps } from '../Box/Box.type'
import type { Space } from '../../scales'

interface FlexProps extends BoxProps {
  direction?: 'row' | 'column'
  align?: CSSProperties['alignItems']
  justify?: CSSProperties['justifyContent']
  gap?: Space
  wrap?: boolean
}

export type { FlexProps }

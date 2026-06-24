import type { ElementType, HTMLAttributes } from 'react'

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  tone?: 'default' | 'muted' | 'faint'
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'
}

export type { TextProps }

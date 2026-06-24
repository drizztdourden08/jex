import type { HTMLAttributes, ReactNode } from 'react'

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Pixel size of the square wrapper. */
  size?: number
  /** Accessible name; when present the icon is a labelled image, else it's decorative. */
  label?: string
  children?: ReactNode
}

export type { IconProps }

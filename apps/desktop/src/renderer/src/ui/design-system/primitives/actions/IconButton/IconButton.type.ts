import type { ButtonHTMLAttributes } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  /** `fit` applies no fixed dimensions — the consumer's className sizes it (image/thumbnail buttons). */
  size?: 'sm' | 'md' | 'lg' | 'fit'
  /** Bare clickable: no border, background, radius, or hover fill — the className owns the look. */
  plain?: boolean
}

export type { IconButtonProps }

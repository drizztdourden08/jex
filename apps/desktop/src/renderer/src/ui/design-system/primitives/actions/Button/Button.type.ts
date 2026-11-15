import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** Working: disabled, aria-busy, small spinner before the label. */
  busy?: boolean
  size?: 'slim' | 'sm' | 'md'
}

export type { ButtonProps }

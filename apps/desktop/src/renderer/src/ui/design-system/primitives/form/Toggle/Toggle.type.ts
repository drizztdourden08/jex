interface ToggleProps {
  on: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
  className?: string
  title?: string
  /** Accessible name (becomes aria-label). */
  label?: string
}

export type { ToggleProps }

import type { ReactNode } from 'react'

interface TagProps {
  label: string
  /** Optional leading glyph; always rendered in the secondary (purple) accent. */
  icon?: ReactNode
  /** Clickable picker chip — fires when the chip is clicked to add it. */
  onSelect?: () => void
  /** Selected chip — renders a trailing × that fires this. */
  onRemove?: () => void
  selected?: boolean
  className?: string
}

export type { TagProps }

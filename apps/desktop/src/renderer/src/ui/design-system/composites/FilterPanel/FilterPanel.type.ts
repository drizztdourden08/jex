import type { ReactNode } from 'react'

interface FilterPanelProps {
  topbar?: ReactNode
  dirty?: boolean
  reset?: () => void
  /** Hide the body (animated) and show `summary` instead. Only honored with `onToggleCollapsed`. */
  collapsed?: boolean
  /** Presence adds the collapse chevron at the end of the topbar. */
  onToggleCollapsed?: () => void
  /** Shown in place of the body while collapsed; clicking it expands. */
  summary?: ReactNode
  children: ReactNode
}

export type { FilterPanelProps }

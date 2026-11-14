import type { ReactNode } from 'react'

type VirtualRowState = {
  index: number
  selected: boolean
}

type VirtualListProps<T> = {
  items: T[]
  /** Every row has this exact height in px; the window math depends on it. */
  rowHeight: number
  getKey: (item: T) => string | number
  renderRow: (item: T, state: VirtualRowState) => ReactNode
  /** -1 when nothing is selected. */
  selectedIndex: number
  onSelect: (index: number) => void
  /** Accessible name of the listbox. */
  label: string
  /** Extra rows rendered above and below the viewport. */
  overscan?: number
  className?: string
}

export type { VirtualListProps, VirtualRowState }

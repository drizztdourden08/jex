import type { ReactNode } from 'react'

interface FilterPanelProps {
  topbar?: ReactNode
  dirty?: boolean
  reset?: () => void
  children: ReactNode
}

export type { FilterPanelProps }

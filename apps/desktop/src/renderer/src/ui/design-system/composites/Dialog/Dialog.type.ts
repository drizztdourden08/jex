import type { ReactNode } from 'react'

type DialogProps = {
  open: boolean
  title: string
  /** Body content under the title. */
  children?: ReactNode
  /** Footer action buttons (right-aligned). The element marked data-autofocus gets initial focus. */
  actions?: ReactNode
  /** Escape or a backdrop click asks to close. */
  onClose: () => void
}

export type { DialogProps }

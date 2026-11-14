import type { ReactNode } from 'react'

type SettingRowProps = {
  label: ReactNode
  description?: ReactNode
  /** The control(s), placed on the right. */
  children?: ReactNode
  /** 'inline' (default): control on the right. 'stacked': control under the text, full width. */
  layout?: 'inline' | 'stacked'
  /** 'wide' gives the control room for a text field (e.g. a key input + Save). */
  control?: 'auto' | 'wide'
}

export type { SettingRowProps }

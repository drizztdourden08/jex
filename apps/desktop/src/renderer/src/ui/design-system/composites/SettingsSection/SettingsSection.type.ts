import type { ReactNode } from 'react'

type SettingsSectionProps = {
  title: string
  /** One line under the title saying what the area covers. */
  description?: ReactNode
  /** Usually SettingsGroup children. */
  children: ReactNode
  id?: string
}

export type { SettingsSectionProps }

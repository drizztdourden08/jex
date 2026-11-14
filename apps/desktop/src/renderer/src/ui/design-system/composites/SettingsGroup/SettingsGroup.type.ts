import type { ReactNode } from 'react'

type SettingsGroupProps = {
  label: string
  /** Short note under the label (privacy, prerequisites). */
  description?: ReactNode
  /** Small controls on the label line (e.g. a "Clean up" button). */
  actions?: ReactNode
  /** SettingRow children; other content gets the same inset padding. */
  children: ReactNode
}

export type { SettingsGroupProps }

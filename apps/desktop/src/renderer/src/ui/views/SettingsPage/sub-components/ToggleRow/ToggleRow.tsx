import { SettingRow } from '@ds/composites/SettingRow'
import { Toggle } from '@ds/primitives/form/Toggle'

type ToggleRowProps = {
  on: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}

// A boolean preference as a settings row: label + hint left, switch right.
const ToggleRow = ({ on, onChange, label, hint }: ToggleRowProps) => (
  <SettingRow label={label} description={hint}>
    <Toggle on={on} onChange={onChange} label={label} />
  </SettingRow>
)

export { ToggleRow }
export type { ToggleRowProps }

import { Box } from '@ds/primitives/layout/Box'
import { Toggle as ToggleSwitch } from '@ds/primitives/form/Toggle'

type ToggleProps = {
  on: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}

const Toggle = ({ on, onChange, label, hint }: ToggleProps) => {
  return (
    <Box as="label" className="toggle-row">
      <Box as="span">
        <Box as="span" className="toggle-label">{label}</Box>
        {hint && <Box as="span" className="muted toggle-hint">{hint}</Box>}
      </Box>
      <ToggleSwitch on={on} onChange={onChange} label={label} />
    </Box>
  )
}

export { Toggle }
export type { ToggleProps }

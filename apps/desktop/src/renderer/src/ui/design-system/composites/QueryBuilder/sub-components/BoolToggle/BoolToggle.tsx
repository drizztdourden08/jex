import { SegmentedControl } from '@ds/primitives/form/SegmentedControl'

/** True (green) / False (red) toggle for boolean fields — sets the op. */
const BoolToggle = ({ yes, onChange }: { yes: boolean; onChange: (yes: boolean) => void }) => {
  return (
    <SegmentedControl
      size="sm"
      options={[
        { value: 'true', label: 'True' },
        { value: 'false', label: 'False' },
      ]}
      value={yes ? 'true' : 'false'}
      onChange={(v) => onChange(v === 'true')}
      tone={(v) => (v === 'true' ? 'green' : 'red')}
    />
  )
}

export { BoolToggle }

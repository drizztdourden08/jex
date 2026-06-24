import { useRef, useState, type ReactNode } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { TextInput } from '@ds/primitives/form/TextInput'
import { Popover } from '@ds/primitives/overlay/Popover'
import { Tag } from '@ds/primitives/feedback/Tag'
import './FacetField.css'

type FacetOption = { value: string; label: string; icon?: ReactNode }

/** A facet field: the chosen values as removable Tags + a plain "+ Add" button that opens
 *  a popover (searchable list of the remaining values as the same Tag chips). */
const FacetField = ({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: FacetOption[]
  selected: string[]
  onChange: (next: string[]) => void
}) => {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const chosen = options.filter((o) => selected.includes(o.value))
  const needle = q.trim().toLowerCase()
  const shown = options.filter(
    (o) => !selected.includes(o.value) && (!needle || o.label.toLowerCase().includes(needle)),
  )
  const add = (v: string) => onChange([...selected, v])
  const remove = (v: string) => onChange(selected.filter((x) => x !== v))
  const close = () => {
    setOpen(false)
    setQ('')
  }

  return (
    <Box className="facet-field">
      <Box className="facet-field-head">
        <Box as="span" className="facet-field-label">{label}</Box>
        {selected.length > 0 && <Box as="span" className="facet-field-count">{selected.length}</Box>}
      </Box>
      <Box className="facet-field-body">
        {chosen.map((o) => (
          <Tag key={o.value} label={o.label} icon={o.icon} onRemove={() => remove(o.value)} />
        ))}
        <Box ref={triggerRef} className="facet-add">
          <Button variant="ghost" className="qb-add-val" onClick={() => setOpen((o) => !o)}>+ Add</Button>
        </Box>
        <Popover open={open} anchorRef={triggerRef} onClose={close} placement="bottom" align="start" className="facet-box" role="dialog">
          <Box className="facet-box-head">
            <TextInput
              className="facet-box-input"
              autoFocus
              placeholder={`Search ${label.toLowerCase()}…`}
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
            />
            <Box as="span" className="facet-box-count">{shown.length}</Box>
          </Box>
          <Box className="facet-box-chips">
            {shown.map((o) => (
              <Tag key={o.value} label={o.label} icon={o.icon} onSelect={() => add(o.value)} />
            ))}
            {shown.length === 0 && <Box as="span" className="muted" style={{ fontSize: 12 }}>No more values</Box>}
          </Box>
        </Popover>
      </Box>
    </Box>
  )
}

export { FacetField }
export type { FacetOption }

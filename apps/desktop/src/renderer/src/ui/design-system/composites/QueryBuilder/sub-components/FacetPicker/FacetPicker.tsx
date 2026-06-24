import { useMemo, useRef, useState } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { TextInput } from '@ds/primitives/form/TextInput'
import { Popover } from '@ds/primitives/overlay/Popover'
import { Tag } from '@ds/primitives/feedback/Tag'
import type { FieldDef } from '@shared/query'

/** A plain "+ Add" button that opens a popover of the remaining values (as Tag chips). */
const FacetPicker = ({
  def,
  optionsFor,
  multi,
  selected,
  onPick,
}: {
  def: FieldDef
  optionsFor: (def: FieldDef) => { value: string; label: string }[]
  multi: boolean
  selected: string[]
  onPick: (next: string[]) => void
}) => {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const options = useMemo(() => optionsFor(def), [optionsFor, def])
  const needle = q.trim().toLowerCase()
  const shown = options.filter(
    (o) => !selected.includes(o.value) && (!needle || o.label.toLowerCase().includes(needle)),
  )
  const close = () => {
    setOpen(false)
    setQ('')
  }
  const add = (v: string) => {
    onPick(multi ? [...selected, v] : [v])
    if (!multi) close()
  }

  return (
    <>
      <Box ref={triggerRef} className="facet-add">
        <Button variant="ghost" className="qb-add-val" onClick={() => setOpen((o) => !o)}>
          + {multi ? 'Add' : 'Choose'}
        </Button>
      </Box>
      <Popover open={open} anchorRef={triggerRef} onClose={close} placement="bottom" align="start" className="facet-box" role="dialog">
        <Box className="facet-box-head">
          <TextInput
            className="facet-box-input"
            autoFocus
            placeholder={`Search ${def.label.toLowerCase()}…`}
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
          />
          <Box as="span" className="facet-box-count">{shown.length}</Box>
        </Box>
        <Box className="facet-box-chips">
          {shown.map((o) => (
            <Tag key={o.value} label={o.label} onSelect={() => add(o.value)} />
          ))}
          {shown.length === 0 && <Box as="span" className="muted" style={{ fontSize: 12 }}>No more values</Box>}
        </Box>
      </Popover>
    </>
  )
}

export { FacetPicker }

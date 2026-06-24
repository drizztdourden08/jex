import { useState } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { TextInput } from '@ds/primitives/form/TextInput'
import { SEARCH_THRESHOLD } from '../../FilterPanel.constants'
import { Chip } from '../Chip'
import { ValChip } from '../ValChip'
import { Collapsible } from '../Collapsible'

const FacetSection = ({
  label,
  values,
  isOn,
  onToggle,
}: {
  label: string
  values: string[]
  isOn: (v: string) => boolean
  onToggle: (v: string) => void
}) => {
  const [q, setQ] = useState('')
  if (values.length === 0) return null
  const selected = values.filter(isOn)
  const needle = q.trim().toLowerCase()
  // Chosen values move to the removable row above, so the list only shows the rest.
  const shown = values.filter((v) => !isOn(v) && (!needle || v.toLowerCase().includes(needle)))
  const chips = shown.map((v) => (
    <Chip key={v} on={false} onClick={() => onToggle(v)}>
      {v}
    </Chip>
  ))
  return (
    <Collapsible label={label} count={values.length}>
      {selected.length > 0 && (
        <Box className="facet-selected">
          {selected.map((v) => (
            <ValChip key={v} label={v} onRemove={() => onToggle(v)} />
          ))}
        </Box>
      )}
      {values.length > SEARCH_THRESHOLD ? (
        <Box className="facet-box">
          <Box className="facet-box-head">
            <TextInput
              className="facet-box-input"
              placeholder={`Search ${label.toLowerCase()}…`}
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
            />
            <Box as="span" className="facet-box-count">{shown.length}</Box>
          </Box>
          <Box className="facet-box-chips">{chips}</Box>
        </Box>
      ) : (
        <Box className="facet-plain">{chips}</Box>
      )}
    </Collapsible>
  )
}

export { FacetSection }

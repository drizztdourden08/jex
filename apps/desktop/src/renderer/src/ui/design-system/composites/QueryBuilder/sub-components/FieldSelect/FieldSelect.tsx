import { useMemo } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { Select, type SelectGroup, type SelectOption } from '@ds/primitives/form/Select'
import { FIELD_CATEGORIES, FIELD_DEFS, FIELD_MAP } from '@shared/query'
import { TypeGlyph } from '../TypeGlyph'

/** Custom field picker — grouped by category, searchable, with a type glyph per
 *  field. Built on the Select primitive (portalled menu); the selected item's
 *  glyph reads purple via the primitive's `.ds-select-item.is-selected` styling. */
const FieldSelect = ({ value, onChange }: { value: string; onChange: (key: string) => void }) => {
  const cur = FIELD_MAP.get(value) ?? FIELD_DEFS[0]
  const groups = useMemo<SelectGroup[]>(
    () =>
      FIELD_CATEGORIES.map((cat) => ({
        label: cat,
        options: FIELD_DEFS.filter((d) => d.category === cat).map<SelectOption>((d) => ({
          value: d.key,
          label: d.label,
          icon: <TypeGlyph type={d.type} />,
        })),
      })).filter((g) => g.options.length),
    [],
  )
  return (
    <Select
      value={value}
      onChange={onChange}
      groups={groups}
      searchable
      variant="field"
      className="qb-field"
      renderTrigger={() => (
        <>
          <TypeGlyph type={cur.type} />
          <Box as="span" className="fieldsel-cur">{cur.label}</Box>
        </>
      )}
      renderOption={(option) => (
        <>
          {option.icon != null && <Box as="span" className="ds-select-item-icon">{option.icon}</Box>}
          <Box as="span">{option.label}</Box>
        </>
      )}
    />
  )
}

export { FieldSelect }

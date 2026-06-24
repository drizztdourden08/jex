import { useMemo } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { Slider } from '@ds/primitives/form/Slider'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { Select, SelectMenu, type SelectOption } from '@ds/primitives/form/Select'
import { TextInput } from '@ds/primitives/form/TextInput'
import {
  FIELD_DEFS,
  FIELD_MAP,
  OPS_BY_TYPE,
  OP_LABELS,
  VALUELESS_OPS,
  removeNode,
  updateNode,
  type QueryCondition,
  type QueryGroup,
} from '@shared/query'
import type { Ctx } from '../../QueryBuilder.type'
import { numSummary } from '../../QueryBuilder.helpers'
import { FieldSelect } from '../FieldSelect'
import { BoolToggle } from '../BoolToggle'
import { FacetPicker } from '../FacetPicker'

const ConditionEditor = ({ node, ctx }: { node: QueryCondition; ctx: Ctx }) => {
  const def = FIELD_MAP.get(node.field) ?? FIELD_DEFS[0]
  const ops = OPS_BY_TYPE[def.type]
  const arrayType = def.type === 'stringArray' || def.type === 'enumArray'
  const pickType = arrayType || def.type === 'enum'
  const range = useMemo(() => (def.type === 'number' ? ctx.numRange(def) : null), [ctx.numRange, def])
  const opOptions = useMemo<SelectOption[]>(() => ops.map((o) => ({ value: o, label: OP_LABELS[o] })), [ops])

  const patch = (p: Partial<QueryCondition>) => ctx.onChange(updateNode(ctx.root, node.id, p) as QueryGroup)
  const onField = (key: string) => {
    const d = FIELD_MAP.get(key)!
    patch({ field: key, op: OPS_BY_TYPE[d.type][0], value: undefined })
  }

  const selected = Array.isArray(node.value) ? node.value : node.value != null ? [String(node.value)] : []
  const labelFor = (v: string) => def.options?.find((o) => o.value === v)?.label ?? v
  const removeVal = (v: string) =>
    patch({ value: arrayType ? (selected.filter((x) => x !== v).length ? selected.filter((x) => x !== v) : undefined) : undefined })

  return (
    <Box
      className="qb-row"
      draggable
      onDragStart={(e) => ctx.dnd.start(e, node.id)}
      onDragOver={ctx.dnd.over}
      onDrop={(e) => ctx.dnd.dropBefore(e, node.id)}
    >
      <Box as="span" className="qb-handle" title="Drag to reorder">
        ⠿
      </Box>
      <FieldSelect value={node.field} onChange={onField} />

      {def.type === 'boolean' ? (
        <BoolToggle yes={node.op === 'isTrue'} onChange={(yes) => patch({ op: yes ? 'isTrue' : 'isFalse' })} />
      ) : (
        <Select
          className="qb-op"
          variant="field"
          value={node.op}
          options={opOptions}
          onChange={(v) => patch({ op: v as QueryCondition['op'] })}
        />
      )}

      {def.type !== 'boolean' &&
        !VALUELESS_OPS.has(node.op) &&
        (def.type === 'string' ? (
          <TextInput
            className="qb-text"
            type="text"
            value={(node.value as string) ?? ''}
            placeholder="text…"
            onChange={(e) => patch({ value: e.currentTarget.value || undefined })}
          />
        ) : def.type === 'number' ? (
          <Box className="qb-value-wrap">
            <SelectMenu variant="field" triggerClass="qb-value" trigger={numSummary(def, node)}>
              {() => (
                <Slider
                  value={typeof node.value === 'number' ? node.value : undefined}
                  min={range?.min}
                  max={range?.max}
                  unit={def.unit}
                  time={def.unit === 'min'}
                  onChange={(n) => patch({ value: n })}
                />
              )}
            </SelectMenu>
          </Box>
        ) : (
          // enum / array: a bordered "assembler" box — chosen values wrap inside as
          // removable chips, with a distinct + Add picker (portalled dropdown).
          <Box className="qb-assembler">
            {selected.map((v) => (
              <Box as="span" key={v} className="val-chip">
                {labelFor(v)}
                <IconButton label={`Remove ${labelFor(v)}`} onClick={() => removeVal(v)}>
                  ✕
                </IconButton>
              </Box>
            ))}
            {(arrayType || selected.length === 0) && (
              <FacetPicker
                optionsFor={ctx.optionsFor}
                def={def}
                multi={arrayType}
                selected={selected}
                onPick={(next) => patch({ value: pickType && !arrayType ? next[0] : next.length ? next : undefined })}
              />
            )}
          </Box>
        ))}

      <IconButton label="Remove" className="qb-remove" title="Remove" onClick={() => ctx.onChange(removeNode(ctx.root, node.id))}>
        ✕
      </IconButton>
    </Box>
  )
}

export { ConditionEditor }

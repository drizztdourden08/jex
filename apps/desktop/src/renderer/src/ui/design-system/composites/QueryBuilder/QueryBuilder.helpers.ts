import type { FieldDef, QueryCondition } from '@shared/query'

const numSummary = (def: FieldDef, c: QueryCondition): string => {
  if (typeof c.value !== 'number') return 'Choose…'
  return `${c.value}${def.unit && def.unit !== 'unix' ? ` ${def.unit}` : ''}`
}

export { numSummary }

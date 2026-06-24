import type { FieldDef, QueryGroup } from '@shared/query'

interface Dnd {
  dragId: string | null
  start: (e: React.DragEvent, id: string) => void
  over: (e: React.DragEvent) => void
  dropBefore: (e: React.DragEvent, targetId: string) => void
  dropInto: (e: React.DragEvent, groupId: string) => void
}

interface Ctx {
  root: QueryGroup
  onChange: (root: QueryGroup) => void
  /** Facet option list for a field (compound binds this over its data). */
  optionsFor: (def: FieldDef) => { value: string; label: string }[]
  /** Numeric slider bounds for a field, or null for no slider. */
  numRange: (def: FieldDef) => { min: number; max: number } | null
  dnd: Dnd
}

export type { Dnd, Ctx }

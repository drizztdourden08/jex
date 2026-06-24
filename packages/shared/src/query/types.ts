/**
 * Advanced filter query model types. A query is a tree of AND/OR groups whose
 * leaves are field conditions.
 */
import type { Game } from '../library'

type Combinator = 'and' | 'or'

type QueryOp =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'notContains'
  | 'any' // array has any of the selected values
  | 'all' // array has all of the selected values
  | 'none' // array has none of the selected values
  | 'isTrue'
  | 'isFalse'
  | 'exists'
  | 'notExists'

interface QueryCondition {
  kind: 'condition'
  id: string
  field: string
  op: QueryOp
  value?: string | number | string[]
}

interface QueryGroup {
  kind: 'group'
  id: string
  combinator: Combinator
  rules: QueryNode[]
}

type QueryNode = QueryGroup | QueryCondition

type FieldType = 'string' | 'number' | 'boolean' | 'stringArray' | 'enumArray' | 'enum'

interface FieldDef {
  key: string
  label: string
  type: FieldType
  /** Grouping bucket for the field picker. */
  category: string
  get: (g: Game) => unknown
  /** Distinct values come from this library facet (genres/categories/tags/…). */
  facet?: 'genres' | 'categories' | 'tags' | 'developers' | 'publishers' | 'languages'
  /** Fixed value set for enum / enumArray fields. */
  options?: { value: string; label: string }[]
  unit?: string
}

export type {
  Combinator,
  QueryOp,
  QueryCondition,
  QueryGroup,
  QueryNode,
  FieldType,
  FieldDef,
}

import type { FilterSpec } from '@jex/shared/filter'
import type { QueryResult } from '@jex/shared/ai'

/** Wrap a parsed spec and the raw model text as a QueryResult. */
const toQueryResult = (spec: FilterSpec, raw: string): QueryResult => ({
  spec,
  raw,
  empty: Object.keys(spec).length === 0,
})

export { toQueryResult }

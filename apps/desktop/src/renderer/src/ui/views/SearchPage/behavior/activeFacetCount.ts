import type { FilterSpec } from '@shared/filter'

const activeFacetCount = (spec: FilterSpec): number => {
  let n = 0
  for (const k of ['genres', 'categories', 'tags', 'features', 'platforms'] as const) {
    if (spec[k]?.length) n++
  }
  if (spec.maxPrice != null) n++
  if (spec.onSaleOnly) n++
  if (spec.hideFreeToPlay) n++
  return n
}

export { activeFacetCount }

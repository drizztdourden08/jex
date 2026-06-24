/**
 * FilterSpec → query (one-way, on entering advanced mode). Switching to advanced
 * preserves the current filter by converting the FilterSpec into a query tree.
 */
import type { FilterSpec } from '../filter'
import type { QueryCondition, QueryGroup, QueryOp } from './types'
import { uid } from './mutate'

const specToQuery = (spec: FilterSpec): QueryGroup => {
  const rules: QueryCondition[] = []
  const cond = (field: string, op: QueryOp, value?: QueryCondition['value']): QueryCondition => ({
    kind: 'condition',
    id: uid('c'),
    field,
    op,
    value,
  })

  if (spec.text) rules.push(cond('name', 'contains', spec.text))
  if (spec.genres?.length) rules.push(cond('genres', 'any', spec.genres))
  if (spec.categories?.length) rules.push(cond('categories', 'any', spec.categories))
  if (spec.tags?.length) rules.push(cond('tags', 'any', spec.tags))
  if (spec.developers?.length) rules.push(cond('developers', 'any', spec.developers))
  if (spec.publishers?.length) rules.push(cond('publishers', 'any', spec.publishers))
  if (spec.features?.length) rules.push(cond('features', 'all', spec.features))
  if (spec.platforms?.length) rules.push(cond('platforms', 'all', spec.platforms))
  if (spec.playtimeForeverMin != null) rules.push(cond('playtimeForever', 'gte', spec.playtimeForeverMin))
  if (spec.playtimeForeverMax != null) rules.push(cond('playtimeForever', 'lte', spec.playtimeForeverMax))
  if (spec.releaseYear?.min != null) rules.push(cond('releaseYear', 'gte', spec.releaseYear.min))
  if (spec.releaseYear?.max != null) rules.push(cond('releaseYear', 'lte', spec.releaseYear.max))
  if (spec.metacriticMin != null) rules.push(cond('metacritic', 'gte', spec.metacriticMin))
  if (spec.reviewPercentMin != null) rules.push(cond('reviewPercent', 'gte', spec.reviewPercentMin))
  if (spec.installedOnly) rules.push(cond('installed', 'isTrue'))
  if (spec.unplayedOnly) rules.push(cond('playtimeForever', 'eq', 0))
  if (spec.playedOnly) rules.push(cond('playtimeForever', 'gt', 0))
  if (spec.freeOnly) rules.push(cond('isFree', 'isTrue'))
  if (spec.hasControllerSupport) rules.push(cond('controllerSupport', 'exists'))

  return { kind: 'group', id: uid('g'), combinator: 'and', rules }
}

export { specToQuery }

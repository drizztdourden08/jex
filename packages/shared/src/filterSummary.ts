import type { FilterSpec } from './filter'
import type { QueryGroup, QueryNode } from './query'

const MAX_VALUES = 3

const list = (label: string, values?: string[]): string[] => {
  if (!values?.length) return []
  const shown = values.slice(0, MAX_VALUES).join(', ')
  const extra = values.length > MAX_VALUES ? ` +${values.length - MAX_VALUES}` : ''
  return [`${label}: ${shown}${extra}`]
}

const range = (label: string, min?: number, max?: number, unit = ''): string[] => {
  if (min != null && max != null) return [`${label}: ${min}–${max}${unit}`]
  if (min != null) return [`${label}: ${min}${unit}+`]
  if (max != null) return [`${label}: up to ${max}${unit}`]
  return []
}

const flag = (on: boolean | undefined, label: string): string[] => (on ? [label] : [])

/** Short human labels for the active facets of a FilterSpec (sort/limit excluded). */
const describeFilters = (spec: FilterSpec): string[] => [
  ...(spec.text?.trim() ? [`Text: "${spec.text.trim()}"`] : []),
  ...flag(spec.installedOnly, 'Installed'),
  ...flag(spec.unplayedOnly, 'Unplayed'),
  ...flag(spec.playedOnly, 'Played'),
  ...flag(spec.freeOnly, 'Free'),
  ...flag(spec.hasControllerSupport, 'Controller support'),
  ...flag(spec.onSaleOnly, 'On sale'),
  ...flag(spec.hideFreeToPlay, 'Hide free-to-play'),
  ...list('Genre', spec.genres),
  ...list('Category', spec.categories),
  ...list('Tag', spec.tags),
  ...list('Developer', spec.developers),
  ...list('Publisher', spec.publishers),
  ...list('Platform', spec.platforms),
  ...list('Feature', spec.features),
  ...range('Playtime', spec.playtimeForeverMin, spec.playtimeForeverMax, ' min'),
  ...range('Year', spec.releaseYear?.min, spec.releaseYear?.max),
  ...(spec.metacriticMin != null ? [`Metacritic ${spec.metacriticMin}+`] : []),
  ...(spec.reviewPercentMin != null ? [`Reviews ${spec.reviewPercentMin}%+`] : []),
  ...(spec.maxPrice != null ? [spec.maxPrice === 0 ? 'Free only' : `Max price ${spec.maxPrice}`] : []),
]

const countConditions = (node: QueryNode): number =>
  node.kind === 'condition' ? 1 : node.rules.reduce((n, r) => n + countConditions(r), 0)

/** Advanced-mode summary: a single "N condition(s)" label, or none when the tree is empty. */
const describeQuery = (query: QueryGroup): string[] => {
  const n = countConditions(query)
  return n ? [`${n} condition${n === 1 ? '' : 's'}`] : []
}

export { describeFilters, describeQuery }

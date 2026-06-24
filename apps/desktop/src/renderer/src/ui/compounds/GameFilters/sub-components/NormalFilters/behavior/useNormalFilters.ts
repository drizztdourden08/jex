import { useMemo } from 'react'
import type { Game } from '@shared/library'
import type { FilterSpec } from '@shared/filter'
import { facetValues } from '@shared/filterApply'
import { FEATURE_DEFS } from '@ui/compounds/FeatureIcon'
import type { Facet, ExplicitFacets, FilterToggle } from '../../../GameFilters.type'

const useNormalFilters = ({
  games,
  value,
  onChange,
  omit = [],
  facets,
  hideScores,
}: {
  games: Game[]
  value: FilterSpec
  onChange: (s: FilterSpec) => void
  omit?: FilterToggle[]
  facets?: ExplicitFacets
  hideScores?: boolean
}) => {
  const hide = new Set(omit)
  const visibleFlags = (['installed', 'unplayed', 'free'] as FilterToggle[]).filter((f) => !hide.has(f))
  const showMetricsRow = visibleFlags.length > 0 || !hideScores
  // Explicit facets (catalog Search) win; otherwise derive from the library set.
  const genres = useMemo(() => facets?.genres ?? facetValues(games, 'genres'), [facets, games])
  const categories = useMemo(
    () => facets?.categories ?? facetValues(games, 'categories'),
    [facets, games],
  )
  const tags = useMemo(() => facets?.tags ?? facetValues(games, 'tags'), [facets, games])
  const features = useMemo(
    () =>
      facets
        ? FEATURE_DEFS.filter((d) => facets.features.includes(d.key))
        : FEATURE_DEFS.filter((d) => games.some((g) => g.features?.[d.key])),
    [facets, games],
  )
  const set = (patch: Partial<FilterSpec>) => onChange({ ...value, ...patch })

  const toggleFacet = (key: Facet, v: string) => {
    const cur = value[key] ?? []
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
    set({ [key]: next.length ? next : undefined })
  }
  const facetOn = (key: Facet, v: string) => (value[key] ?? []).includes(v)

  const toggleFeature = (k: string) => {
    const cur = value.features ?? []
    const next = cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]
    set({ features: next.length ? next : undefined })
  }
  const activeFeatures = FEATURE_DEFS.filter((d) => (value.features ?? []).includes(d.key))

  return {
    hide,
    visibleFlags,
    showMetricsRow,
    genres,
    categories,
    tags,
    features,
    set,
    toggleFacet,
    facetOn,
    toggleFeature,
    activeFeatures,
  }
}

export { useNormalFilters }

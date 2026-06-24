import type { ReactNode } from 'react'
import type { Game } from '@shared/library'
import type { FilterSpec } from '@shared/filter'
import type { QueryGroup } from '@shared/query'
import type { FilterMode } from '@/hooks/useFilterState'

interface Props {
  games: Game[]
  mode: FilterMode
  setMode: (m: FilterMode) => void
  spec: FilterSpec
  setSpec: (s: FilterSpec) => void
  query: QueryGroup
  setQuery: (q: QueryGroup) => void
  dirty: boolean
  reset: () => void
  /** Rendered at the right of the top bar (e.g. count + sort + clear). */
  headerRight?: ReactNode
  /** Engagement toggles to hide (e.g. Wishlist hides install/playtime concepts). */
  omit?: FilterToggle[]
  /** Explicit facet vocabulary, overriding the values derived from `games`.
   *  Used by catalog Search to offer the whole-Steam vocabulary (synced tags +
   *  genres + categories) and only the catalog-filterable feature keys. */
  facets?: ExplicitFacets
  /** Which filter modes to offer (default: all). Search omits 'advanced' since a
   *  query tree can't be expressed as Steam catalog-search params. */
  modes?: FilterMode[]
  /** Hide the Metacritic / review-% selects (catalog Search can't filter on them). */
  hideScores?: boolean
}

interface ExplicitFacets {
  genres: string[]
  categories: string[]
  tags: string[]
  /** GameFeatures keys to expose (the rest aren't catalog-filterable). */
  features: string[]
}

/** Engagement toggles that can be hidden per-surface. */
type FilterToggle = 'installed' | 'unplayed' | 'free'

type Facet = 'genres' | 'categories' | 'tags'

export type { Props, ExplicitFacets, FilterToggle, Facet }

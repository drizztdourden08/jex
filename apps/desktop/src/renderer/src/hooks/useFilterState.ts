import { useCallback, useMemo, useState } from 'react'
import type { Game } from '@shared/library'
import type { FilterSpec } from '@shared/filter'
import { applyFilter, matches } from '@shared/filterApply'
import { emptyGroup, evaluateNode, specToQuery, type QueryGroup, type QueryNode } from '@shared/query'

type FilterMode = 'basic' | 'normal' | 'advanced'

const countConditions = (n: QueryNode): number => {
  return n.kind === 'group' ? n.rules.reduce((s, r) => s + countConditions(r), 0) : 1
}

const countSpec = (spec: FilterSpec): number => {
  const ignore = new Set(['sortBy', 'sortDir', 'limit'])
  return Object.entries(spec).filter(([k, v]) => {
    if (ignore.has(k) || v == null || v === '') return false
    if (Array.isArray(v)) return v.length > 0
    if (typeof v === 'object') return Object.keys(v).length > 0
    return v !== false && v !== 0
  }).length
}

/**
 * Shared filter state for Library + Randomizer: a 3-way mode (basic text / normal
 * facets / advanced query tree). Sort lives in `spec`. Leaving advanced keeps the
 * query (the page shows the reset overlay via `dirty`) until `reset` is called.
 */
const useFilterState = () => {
  const [mode, setModeRaw] = useState<FilterMode>('basic')
  const [spec, setSpec] = useState<FilterSpec>({ sortBy: 'name', sortDir: 'asc' })
  const [query, setQuery] = useState<QueryGroup>(() => emptyGroup())
  const [dirty, setDirty] = useState(false) // advanced query exists but mode has left advanced

  const setMode = useCallback(
    (next: FilterMode) => {
      if (next === mode) return
      if (mode === 'advanced' && next !== 'advanced') {
        setDirty(true) // arm the reset overlay; query stays active until reset
        setModeRaw(next)
        return
      }
      if (next === 'advanced') {
        if (!dirty) setQuery(specToQuery(spec)) // fresh entry: carry current filter in
        setDirty(false) // (resume the existing query when returning from dirty)
        setModeRaw('advanced')
        return
      }
      setModeRaw(next) // basic <-> normal
    },
    [mode, dirty, spec],
  )

  const reset = useCallback(() => {
    setSpec((s) => ({ sortBy: s.sortBy, sortDir: s.sortDir })) // keep sort, drop filters
    setQuery(emptyGroup())
    setDirty(false)
  }, [])

  const advancedActive = mode === 'advanced' || dirty

  const predicate = useMemo(() => {
    if (advancedActive) return (g: Game) => evaluateNode(g, query)
    if (mode === 'basic') {
      const t = spec.text?.trim().toLowerCase()
      if (!t) return () => true
      return (g: Game) => `${g.name} ${g.shortDescription ?? ''}`.toLowerCase().includes(t)
    }
    return (g: Game) => matches(g, spec)
  }, [advancedActive, query, mode, spec])

  const filterAndSort = useCallback(
    (games: Game[]): Game[] =>
      applyFilter(games.filter(predicate), { sortBy: spec.sortBy, sortDir: spec.sortDir }),
    [predicate, spec.sortBy, spec.sortDir],
  )

  const activeCount = useMemo(() => {
    if (advancedActive) return countConditions(query)
    if (mode === 'basic') return spec.text ? 1 : 0
    return countSpec(spec)
  }, [advancedActive, query, mode, spec])

  return {
    mode,
    setMode,
    spec,
    setSpec,
    query,
    setQuery,
    dirty,
    reset,
    advancedActive,
    predicate,
    filterAndSort,
    activeCount,
  }
}

export { useFilterState }
export type { FilterMode }

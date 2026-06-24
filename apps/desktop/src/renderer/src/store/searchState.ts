import { create } from 'zustand'
import type { FilterMode } from '@/hooks/useFilterState'
import type { FilterSpec } from '@shared/filter'
import type { SearchResponse, SearchResult } from '@shared/search'
import { emptyGroup, type QueryGroup } from '@shared/query'

/**
 * Persists the Search tab's state across navigation. SearchPage unmounts when you
 * open a result's detail page; without this the term/filters/page/results would be
 * lost and re-fetched on return. We keep the last response keyed by query+page
 * (`fetchedKey`) so a remount can skip the network call entirely when nothing
 * changed. Mirrors the useStoreNav pattern.
 *
 * Advanced mode can't be expressed as Steam catalog params (no boolean/OR), so it
 * filters a fetched BUFFER of the top results client-side — the buffer + its key
 * live here too so it survives navigation.
 */
interface SearchState {
  mode: FilterMode
  spec: FilterSpec
  query: QueryGroup
  page: number
  resp: SearchResponse | null
  /** `${JSON.stringify(spec)}|${page}` of the response we currently hold. */
  fetchedKey: string | null
  /** Advanced-mode buffer (top results for the current term/sort) + its key. */
  buffer: SearchResult[] | null
  bufferKey: string | null

  setMode: (mode: FilterMode) => void
  /** Set the spec from a user edit — always returns to page 0. */
  setSpec: (spec: FilterSpec) => void
  setQuery: (query: QueryGroup) => void
  setPage: (page: number) => void
  setResult: (resp: SearchResponse, key: string) => void
  setBuffer: (buffer: SearchResult[], key: string) => void
  /** Clear facets/query but keep the term + sort (the "✕ Clear" button). */
  reset: () => void
}

const useSearchState = create<SearchState>((set) => ({
  mode: 'basic',
  spec: {},
  query: emptyGroup(),
  page: 0,
  resp: null,
  fetchedKey: null,
  buffer: null,
  bufferKey: null,

  setMode: (mode) => set({ mode, page: 0 }),
  setSpec: (spec) => set({ spec, page: 0 }),
  setQuery: (query) => set({ query, page: 0 }),
  setPage: (page) => set({ page }),
  setResult: (resp, key) => set({ resp, fetchedKey: key }),
  setBuffer: (buffer, key) => set({ buffer, bufferKey: key }),
  reset: () =>
    set((s) => ({
      spec: { text: s.spec.text, sortBy: s.spec.sortBy, sortDir: s.spec.sortDir },
      query: emptyGroup(),
      page: 0,
    })),
}))

export { useSearchState }

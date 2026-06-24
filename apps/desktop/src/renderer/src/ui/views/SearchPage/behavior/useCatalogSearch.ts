import { useEffect, useMemo, useRef, useState } from 'react'
import { useLibrary } from '@/hooks/useLibrary'
import { useSearchState } from '@/store/searchState'
import { type ExplicitFacets } from '@ui/compounds/GameFilters'
import { resultToGame, vocabMaps } from '@/lib/search/resultToGame'
import type { FilterSpec } from '@shared/filter'
import { evaluateNode } from '@shared/query'
import { SEARCH_PAGE_SIZE, type SearchResult, type SearchVocab } from '@shared/search'
import { DEBOUNCE_MS, BUFFER_PAGES, CATALOG_FEATURES } from '../SearchPage.constants'

const useCatalogSearch = () => {
  const { games } = useLibrary()
  const ownedByAppid = useMemo(() => {
    const m = new Map<number, (typeof games)[number]>()
    for (const g of games) m.set(g.appid, g)
    return m
  }, [games])

  const s = useSearchState()
  const { mode, spec, query, page, resp, fetchedKey, buffer, bufferKey } = s
  const advanced = mode === 'advanced'

  const [vocab, setVocab] = useState<SearchVocab | null>(null)
  useEffect(() => {
    void window.api.search.getVocab().then(setVocab)
  }, [])
  const facets: ExplicitFacets | undefined = vocab
    ? {
        genres: vocab.genres,
        categories: vocab.categories,
        tags: vocab.tags.map((t) => t.name),
        features: CATALOG_FEATURES,
      }
    : undefined

  const [loading, setLoading] = useState(false)
  const reqId = useRef(0)

  // ── Server-paged fetch (basic / normal) ─────────────────────────────────────
  const specKey = JSON.stringify(spec)
  const [debouncedKey, setDebouncedKey] = useState(specKey)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKey(specKey), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [specKey])

  useEffect(() => {
    if (advanced) return
    if (debouncedKey !== specKey) return // a spec edit is still settling
    const key = `${debouncedKey}|${page}`
    if (key === fetchedKey && resp) return // already have this exact page (e.g. back from detail)
    const id = ++reqId.current
    const q: FilterSpec = JSON.parse(debouncedKey)
    setLoading(true)
    window.api.search
      .query({ text: q.text, spec: q, page })
      .then((r) => id === reqId.current && s.setResult(r, key))
      .catch(
        () =>
          id === reqId.current &&
          s.setResult({ results: [], total: 0, page, pageSize: SEARCH_PAGE_SIZE }, key),
      )
      .finally(() => id === reqId.current && setLoading(false))

  }, [advanced, debouncedKey, page])

  // ── Advanced buffer fetch (top N results, filtered client-side) ──────────────
  const bKey = `${spec.text ?? ''}|${spec.sortBy ?? ''}|${spec.sortDir ?? ''}`
  const [debouncedBKey, setDebouncedBKey] = useState(bKey)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBKey(bKey), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [bKey])

  useEffect(() => {
    if (!advanced) return
    if (debouncedBKey !== bKey) return
    if (debouncedBKey === bufferKey && buffer) return // already buffered this base query
    const id = ++reqId.current
    setLoading(true)
    const base: FilterSpec = { sortBy: spec.sortBy, sortDir: spec.sortDir }
    Promise.all(
      Array.from({ length: BUFFER_PAGES }, (_, i) =>
        window.api.search.query({ text: spec.text, spec: base, page: i }),
      ),
    )
      .then((pages) => {
        if (id !== reqId.current) return
        const seen = new Set<number>()
        const merged: SearchResult[] = []
        for (const p of pages)
          for (const r of p.results) if (!seen.has(r.appid)) (seen.add(r.appid), merged.push(r))
        s.setBuffer(merged, debouncedBKey)
      })
      .catch(() => id === reqId.current && s.setBuffer([], debouncedBKey))
      .finally(() => id === reqId.current && setLoading(false))

  }, [advanced, debouncedBKey])

  // Synthetic games for the buffer (drive Advanced filtering + the field options).
  const { tagNameById, genreSet } = useMemo(() => vocabMaps(vocab), [vocab])
  const bufferGames = useMemo(
    () => (buffer ?? []).map((r) => resultToGame(r, tagNameById, genreSet)),
    [buffer, tagNameById, genreSet],
  )
  const advFiltered = useMemo(() => {
    if (!advanced || !buffer) return []
    return buffer.filter((_r, i) => evaluateNode(bufferGames[i], query))
  }, [advanced, buffer, bufferGames, query])

  // ── Displayed page (mode-dependent) ──────────────────────────────────────────
  const pageSize = SEARCH_PAGE_SIZE
  const total = advanced ? advFiltered.length : (resp?.total ?? 0)
  const scanned = advanced ? (buffer?.length ?? 0) : 0
  const maxPage = Math.max(0, Math.ceil(total / pageSize) - 1)
  const results = advanced ? advFiltered.slice(page * pageSize, page * pageSize + pageSize) : (resp?.results ?? [])
  const rangeStart = total === 0 ? 0 : page * pageSize + 1
  const rangeEnd = advanced ? Math.min(total, (page + 1) * pageSize) : page * pageSize + results.length

  return {
    games,
    ownedByAppid,
    s,
    mode,
    spec,
    query,
    page,
    advanced,
    vocab,
    facets,
    loading,
    bufferGames,
    total,
    scanned,
    maxPage,
    results,
    rangeStart,
    rangeEnd,
  }
}

export { useCatalogSearch }

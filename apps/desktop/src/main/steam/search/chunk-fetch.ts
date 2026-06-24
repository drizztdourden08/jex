import type { SearchQuery, SearchResponse, SearchResult } from '@shared/search'
import { SEARCH_PAGE_SIZE } from '@shared/search'
import { buildFacetParams } from '../searchFacets'
import { ensureVocab } from '../searchVocab'
import { parseResultsHtml } from './html-parse'
import type { SearchResultsJson } from './html-parse'

/**
 * Whole-catalog search via Steam's store search endpoint (keyless, no CORS in
 * main). We use the paged results grid, which returns `total_count` plus a
 * `results_html` blob of result rows parsed by `html-parse`. It's the only public
 * surface that gives BOTH paging (`start`/`count`) and the full faceted query
 * string (tags/features/genre/os/price/sort) — so the same call backs the text
 * search (Phase A) and the faceted search (Phase B).
 */

const SEARCH_URL = 'https://store.steampowered.com/search/results/'

/**
 * Steam's search endpoint only honors `start` at its native page size of 50 — a
 * smaller `count` is silently clamped and `start` ignored (so every "page" would
 * return offset 0). We therefore always fetch in 50-result CHUNKS where paging
 * works, cache them, and slice the UI's SEARCH_PAGE_SIZE view out of the chunk.
 * SEARCH_PAGE_SIZE divides 50, so a UI page never straddles two chunks.
 */
const STEAM_CHUNK = 50
const MAX_CACHED_CHUNKS = 8

interface Chunk {
  results: SearchResult[]
  total: number
}
const chunkCache = new Map<string, Chunk>()
const inflight = new Map<string, Promise<Chunk>>()

const chunkUrl = (query: SearchQuery, chunkStart: number, countryCode?: string): string => {
  const params = new URLSearchParams({
    // `infinite=1` returns the paged results grid ({results_html, total_count,
    // start}); `json=1` instead returns the lightweight suggest list.
    infinite: '1',
    start: String(chunkStart),
    count: String(STEAM_CHUNK),
    // Force games (not DLC/soundtracks/videos) so the catalog stays game-shaped.
    category1: '998',
    l: 'english',
    cc: countryCode || 'US',
  })
  if (query.text?.trim()) params.set('term', query.text.trim())
  buildFacetParams(query.spec, params)
  return `${SEARCH_URL}?${params.toString()}`
}

const fetchChunk = async (query: SearchQuery, chunkStart: number, cc?: string): Promise<Chunk> => {
  // Make sure the tag/genre→id vocab is populated, or buildFacetParams resolves nothing
  // and Steam ignores the facets (returning its default top list regardless of genre).
  await ensureVocab()
  const url = chunkUrl(query, chunkStart, cc) // unique per (filters + offset)
  const cached = chunkCache.get(url)
  if (cached) return cached
  const pending = inflight.get(url)
  if (pending) return pending // coalesce concurrent requests for the same chunk

  const p = (async (): Promise<Chunk> => {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return { results: [], total: 0 }
    const json = (await res.json()) as SearchResultsJson
    return { results: parseResultsHtml(json.results_html ?? ''), total: json.total_count ?? 0 }
  })()
  inflight.set(url, p)
  try {
    const chunk = await p
    chunkCache.set(url, chunk)
    if (chunkCache.size > MAX_CACHED_CHUNKS) chunkCache.delete(chunkCache.keys().next().value!)
    return chunk
  } catch {
    return { results: [], total: 0 }
  } finally {
    inflight.delete(url)
  }
}

/**
 * Run one UI page of a catalog search (SEARCH_PAGE_SIZE results). Fetches the
 * containing 50-result Steam chunk (cached) and slices out the page. Never throws
 * — returns an empty page so the UI shows "no results" instead of an error.
 */
const searchCatalog = async (
  query: SearchQuery,
  countryCode?: string,
): Promise<SearchResponse> => {
  const page = Math.max(0, query.page ?? 0)
  const offset = page * SEARCH_PAGE_SIZE
  const chunkStart = Math.floor(offset / STEAM_CHUNK) * STEAM_CHUNK
  let chunk: Chunk
  try {
    chunk = await fetchChunk(query, chunkStart, countryCode)
  } catch {
    chunk = { results: [], total: 0 }
  }
  const within = offset - chunkStart
  return {
    results: chunk.results.slice(within, within + SEARCH_PAGE_SIZE),
    total: chunk.total,
    page,
    pageSize: SEARCH_PAGE_SIZE,
  }
}

export { STEAM_CHUNK, fetchChunk, searchCatalog }
export type { Chunk }

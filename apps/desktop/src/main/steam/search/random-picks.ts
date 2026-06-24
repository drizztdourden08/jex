import type { SearchQuery, StoreRandomResponse } from '@shared/search'
import { STEAM_CHUNK, fetchChunk } from './chunk-fetch'

/**
 * Random sampling for the randomizer's "Store" source. Reuses the cached +
 * coalesced chunk fetch so a roll never paginates the whole catalog.
 */

/**
 * How deep into the (relevance-ranked) catalog a random roll can reach. Steam's
 * search tail gets sparse/unreliable past a few thousand rows, and capping keeps
 * the chunk cache small — the roll still spans the entire meaningful catalog for
 * any non-trivial filter. Snapped to the 50-chunk boundary by the caller.
 */
const MAX_RANDOM_OFFSET = 5000

/** Fisher–Yates sample of up to `n` items (does not mutate the input). */
const sample = <T>(items: T[], n: number): T[] => {
  const a = items.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

/**
 * Draw a random sample of catalog hits for the randomizer's "Store" source.
 *
 * Efficient by construction — never paginates the whole catalog. It makes at most
 * TWO requests per roll (both cached + coalesced by `fetchChunk`):
 *   1. chunk at offset 0 — solely to learn the matching pool size (`total_count`),
 *   2. one 50-result chunk at a random offset within the reachable pool,
 * then random-samples `count` rows from it. A reroll just rolls a new offset.
 */
const randomStorePicks = async (
  query: SearchQuery,
  count: number,
  countryCode?: string,
): Promise<StoreRandomResponse> => {
  const want = Math.max(1, Math.min(STEAM_CHUNK, count))

  // 1. Pool size. Chunk 0 is reused across every roll (and by searchCatalog).
  const head = await fetchChunk(query, 0, countryCode)
  if (head.total <= 0 || head.results.length === 0) {
    return { picks: [], total: head.total }
  }

  // 2. Random 50-chunk offset within the reachable pool.
  const reachable = Math.min(head.total, MAX_RANDOM_OFFSET)
  const chunkCount = Math.floor((reachable - 1) / STEAM_CHUNK) + 1
  const chunkStart = Math.floor(Math.random() * chunkCount) * STEAM_CHUNK

  // 3. Fetch that chunk (chunk 0 already in hand) and sample from it. A deep chunk
  //    can come back short/empty — fall back to the head chunk so a roll never
  //    yields nothing while the pool is non-empty.
  const chunk = chunkStart === 0 ? head : await fetchChunk(query, chunkStart, countryCode)
  const pool = chunk.results.length ? chunk.results : head.results
  return { picks: sample(pool, want), total: head.total }
}

export { randomStorePicks }

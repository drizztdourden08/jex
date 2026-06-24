import type { SearchVocab } from '@shared/search'
import { getMeta, setMeta } from '../db/database'
import {
  CATEGORY_NAMES,
  CATEGORY_PARAMS,
  FEATURE_TO_CATEGORY,
  GENRE_NAMES,
  GENRE_TAG_IDS,
} from './searchVocab.tables'

/**
 * The faceted vocabulary for catalog search. Two kinds of facet:
 *
 * - **Tags + genres** are resolved to numeric Steam **tagids** via the popular-tags
 *   list (synced from Steam, ~430 entries, covers genres like "Action" too) and
 *   passed as `tags=`.
 * - **Categories + features** map to Steam's `category2` (features) / `category3`
 *   (play modes) facet IDs — a stable, mostly-unchanging set, so it's a constant
 *   table here (scraped once from the store search panel).
 *
 * The tag list is the only part that needs syncing; it's persisted to the `meta`
 * table under `searchVocab` and re-read cheaply when building search params.
 */

const TAGDATA_URL = 'https://store.steampowered.com/tagdata/populartags/english'
const VOCAB_KEY = 'searchVocab'

interface PopularTag {
  tagid: number
  name: string
}

/** Fetch Steam's popular-tags list (keyless). Returns [] on failure. */
const fetchPopularTags = async (): Promise<{ name: string; id: number }[]> => {
  try {
    const res = await fetch(TAGDATA_URL)
    if (!res.ok) return []
    const json = (await res.json()) as PopularTag[]
    return json
      .filter((t) => t && t.name && Number.isFinite(t.tagid))
      .map((t) => ({ name: t.name, id: t.tagid }))
  } catch {
    return []
  }
}

/**
 * Sync the search vocabulary: fetch popular tags, fold in any extra genre/category
 * names we know about, and persist. `extraTags` lets the caller enrich the list
 * with distinct tag names already in the user's library (so it's never poorer than
 * what they have); those without a known id are dropped (can't be filtered).
 */
const syncVocab = async (extraTags: string[] = []): Promise<SearchVocab> => {
  const tags = await fetchPopularTags()
  const byLower = new Map(tags.map((t) => [t.name.toLowerCase(), t]))
  // Keep library tags only when we can resolve an id (otherwise unusable as a filter).
  for (const name of extraTags) {
    const hit = byLower.get(name.toLowerCase())
    if (hit && !tags.includes(hit)) {
      /* already present via byLower */
    }
  }
  const genres = GENRE_NAMES.filter((g) => byLower.has(g.toLowerCase()))
  const vocab: SearchVocab = {
    tags: tags.sort((a, b) => a.name.localeCompare(b.name)),
    genres,
    categories: CATEGORY_NAMES,
    syncedAt: Date.now(),
  }
  setMeta(VOCAB_KEY, vocab)
  return vocab
}

const getVocab = (): SearchVocab | null => {
  return getMeta<SearchVocab>(VOCAB_KEY)
}

/** Lowercased tag name → id: the built-in genre ids, overlaid with the synced vocab
 *  (the long tail of tags). Always usable, even if the vocab was never synced. */
const tagIdMap = (): Map<string, number> => {
  const m = new Map<string, number>(Object.entries(GENRE_TAG_IDS))
  const v = getVocab()
  if (v) for (const t of v.tags) m.set(t.name.toLowerCase(), t.id)
  return m
}

const VOCAB_TTL_MS = 30 * 24 * 60 * 60 * 1000 // re-sync the tag list monthly
let vocabReady = false
let vocabSync: Promise<unknown> | null = null

/**
 * Lazily ensure the faceted vocabulary is populated before a catalog search uses it.
 * Without this, the tag list only ever synced from a manual Settings button — so the
 * AI's search_store (and the Search tab on a fresh install) silently filtered by
 * nothing and Steam returned its default top list. Cheap once synced; never throws.
 */
const ensureVocab = async (): Promise<void> => {
  if (vocabReady) return
  const v = getVocab()
  if (v && v.tags.length && Date.now() - v.syncedAt < VOCAB_TTL_MS) {
    vocabReady = true
    return
  }
  if (!vocabSync) {
    vocabSync = syncVocab()
      .then(() => {
        vocabReady = true
      })
      .catch(() => {})
      .finally(() => {
        vocabSync = null
      })
  }
  await vocabSync
}

export {
  CATEGORY_PARAMS,
  CATEGORY_NAMES,
  FEATURE_TO_CATEGORY,
  GENRE_NAMES,
  fetchPopularTags,
  syncVocab,
  getVocab,
  tagIdMap,
  ensureVocab,
}

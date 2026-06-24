import type { Game } from '@shared/library'
import { persist } from '../../db/database'
import {
  ensureStub,
  getGame,
  markNoStorePage,
  mergeMetadata,
  mergePatch,
} from '../../db/games'
import { fetchCoreMetadata, fetchExtraMetadata } from '../../enrich/metadata'
import { RateLimitError } from '../../steam/store'
import * as scheduler from '../scheduler'

/**
 * Re-fetch full metadata for a single app on demand (refetch-on-open), through the
 * shared queue so it obeys the same rate limit as everything else. Pinned to the
 * front (detail priority) and awaited, returning the updated Game. The caller (the
 * detail page) already skips when its data is recent, so this fires only for stale
 * opens; a 429 just falls back to the cached row.
 */
const refreshOne = async (appid: number): Promise<Game | null> => {
  return scheduler.enqueue(appid, { pin: 'detail' })
}

/**
 * Ensure a catalog appid (opened from Search) exists in the mirror, then enrich +
 * return it. Creates a "discovered" stub (owned/installed = 0) if we've never seen
 * it, so opening a search result caches the full game like any other. Returns the
 * existing row immediately if it's already known and enriched.
 */
const ensureGame = async (appid: number, name?: string): Promise<Game | null> => {
  if (!getGame(appid)) ensureStub(appid, name)
  return scheduler.enqueue(appid, { pin: 'detail' })
}

/**
 * Staged detail fetch — STAGE 1 (fast). Ensures the row exists (caching a catalog
 * game opened from Search), fetches Steam appdetails, and returns the row with most
 * of the page filled in. The slow scraped sources come from `detailExtras`, letting
 * the detail page paint core content first. Single user-paced call, so it runs
 * outside the bulk rate-limiter; a 429 just falls back to the cached row.
 */
const detailCore = async (appid: number, name?: string): Promise<Game | null> => {
  if (!getGame(appid)) ensureStub(appid, name)
  try {
    const core = await fetchCoreMetadata(appid)
    if (core) mergeMetadata(appid, core)
    else markNoStorePage(appid)
    persist()
  } catch (e) {
    if (!(e instanceof RateLimitError)) console.error(`[detailCore ${appid}]`, String(e))
  }
  return getGame(appid)
}

/**
 * Staged detail fetch — STAGE 2 (slow). Reviews, live players, SteamSpy tags/owners,
 * Metacritic, and HowLongToBeat, merged additively over the core row (never wiping
 * stage-1 columns). Returns the now-complete row.
 */
const detailExtras = async (appid: number): Promise<Game | null> => {
  const g = getGame(appid)
  if (!g) return null
  try {
    const extras = await fetchExtraMetadata(appid, g.name, g.metacriticUrl)
    mergePatch(appid, extras, true)
    persist()
  } catch (e) {
    console.error(`[detailExtras ${appid}]`, String(e))
  }
  return getGame(appid)
}

export { refreshOne, ensureGame, detailCore, detailExtras }

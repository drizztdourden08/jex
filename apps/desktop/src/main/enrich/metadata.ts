import type { Game } from '@shared/library'
import { fetchAppDetails } from '../steam/store'
import { fetchReviews } from '../steam/reviews'
import { getCurrentPlayers } from '../steam/webapi'
import { fetchSteamSpy } from './steamspy'
import { fetchMetacritic } from './metacritic'
import { fetchHltb } from './hltb'

/**
 * Stage 1 (fast): just Steam appdetails. This single JSON call already yields most
 * of the page — name, description, media, genres, categories, price, platforms,
 * features, requirements — so the detail view can render almost everything from it
 * while the slower scraped sources (stage 2) load. Returns null when the app has no
 * store page; propagates RateLimitError so the enrich loop can back off.
 */
const fetchCoreMetadata = async (appid: number): Promise<Partial<Game> | null> => {
  return fetchAppDetails(appid)
}

/**
 * Stage 2 (slow): the secondary, independently-failing sources — Steam reviews,
 * live player count, SteamSpy tags/owners, Metacritic, and HowLongToBeat. Returns
 * only the fields these add, as a patch to merge over the core record.
 */
const fetchExtraMetadata = async (
  appid: number,
  name: string,
  metacriticUrl?: string,
): Promise<Partial<Game>> => {
  const [reviews, players, spy, mc, hltb] = await Promise.all([
    fetchReviews(appid),
    getCurrentPlayers(appid),
    fetchSteamSpy(appid),
    metacriticUrl ? fetchMetacritic(metacriticUrl) : Promise.resolve(null),
    fetchHltb(name),
  ])

  const patch: Partial<Game> = {}

  patch.reviews = {
    overall: reviews.overall
      ? { desc: reviews.overall.desc, percent: reviews.overall.percent, total: reviews.overall.total }
      : null,
    recent: reviews.recent
      ? { desc: reviews.recent.desc, percent: reviews.recent.percent, total: reviews.recent.total }
      : null,
  }
  if (players != null) patch.currentPlayers = players
  if (spy) {
    patch.tags = spy.tags
    patch.ownersEstimate = spy.ownersEstimate
    patch.medianPlaytime = spy.medianPlaytimeForever
  }
  patch.metacriticChecked = true
  if (mc) {
    if (mc.user != null) patch.metacriticUser = mc.user
    if (mc.critic != null) patch.metacritic = mc.critic
    patch.metacriticUrl = mc.url
  }
  patch.hltbChecked = true
  if (hltb) patch.hltb = hltb

  return patch
}

/**
 * Full metadata for one app: stage 1 (appdetails) + stage 2 (reviews, players,
 * SteamSpy, Metacritic, HowLongToBeat), merged into one patch. Used by the bulk
 * enrichment scheduler (the detail page fetches the two stages separately so it
 * can paint progressively). Returns null when the app has no store page.
 */
const fetchFullMetadata = async (appid: number): Promise<Partial<Game> | null> => {
  const base = await fetchCoreMetadata(appid)
  if (!base) return null

  const [reviews, players, spy, mc, hltb] = await Promise.all([
    fetchReviews(appid),
    getCurrentPlayers(appid),
    fetchSteamSpy(appid),
    base.metacriticUrl ? fetchMetacritic(base.metacriticUrl) : Promise.resolve(null),
    fetchHltb(base.name ?? ''),
  ])

  const patch: Partial<Game> = { ...base }

  patch.reviews = {
    overall: reviews.overall
      ? { desc: reviews.overall.desc, percent: reviews.overall.percent, total: reviews.overall.total }
      : null,
    recent: reviews.recent
      ? { desc: reviews.recent.desc, percent: reviews.recent.percent, total: reviews.recent.total }
      : null,
  }

  if (players != null) patch.currentPlayers = players

  if (spy) {
    patch.tags = spy.tags
    patch.ownersEstimate = spy.ownersEstimate
    patch.medianPlaytime = spy.medianPlaytimeForever
  }

  patch.metacriticChecked = true
  if (mc) {
    if (mc.user != null) patch.metacriticUser = mc.user
    if (mc.critic != null) patch.metacritic = mc.critic
    patch.metacriticUrl = mc.url
  }

  patch.hltbChecked = true
  if (hltb) patch.hltb = hltb

  return patch
}

export { fetchCoreMetadata, fetchExtraMetadata, fetchFullMetadata }

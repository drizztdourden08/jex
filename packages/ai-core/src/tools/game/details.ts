import type { Game, ReviewSummary } from '@jex/shared/library/index'
import { htmlToText } from './description'

const REQUIREMENTS_CHARS = 700
const MAX_TAGS = 20
const MAX_LANGUAGES = 15

const hours = (minutes?: number): number | undefined =>
  minutes == null ? undefined : Math.round((minutes / 60) * 10) / 10

const clip = (text: string, max: number): string => (text.length > max ? `${text.slice(0, max)}…` : text)

const plain = (html?: string, max?: number): string | undefined => {
  if (!html) return undefined
  const text = htmlToText(html)
  return max ? clip(text, max) : text
}

const review = (r?: ReviewSummary | null): string | undefined =>
  r ? `${r.desc} (${r.percent}% of ${r.total})` : undefined

const isoDay = (unixSec?: number): string | undefined =>
  unixSec ? new Date(unixSec * 1000).toISOString().slice(0, 10) : undefined

const trueKeys = (o?: object): string[] =>
  Object.entries(o ?? {})
    .filter(([, v]) => v === true)
    .map(([k]) => k)

const playtime = (g: Game): Record<string, unknown> | undefined =>
  g.owned
    ? { totalHours: hours(g.playtimeForever), last2WeeksHours: hours(g.playtime2weeks), lastPlayed: isoDay(g.lastPlayed) }
    : undefined

const install = (g: Game): Record<string, unknown> | undefined =>
  g.installed
    ? { sizeGB: g.sizeOnDisk ? Math.round((g.sizeOnDisk / 1e9) * 10) / 10 : undefined, lastUpdated: isoDay(g.lastUpdated) }
    : undefined

/** Everything useful stored for one game, minus the long description (paged separately). */
const gameDetails = (g: Game): Record<string, unknown> => {
  const media = g.media
  return {
    appid: g.appid,
    name: g.name,
    type: g.type,
    inLibrary: g.owned || g.installed,
    owned: g.owned,
    installed: g.installed,
    wishlisted: g.wishlisted,
    isFree: g.isFree,
    shortDescription: plain(g.shortDescription),
    developers: g.developers,
    publishers: g.publishers,
    releaseDate: g.releaseDate,
    genres: g.genres,
    categories: g.categories,
    tags: g.tags.slice(0, MAX_TAGS),
    features: trueKeys(g.features),
    reviews: { overall: review(g.reviews?.overall), recent: review(g.reviews?.recent), total: g.reviewTotal },
    metacritic: { critic: g.metacritic, user: g.metacriticUser },
    howLongToBeatHours: g.hltb,
    players: { current: g.currentPlayers, ownersEstimate: g.ownersEstimate, medianPlaytimeHours: hours(g.medianPlaytime) },
    playtime: playtime(g),
    install: install(g),
    platforms: trueKeys(g.platforms),
    controllerSupport: g.controllerSupport,
    languages: g.languages?.slice(0, MAX_LANGUAGES),
    languageCount: g.languages?.length,
    fullAudioLanguages: g.fullAudioLanguages,
    ageRating: g.ageRating,
    contentDescriptors: g.contentDescriptors,
    dlcCount: g.dlcCount,
    requirements: {
      minimum: plain(g.requirementsMin, REQUIREMENTS_CHARS),
      recommended: plain(g.requirementsRec, REQUIREMENTS_CHARS),
    },
    media: {
      screenshots: media?.screenshots.length ?? 0,
      trailers: media?.movies.length ?? 0,
      trailerNames: media?.movies.slice(0, 5).map((m) => m.name),
    },
    dataStatus: g.enrichment,
  }
}

export { gameDetails }

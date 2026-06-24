import type { Game, GameFeatures, GameMedia } from '@shared/library'

const STORE_API = 'https://store.steampowered.com/api'

/** Thrown on HTTP 429 so the enrichment loop can back off and resume later. */
class RateLimitError extends Error {
  constructor() {
    super('Steam Store API rate limit (429)')
    this.name = 'RateLimitError'
  }
}

interface Requirements {
  minimum?: string
  recommended?: string
}

interface AppDetailsData {
  type?: string
  name?: string
  is_free?: boolean
  short_description?: string
  about_the_game?: string
  detailed_description?: string
  supported_languages?: string
  header_image?: string
  capsule_image?: string
  background_raw?: string
  developers?: string[]
  publishers?: string[]
  genres?: { description: string }[]
  categories?: { description: string }[]
  release_date?: { date: string }
  metacritic?: { score: number; url: string }
  recommendations?: { total: number }
  platforms?: { windows?: boolean; mac?: boolean; linux?: boolean }
  controller_support?: string
  pc_requirements?: Requirements | unknown[]
  dlc?: number[]
  content_descriptors?: { ids?: number[]; notes?: string | null }
  ratings?: Record<string, { rating?: string }>
  screenshots?: { path_thumbnail: string; path_full: string }[]
  movies?: {
    name: string
    thumbnail: string
    hls_h264?: string
    dash_h264?: string
    dash_av1?: string
  }[]
}

type AppDetailsResponse = Record<string, { success: boolean; data?: AppDetailsData }>

/** Everything we can derive from a single appdetails response. */
type MetadataPatch = Partial<Game> & { name?: string }

const parseYear = (date?: string): number | undefined => {
  const m = date?.match(/(\d{4})/)
  return m ? Number(m[1]) : undefined
}

const parseLanguages = (html?: string): { languages: string[]; fullAudio: string[] } => {
  if (!html) return { languages: [], fullAudio: [] }
  const main = html.split(/<br\s*\/?>/i)[0] // drop the trailing "*languages with full audio" note
  const languages: string[] = []
  const fullAudio: string[] = []
  for (const part of main.split(',')) {
    const hasStar = part.includes('*')
    const name = part
      .replace(/<[^>]+>/g, '')
      .replace(/\*/g, '')
      .trim()
    if (!name) continue
    languages.push(name)
    if (hasStar) fullAudio.push(name)
  }
  return { languages, fullAudio }
}

const deriveFeatures = (categories: string[], controllerSupport?: string): GameFeatures => {
  const has = (re: RegExp) => categories.some((c) => re.test(c))
  return {
    singleplayer: has(/single-?player/i),
    multiplayer: has(/multi-?player|online pvp|\bpvp\b/i),
    coop: has(/co-?op/i),
    onlineCoop: has(/online co-?op/i),
    cloud: has(/steam cloud/i),
    controllerFull: controllerSupport === 'full' || has(/full controller support/i),
    controllerPartial: controllerSupport === 'partial' || has(/partial controller support/i),
    tradingCards: has(/trading cards/i),
    workshop: has(/workshop/i),
    vr: has(/\bvr\b/i),
    remotePlayTogether: has(/remote play together/i),
    antiCheat: has(/anti-?cheat/i),
    achievements: has(/achievements/i),
  }
}

const deriveAgeRating = (ratings?: Record<string, { rating?: string }>): string | undefined => {
  if (!ratings) return undefined
  if (ratings.esrb?.rating) return `ESRB ${ratings.esrb.rating.toUpperCase()}`
  if (ratings.pegi?.rating) return `PEGI ${ratings.pegi.rating}`
  const first = Object.entries(ratings).find(([, v]) => v?.rating)
  return first ? `${first[0].toUpperCase()} ${first[1].rating}` : undefined
}

const normalize = (d: AppDetailsData): MetadataPatch => {
  const categories = (d.categories ?? []).map((c) => c.description)
  const { languages, fullAudio } = parseLanguages(d.supported_languages)
  const req = !d.pc_requirements || Array.isArray(d.pc_requirements) ? {} : d.pc_requirements
  const media: GameMedia = {
    headerImage: d.header_image,
    capsuleImage: d.capsule_image,
    background: d.background_raw,
    screenshots: (d.screenshots ?? []).map((s) => ({ thumb: s.path_thumbnail, full: s.path_full })),
    movies: (d.movies ?? []).map((m) => ({
      name: m.name,
      thumbnail: m.thumbnail,
      hls: m.hls_h264,
      dashH264: m.dash_h264,
      dashAv1: m.dash_av1,
    })),
  }
  return {
    name: d.name,
    type: d.type,
    isFree: d.is_free,
    shortDescription: d.short_description,
    aboutHtml: d.about_the_game,
    detailedHtml: d.detailed_description,
    developers: d.developers ?? [],
    publishers: d.publishers ?? [],
    genres: (d.genres ?? []).map((g) => g.description),
    categories,
    releaseDate: d.release_date?.date,
    releaseYear: parseYear(d.release_date?.date),
    metacritic: d.metacritic?.score,
    metacriticUrl: d.metacritic?.url,
    reviewTotal: d.recommendations?.total,
    platforms: {
      windows: Boolean(d.platforms?.windows),
      mac: Boolean(d.platforms?.mac),
      linux: Boolean(d.platforms?.linux),
    },
    controllerSupport: d.controller_support,
    features: deriveFeatures(categories, d.controller_support),
    languages,
    fullAudioLanguages: fullAudio,
    requirementsMin: req.minimum,
    requirementsRec: req.recommended,
    contentDescriptors: d.content_descriptors?.notes ? [d.content_descriptors.notes] : [],
    ageRating: deriveAgeRating(d.ratings),
    dlcCount: d.dlc?.length ?? 0,
    media,
  }
}

/**
 * Fetch + normalize Store metadata for one app (no key needed). Returns null when
 * the app has no store page (delisted/region-locked). Throws RateLimitError on 429.
 */
const fetchAppDetails = async (appid: number): Promise<MetadataPatch | null> => {
  const res = await fetch(`${STORE_API}/appdetails?appids=${appid}&l=english`)
  if (res.status === 429) throw new RateLimitError()
  if (!res.ok) throw new Error(`appdetails ${appid}: ${res.status} ${res.statusText}`)
  const json = (await res.json()) as AppDetailsResponse
  const entry = json[String(appid)]
  if (!entry?.success || !entry.data) return null
  return normalize(entry.data)
}

export { RateLimitError, normalize, fetchAppDetails }
export type { MetadataPatch }

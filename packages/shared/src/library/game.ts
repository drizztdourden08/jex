/**
 * Canonical `Game` domain type and its sub-types, shared across main, preload, and
 * renderer (imported via the `@shared` alias). The library mirror is one `Game` per
 * appid, merged from multiple sources with per-field provenance so re-syncing one
 * source never clobbers another's data.
 */

type EnrichmentStatus =
  | 'owned-only' // not yet enriched (re-queued)
  | 'enriching'
  | 'enriched' // has Store metadata (terminal)
  | 'failed' // transient fetch error (re-queued for retry)
  | 'no-store-page' // delisted/region-locked, no store page (terminal, NOT re-queued)

interface GameMovie {
  name: string
  thumbnail: string
  // Steam now serves adaptive-streaming manifests (no plain mp4/webm). hls plays
  // via hls.js in the renderer.
  hls?: string
  dashH264?: string
  dashAv1?: string
}

interface GameMedia {
  headerImage?: string
  capsuleImage?: string
  background?: string // background_raw — used as the blurred detail backdrop
  screenshots: { thumb: string; full: string }[]
  movies: GameMovie[]
}

/** A review summary (overall = Steam's authoritative numbers; recent = sampled). */
interface ReviewSummary {
  desc: string // "Very Positive"
  percent: number // % positive
  total: number
}

interface GameReviews {
  overall: ReviewSummary | null
  recent: ReviewSummary | null
}

/** Feature flags derived from Steam store categories. */
interface GameFeatures {
  singleplayer?: boolean
  multiplayer?: boolean
  coop?: boolean
  onlineCoop?: boolean
  cloud?: boolean
  controllerFull?: boolean
  controllerPartial?: boolean
  tradingCards?: boolean
  workshop?: boolean
  vr?: boolean
  remotePlayTogether?: boolean
  antiCheat?: boolean
  achievements?: boolean
}

interface HltbInfo {
  main: number // hours
  extra: number
  complete: number
}

interface Game {
  appid: number
  name: string

  // ── local install state (from appmanifest .acf) ──
  installed: boolean
  installDir?: string
  sizeOnDisk?: number // bytes
  lastUpdated?: number // unix seconds
  libraryFolder?: string
  hasLocalArt: boolean

  // ── ownership / engagement (from GetOwnedGames — Phase 2) ──
  owned: boolean
  playtimeForever: number // minutes
  playtime2weeks: number
  lastPlayed?: number
  iconHash?: string

  // ── wishlist state (from IWishlistService/GetWishlist — keyless) ──
  wishlisted: boolean
  wishlistPriority?: number // Steam wishlist rank (0 = top)
  wishlistedAt?: number // unix seconds the item was added

  // ── store metadata (from appdetails — Phase 2) ──
  type?: string
  isFree?: boolean
  shortDescription?: string
  developers: string[]
  publishers: string[]
  genres: string[]
  categories: string[]
  tags: string[]
  releaseDate?: string
  releaseYear?: number
  metacritic?: number
  reviewTotal?: number
  platforms: { windows: boolean; mac: boolean; linux: boolean }
  controllerSupport?: string
  media?: GameMedia

  // ── rich detail metadata (Steam appdetails + appreviews + extra sources) ──
  aboutHtml?: string
  detailedHtml?: string
  reviews?: GameReviews
  metacriticUser?: number // 0.0–10.0
  metacriticUrl?: string
  metacriticChecked?: boolean
  features?: GameFeatures
  languages?: string[]
  fullAudioLanguages?: string[]
  requirementsMin?: string // HTML
  requirementsRec?: string // HTML
  contentDescriptors?: string[]
  ageRating?: string
  dlcCount?: number
  currentPlayers?: number
  ownersEstimate?: string // SteamSpy
  medianPlaytime?: number // minutes (SteamSpy)
  hltb?: HltbInfo
  hltbChecked?: boolean

  // ── bookkeeping ──
  enrichment: EnrichmentStatus
  enrichedAt?: number
  updatedAt: number // unix ms
}

/** Build a Game with sensible empty defaults (callers override what they know). */
const emptyGame = (appid: number, name: string): Game => ({
  appid,
  name,
  installed: false,
  hasLocalArt: false,
  owned: false,
  playtimeForever: 0,
  playtime2weeks: 0,
  wishlisted: false,
  developers: [],
  publishers: [],
  genres: [],
  categories: [],
  tags: [],
  platforms: { windows: false, mac: false, linux: false },
  enrichment: 'owned-only',
  updatedAt: Date.now(),
})

export { emptyGame }
export type {
  EnrichmentStatus,
  GameMovie,
  GameMedia,
  ReviewSummary,
  GameReviews,
  GameFeatures,
  HltbInfo,
  Game,
}

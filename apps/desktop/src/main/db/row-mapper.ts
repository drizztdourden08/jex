import type { Game, GameMedia } from '@shared/library'

interface Row {
  appid: number
  name: string
  installed: number
  installDir: string | null
  sizeOnDisk: number | null
  lastUpdated: number | null
  libraryFolder: string | null
  hasLocalArt: number
  owned: number
  playtimeForever: number
  playtime2weeks: number
  lastPlayed: number | null
  iconHash: string | null
  wishlisted: number
  wishlistPriority: number | null
  wishlistDate: number | null
  type: string | null
  isFree: number | null
  shortDescription: string | null
  developers: string | null
  publishers: string | null
  genres: string | null
  categories: string | null
  tags: string | null
  releaseDate: string | null
  releaseYear: number | null
  metacritic: number | null
  reviewTotal: number | null
  platforms: string | null
  controllerSupport: string | null
  media: string | null
  rich: string | null
  enrichment: string
  enrichedAt: number | null
  updatedAt: number
}

/** Rich detail fields stored as one JSON blob in the `rich` column. */
type RichBundle = Partial<
  Pick<
    Game,
    | 'aboutHtml'
    | 'detailedHtml'
    | 'reviews'
    | 'metacriticUser'
    | 'metacriticUrl'
    | 'metacriticChecked'
    | 'features'
    | 'languages'
    | 'fullAudioLanguages'
    | 'requirementsMin'
    | 'requirementsRec'
    | 'contentDescriptors'
    | 'ageRating'
    | 'dlcCount'
    | 'currentPlayers'
    | 'ownersEstimate'
    | 'medianPlaytime'
    | 'hltb'
    | 'hltbChecked'
  >
>

const RICH_KEYS: (keyof RichBundle)[] = [
  'aboutHtml',
  'detailedHtml',
  'reviews',
  'metacriticUser',
  'metacriticUrl',
  'metacriticChecked',
  'features',
  'languages',
  'fullAudioLanguages',
  'requirementsMin',
  'requirementsRec',
  'contentDescriptors',
  'ageRating',
  'dlcCount',
  'currentPlayers',
  'ownersEstimate',
  'medianPlaytime',
  'hltb',
  'hltbChecked',
]

const jsonArr = (v: string | null): string[] => {
  if (!v) return []
  try {
    const parsed = JSON.parse(v)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const rowToGame = (r: Row): Game => {
  let platforms = { windows: false, mac: false, linux: false }
  if (r.platforms) {
    try {
      platforms = { ...platforms, ...JSON.parse(r.platforms) }
    } catch {
      /* keep default */
    }
  }
  let media: GameMedia | undefined
  if (r.media) {
    try {
      media = JSON.parse(r.media) as GameMedia
    } catch {
      media = undefined
    }
  }
  let rich: RichBundle = {}
  if (r.rich) {
    try {
      rich = JSON.parse(r.rich) as RichBundle
    } catch {
      rich = {}
    }
  }
  return {
    ...rich,
    appid: r.appid,
    name: r.name,
    installed: !!r.installed,
    installDir: r.installDir ?? undefined,
    sizeOnDisk: r.sizeOnDisk ?? undefined,
    lastUpdated: r.lastUpdated ?? undefined,
    libraryFolder: r.libraryFolder ?? undefined,
    hasLocalArt: !!r.hasLocalArt,
    owned: !!r.owned,
    playtimeForever: r.playtimeForever,
    playtime2weeks: r.playtime2weeks,
    lastPlayed: r.lastPlayed ?? undefined,
    iconHash: r.iconHash ?? undefined,
    wishlisted: !!r.wishlisted,
    wishlistPriority: r.wishlistPriority ?? undefined,
    wishlistedAt: r.wishlistDate ?? undefined,
    type: r.type ?? undefined,
    isFree: r.isFree == null ? undefined : !!r.isFree,
    shortDescription: r.shortDescription ?? undefined,
    developers: jsonArr(r.developers),
    publishers: jsonArr(r.publishers),
    genres: jsonArr(r.genres),
    categories: jsonArr(r.categories),
    tags: jsonArr(r.tags),
    releaseDate: r.releaseDate ?? undefined,
    releaseYear: r.releaseYear ?? undefined,
    metacritic: r.metacritic ?? undefined,
    reviewTotal: r.reviewTotal ?? undefined,
    platforms,
    controllerSupport: r.controllerSupport ?? undefined,
    media,
    enrichment: r.enrichment as Game['enrichment'],
    enrichedAt: r.enrichedAt ?? undefined,
    updatedAt: r.updatedAt,
  }
}

export { rowToGame, jsonArr, RICH_KEYS }
export type { Row, RichBundle }

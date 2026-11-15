import type { Game } from '@jex/shared/library/index'
import { host } from '../../host'

/** How long a tool waits on the throttled Store queue before answering with what it has. */
const STORE_WAIT_MS = 30_000

type ResolvedGame = { ok: true; game: Game } | { ok: false; result: Record<string, unknown> }

const asAppid = (query: string): number | null => {
  const n = Number(query)
  return Number.isInteger(n) && n > 0 ? n : null
}

/** Mirror lookup by appid, else exact name, else the shortest substring match. */
const resolveLocalGame = (query: string): Game | undefined => {
  const games = host().db.getAllGames()
  const id = asAppid(query)
  const byId = id != null ? games.find((g) => g.appid === id) : undefined
  if (byId) return byId
  const q = query.toLowerCase()
  return (
    games.find((g) => g.name.toLowerCase() === q) ??
    games.filter((g) => g.name.toLowerCase().includes(q)).sort((a, b) => a.name.length - b.name.length)[0]
  )
}

const hasStoreData = (g: Game): boolean => g.enrichment === 'enriched' || g.enrichment === 'no-store-page'

// The host's storeGame runs through the throttled enrichment queue (Store API limit).
const fetchFromStore = async (appid: number): Promise<Game | null> => {
  const storeGame = host().steam.storeGame
  if (!storeGame) return null
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), STORE_WAIT_MS)
  })
  try {
    return await Promise.race([storeGame(appid).catch(() => null), timeout])
  } finally {
    clearTimeout(timer)
  }
}

const notFound = (query: string, hint: string): ResolvedGame => ({
  ok: false,
  result: { found: false, query, hint },
})

const isUsable = (g: Game | null | undefined): g is Game =>
  g != null && (g.owned || g.installed || g.enrichment === 'enriched')

// Mirror row if it already has store data, else the throttled Store fetch (or the row).
const withStoreData = async (appid: number, local: Game | undefined): Promise<Game | null> => {
  if (local && hasStoreData(local)) return local
  return (await fetchFromStore(appid)) ?? local ?? null
}

const NO_STORE_LOOKUP = 'This version of Jex cannot look up store games; update the app.'
const NO_DATA = 'No store data for this appid (no store page, or the Steam Store is busy; try again shortly).'

/**
 * Resolve a game for the detail tools. An appid is looked up in the mirror, else
 * fetched from the Steam Store (so search_store results work too); a name is matched
 * in the mirror only.
 */
const resolveGame = async (rawQuery: unknown): Promise<ResolvedGame> => {
  const query = String(rawQuery ?? '').trim()
  if (!query) return notFound(query, 'Provide a game name or appid.')
  const id = asAppid(query)
  if (id != null) {
    const byId = await withStoreData(id, host().db.getGame(id) ?? undefined)
    if (isUsable(byId)) return { ok: true, game: byId }
  }
  const byName = resolveLocalGame(query)
  if (byName && byName.appid !== id) {
    const game = await withStoreData(byName.appid, byName)
    if (isUsable(game)) return { ok: true, game }
  }
  if (id != null) return notFound(query, host().steam.storeGame ? NO_DATA : NO_STORE_LOOKUP)
  return notFound(query, 'Not in the library. For a store game, pass its numeric appid (from search_store).')
}

export { resolveGame, resolveLocalGame }
export type { ResolvedGame }

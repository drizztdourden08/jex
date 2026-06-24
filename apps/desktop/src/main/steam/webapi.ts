const WEB_API = 'https://api.steampowered.com'

interface OwnedGame {
  appid: number
  name: string
  playtimeForever: number // minutes
  playtime2weeks: number
  lastPlayed?: number // unix seconds
  iconHash?: string
}

interface OwnedGamesResponse {
  response?: {
    game_count?: number
    games?: {
      appid: number
      name?: string
      playtime_forever?: number
      playtime_2weeks?: number
      rtime_last_played?: number
      img_icon_url?: string
    }[]
  }
}

/**
 * Fetch the full owned-games list (covers games that aren't installed). Needs the
 * user's Web API key; returns [] if the profile's game-details privacy is not
 * public. Called from the main process — no CORS, no proxy.
 */
const getOwnedGames = async (key: string, steamId: string): Promise<OwnedGame[]> => {
  const url =
    `${WEB_API}/IPlayerService/GetOwnedGames/v1/` +
    `?key=${encodeURIComponent(key)}&steamid=${encodeURIComponent(steamId)}` +
    `&include_appinfo=1&include_played_free_games=1&format=json`
  const res = await fetch(url)
  if (res.status === 401 || res.status === 403) {
    throw new Error('Steam rejected the API key (401/403). Check the key in Settings.')
  }
  if (!res.ok) throw new Error(`GetOwnedGames failed: ${res.status} ${res.statusText}`)
  const json = (await res.json()) as OwnedGamesResponse
  return (json.response?.games ?? []).map((g) => ({
    appid: g.appid,
    name: g.name ?? `App ${g.appid}`,
    playtimeForever: g.playtime_forever ?? 0,
    playtime2weeks: g.playtime_2weeks ?? 0,
    lastPlayed: g.rtime_last_played || undefined,
    iconHash: g.img_icon_url || undefined,
  }))
}

/** Live concurrent player count (keyless). Null when unavailable. */
const getCurrentPlayers = async (appid: number): Promise<number | null> => {
  try {
    const res = await fetch(
      `${WEB_API}/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appid}`,
    )
    if (!res.ok) return null
    const json = (await res.json()) as { response?: { result?: number; player_count?: number } }
    return json.response?.result === 1 ? (json.response.player_count ?? null) : null
  } catch {
    return null
  }
}

export { getOwnedGames, getCurrentPlayers }
export type { OwnedGame }

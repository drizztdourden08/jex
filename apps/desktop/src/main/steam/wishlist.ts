const WEB_API = 'https://api.steampowered.com'

interface WishlistItem {
  appid: number
  name?: string // not provided by the API — filled in by enrichment
  priority?: number // wishlist rank, 0 = top
  dateAdded?: number // unix seconds
}

/** Shapes seen from IWishlistService/GetWishlist across Steam revisions. */
interface WishlistResponse {
  response?: {
    items?: { appid: number; priority?: number; date_added?: number }[]
    // Older field name kept for resilience.
    wishlist?: { appid: number; priority?: number; date_added?: number }[]
  }
}

/**
 * Fetch the user's Steam wishlist. Uses the keyless IWishlistService endpoint
 * (works when the profile's wishlist is public); the Web API key is passed when
 * available since some accounts require it. Called from the main process — no CORS.
 *
 * Returns appid + priority + date_added only; titles/genres/media come from the
 * existing appdetails enrichment pass. Returns [] for a private/empty wishlist —
 * the caller treats an empty result as "don't wipe" to survive transient privacy.
 */
const getWishlist = async (steamId: string, key?: string): Promise<WishlistItem[]> => {
  const url =
    `${WEB_API}/IWishlistService/GetWishlist/v1/` +
    `?steamid=${encodeURIComponent(steamId)}` +
    (key ? `&key=${encodeURIComponent(key)}` : '') +
    `&format=json`
  const res = await fetch(url)
  if (res.status === 401 || res.status === 403) {
    // Private wishlist (or rejected key) — treat as empty so we don't wipe state.
    return []
  }
  if (!res.ok) throw new Error(`GetWishlist failed: ${res.status} ${res.statusText}`)
  const json = (await res.json()) as WishlistResponse
  const items = json.response?.items ?? json.response?.wishlist ?? []
  return items.map((i) => ({
    appid: i.appid,
    priority: i.priority,
    dateAdded: i.date_added || undefined,
  }))
}

export { getWishlist }
export type { WishlistItem }

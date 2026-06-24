interface SteamSpyData {
  tags: string[] // top community tags (most-voted first)
  ownersEstimate: string // e.g. "10,000,000 .. 20,000,000"
  medianPlaytimeForever: number // minutes
}

interface SteamSpyRaw {
  tags?: Record<string, number> | unknown[]
  owners?: string
  median_forever?: number
}

/** Community tags + popularity from SteamSpy (keyless, ~1 req/s). */
const fetchSteamSpy = async (appid: number): Promise<SteamSpyData | null> => {
  try {
    const res = await fetch(`https://steamspy.com/api.php?request=appdetails&appid=${appid}`)
    if (!res.ok) return null
    const j = (await res.json()) as SteamSpyRaw
    const tags =
      j.tags && !Array.isArray(j.tags)
        ? Object.entries(j.tags)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 25) // SteamSpy exposes ~20 community tags; keep them all
            .map(([t]) => t)
        : []
    return {
      tags,
      ownersEstimate: j.owners ?? '',
      medianPlaytimeForever: j.median_forever ?? 0,
    }
  } catch {
    return null
  }
}

export { fetchSteamSpy }
export type { SteamSpyData }

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

interface MetacriticScores {
  url: string
  critic: number | null // metascore, 0-100
  user: number | null // user score, 0.0-10.0
}

/**
 * Scrape Metacritic for both scores (tested + confirmed):
 *  - critic (metascore): the page's ld+json AggregateRating.ratingValue
 *  - user score: the aggregate is the only DECIMAL-valued "User score N.N out of 10"
 *    title (individual user reviews are whole integers)
 *
 * Returns `{ critic:null, user:null }` when the page is reachable but has no
 * scores (so callers mark it checked and show nothing); returns `null` only on a
 * network error (so it can be retried).
 */
const fetchMetacritic = async (url: string): Promise<MetacriticScores | null> => {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en' },
      redirect: 'follow',
    })
    if (!res.ok) return { url, critic: null, user: null }
    const html = await res.text()

    let critic: number | null = null
    const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
    if (ld) {
      try {
        const v = (JSON.parse(ld[1]) as { aggregateRating?: { ratingValue?: number | string } })
          ?.aggregateRating?.ratingValue
        const n = typeof v === 'string' ? Number(v) : v
        if (typeof n === 'number' && isFinite(n)) critic = Math.round(n)
      } catch {
        /* ignore malformed ld+json */
      }
    }

    let user: number | null = null
    const um = html.match(/title="User score (\d+\.\d+) out of 10"/)
    if (um) {
      const n = Number(um[1])
      if (isFinite(n) && n >= 0 && n <= 10) user = n
    }

    return { url, critic, user }
  } catch {
    return null
  }
}

export { fetchMetacritic }
export type { MetacriticScores }

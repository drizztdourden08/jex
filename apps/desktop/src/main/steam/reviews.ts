interface ReviewSummary {
  desc: string // e.g. "Very Positive"
  positive: number
  total: number
  percent: number // % positive
}

interface SteamReviews {
  overall: ReviewSummary | null
  recent: ReviewSummary | null
}

interface ReviewsRaw {
  query_summary?: {
    review_score_desc?: string
    total_positive?: number
    total_reviews?: number
  }
}

/** Overall summary — Steam's own `query_summary` (authoritative). */
const fetchOverall = async (appid: number): Promise<ReviewSummary | null> => {
  const res = await fetch(
    `https://store.steampowered.com/appreviews/${appid}?json=1&num_per_page=0&language=all&purchase_type=all&filter=all`,
  )
  if (!res.ok) return null
  const q = ((await res.json()) as ReviewsRaw).query_summary
  if (!q || !q.total_reviews) return null
  const total = q.total_reviews
  const positive = q.total_positive ?? 0
  return {
    desc: q.review_score_desc ?? '',
    positive,
    total,
    percent: total ? Math.round((positive / total) * 100) : 0,
  }
}

const descFromPercent = (percent: number, total: number): string => {
  if (total < 10) return 'Few recent reviews'
  if (percent >= 80) return 'Very Positive'
  if (percent >= 70) return 'Mostly Positive'
  if (percent >= 40) return 'Mixed'
  if (percent >= 20) return 'Mostly Negative'
  return 'Negative'
}

/**
 * Recent sentiment — Steam's `query_summary` ignores the `recent` filter, so we
 * sample the newest reviews and compute % positive (an approximation of the
 * store's "Recent Reviews" trend over the last ~100 reviews).
 */
const fetchRecent = async (appid: number): Promise<ReviewSummary | null> => {
  const res = await fetch(
    `https://store.steampowered.com/appreviews/${appid}?json=1&filter=recent&num_per_page=100&language=all&purchase_type=all`,
  )
  if (!res.ok) return null
  const reviews = ((await res.json()) as { reviews?: { voted_up?: boolean }[] }).reviews ?? []
  if (!reviews.length) return null
  const positive = reviews.filter((r) => r.voted_up).length
  const total = reviews.length
  const percent = Math.round((positive / total) * 100)
  return { desc: descFromPercent(percent, total), positive, total, percent }
}

/** Steam review summaries — authoritative overall + a recent-trend sample. Keyless. */
const fetchReviews = async (appid: number): Promise<SteamReviews> => {
  try {
    const [overall, recent] = await Promise.all([fetchOverall(appid), fetchRecent(appid)])
    return { overall, recent }
  } catch {
    return { overall: null, recent: null }
  }
}

export { fetchReviews }
export type { ReviewSummary, SteamReviews }

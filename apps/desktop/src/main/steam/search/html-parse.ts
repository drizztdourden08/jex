import type { SearchResult, SearchReview } from '@shared/search'

/**
 * Pure HTML/entity parsing for Steam's `results_html` blob. Deliberately isolated
 * + pure so it can be snapshot-tested against a captured fixture (Phase D); Steam
 * can change the markup, so it fails soft (a row that doesn't parse is skipped,
 * never throws).
 */

interface SearchResultsJson {
  total_count?: number
  results_html?: string
  start?: number
}

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' ',
  '&trade;': '™',
  '&reg;': '®',
}

const decodeEntities = (s: string): string => {
  return s
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;|&#39;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
}

const stripTags = (s: string): string => {
  return decodeEntities(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

/** Parse "Very Positive<br>91% of the 12,345 user reviews…" → desc/percent/total. */
const parseReviewTooltip = (tooltip: string): SearchReview | undefined => {
  const text = decodeEntities(tooltip)
  const parts = text.split(/<br\s*\/?>/i)
  const desc = (parts[0] ?? '').trim()
  if (!desc || /no user reviews/i.test(text)) {
    return desc ? { desc } : undefined
  }
  const m = text.match(/(\d+)%\s+of\s+the\s+([\d,]+)/i)
  if (!m) return { desc }
  return { desc, percent: Number(m[1]), total: Number(m[2].replace(/,/g, '')) }
}

/** Parse a single `search_result_row` anchor's inner markup → SearchResult. */
const parseResultRow = (row: string): SearchResult | null => {
  // Single appid only — bundle/package rows carry a comma list and are skipped.
  const appidM = row.match(/data-ds-appid="(\d+)"/)
  if (!appidM) return null
  const appid = Number(appidM[1])

  const nameM = row.match(/<span class="title">([\s\S]*?)<\/span>/)
  const name = nameM ? decodeEntities(nameM[1]).trim() : ''
  if (!name) return null

  const result: SearchResult = { appid, name }

  const relM = row.match(/<div class="search_released[^"]*">([\s\S]*?)<\/div>/)
  const released = relM ? stripTags(relM[1]) : ''
  if (released) result.released = released

  const revM = row.match(/search_review_summary[^"]*"[^>]*data-tooltip-html="([\s\S]*?)"/)
  if (revM) {
    const review = parseReviewTooltip(revM[1])
    if (review) result.review = review
  }

  // First data-price-final on the row is the combined block = the final price (cents).
  const centsM = row.match(/data-price-final="(\d+)"/)
  if (centsM) result.priceCents = Number(centsM[1])

  // Currency-correct price string Steam already formatted.
  const finalM = row.match(/<div class="discount_final_price">([\s\S]*?)<\/div>/)
  if (finalM) {
    const priceText = stripTags(finalM[1])
    if (priceText) result.priceText = priceText
  }
  if (!result.priceText && result.priceCents === 0) result.priceText = 'Free'

  const discM = row.match(/<div class="discount_pct">\s*-?(\d+)%/)
  if (discM) result.discountPct = Number(discM[1])

  result.platforms = {
    windows: /platform_img\s+win/.test(row),
    mac: /platform_img\s+mac/.test(row),
    linux: /platform_img\s+linux/.test(row),
  }

  // The row's own capsule image — the exact URL Steam serves (some games' header.jpg
  // 404s at the cloudflare path, so this is the reliable art source for cards).
  const capM = row.match(/<div class="search_capsule">\s*<img[^>]+src="([^"]+)"/)
  if (capM) result.capsule = decodeEntities(capM[1])

  // The game's tag IDs (used to reconstruct genres/tags for Advanced filtering).
  const tagsM = row.match(/data-ds-tagids="\[([\d,\s]*)\]"/)
  if (tagsM && tagsM[1].trim()) {
    result.tagIds = tagsM[1]
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n))
  }

  return result
}

/** Split `results_html` on its row anchors and parse each. */
const parseResultsHtml = (html: string): SearchResult[] => {
  if (!html) return []
  // Rows are <a class="search_result_row …">…</a>; split keeping each anchor.
  const rows = html.split(/(?=<a\b[^>]*class="[^"]*search_result_row)/)
  const out: SearchResult[] = []
  for (const row of rows) {
    if (!/search_result_row/.test(row)) continue
    try {
      const r = parseResultRow(row)
      if (r) out.push(r)
    } catch {
      /* a malformed row is skipped, never fatal */
    }
  }
  return out
}

export { decodeEntities, parseResultRow, parseResultsHtml }
export type { SearchResultsJson }

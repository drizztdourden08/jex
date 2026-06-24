import type { SitemapEntry, SitemapSearchResult } from './types'
import { SITEMAP } from './entries'

/**
 * Pure, deterministic keyword search over the Steam sitemap. Scores each entry
 * against the query (and its individual tokens), weighting the curated `keywords`
 * highest, then title/functionality/section, with a small bonus for description
 * hits. No side effects → unit-testable without the LLM.
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'to', 'my', 'me', 'i', 'of', 'on', 'in', 'for', 'and',
  'go', 'open', 'show', 'take', 'page', 'steam', 'where', 'how', 'do', 'can',
  'is', 'it', 'with', 'get', 'find', 'this', 'that', 'these', 'those', 'your',
])

const normalize = (s: string): string => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()

const tokenize = (s: string): string[] => normalize(s).split(' ').filter((t) => t.length > 1 && !STOP_WORDS.has(t))

/** Levenshtein edit distance, early-exiting once it cannot be ≤ a small bound. */
const editDistance = (a: string, b: string): number => {
  if (Math.abs(a.length - b.length) > 2) return 3
  const dp = Array.from({ length: a.length + 1 }, (_, i) => i)
  for (let j = 1; j <= b.length; j++) {
    let prev = dp[0]
    dp[0] = j
    for (let i = 1; i <= a.length; i++) {
      const tmp = dp[i]
      dp[i] = Math.min(dp[i] + 1, dp[i - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[a.length]
}

/** Typo tolerance: does `token` nearly match any of `words` (tight, length-scaled)? */
const fuzzyHit = (token: string, words: string[]): boolean => {
  if (token.length < 4) return false
  const max = token.length <= 5 ? 1 : 2
  return words.some((w) => w.length >= 4 && editDistance(token, w) <= max)
}

const scoreEntry = (entry: SitemapEntry, phrase: string, tokens: string[]): number => {
  const keywords = entry.keywords.map(normalize)
  const title = normalize(entry.title)
  const functionalities = entry.functionalities.map(normalize)
  const section = normalize(entry.section)
  const description = normalize(entry.description)
  const keywordWords = [...new Set(keywords.flatMap((k) => k.split(' ')))]
  const titleWords = title.split(' ')
  let score = 0

  // Whole-phrase intent match against a curated keyword is the strongest signal.
  if (phrase && keywords.some((k) => k.includes(phrase))) score += 12

  for (const token of tokens) {
    // Keywords (exact > substring > fuzzy/typo).
    if (keywords.includes(token)) score += 10
    else if (keywords.some((k) => k.includes(token))) score += 6
    else if (fuzzyHit(token, keywordWords)) score += 5
    // Title (exact word > substring > fuzzy/typo).
    if (titleWords.includes(token)) score += 5
    else if (title.includes(token)) score += 3
    else if (fuzzyHit(token, titleWords)) score += 3
    if (functionalities.includes(token)) score += 4
    if (section === token) score += 4
    if (description.includes(token)) score += 1
  }
  return score
}

const toResult = (entry: SitemapEntry, score: number): SitemapSearchResult => ({
  id: entry.id,
  title: entry.title,
  url: entry.url,
  section: entry.section,
  description: entry.description,
  needsAuth: entry.needsAuth,
  ...(entry.dynamic ? { dynamic: true, param: entry.param } : {}),
  score,
})

const searchSitemap = (query: string, limit = 6): SitemapSearchResult[] => {
  const phrase = normalize(query)
  const tokens = tokenize(query)
  if (!phrase) return []
  return SITEMAP.map((entry) => ({ entry, score: scoreEntry(entry, phrase, tokens) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, Math.max(1, Math.min(20, limit)))
    .map((r) => toResult(r.entry, r.score))
}

export { searchSitemap }

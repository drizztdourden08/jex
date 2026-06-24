import type { FilterSpec } from '@jex/shared/filter'
import type { AiVocab } from '@jex/shared/ai'

/**
 * Pure NL-query helpers (no Electron/model imports) so they're unit-testable in
 * Node. `parseFilterSpec` + `sanitize` are the safety net: the model's text is
 * coerced into a bounded FilterSpec, dropping anything off-contract.
 */

const FILTER_KEYS = `
{
  "text"?: string,
  "genres"?: string[],
  "categories"?: string[],
  "tags"?: string[],
  "developers"?: string[],
  "publishers"?: string[],
  "playtimeForeverMin"?: number,   // minutes
  "playtimeForeverMax"?: number,
  "releaseYear"?: { "min"?: number, "max"?: number },
  "metacriticMin"?: number,        // 0-100
  "reviewPercentMin"?: number,     // 0-100, Steam positive %
  "features"?: string[],           // see feature vocabulary
  "platforms"?: ("windows"|"mac"|"linux")[],
  "installedOnly"?: boolean,
  "unplayedOnly"?: boolean,
  "playedOnly"?: boolean,
  "freeOnly"?: boolean,
  "hasControllerSupport"?: boolean,
  "sortBy"?: "name"|"playtimeForever"|"playtime2weeks"|"releaseYear"|"metacritic"|"reviewTotal"|"random",
  "sortDir"?: "asc"|"desc",
  "limit"?: number
}`.trim()

/** GameFeatures keys the filter understands (the AI feature vocabulary). */
const FEATURE_KEYS = [
  'singleplayer',
  'multiplayer',
  'coop',
  'onlineCoop',
  'cloud',
  'controllerFull',
  'controllerPartial',
  'tradingCards',
  'workshop',
  'vr',
  'remotePlayTogether',
  'antiCheat',
  'achievements',
]

const buildSystemPrompt = (vocab: AiVocab = {}): string => {
  const genres = vocab.genres?.length ? vocab.genres.join(', ') : '(unknown)'
  const categories = vocab.categories?.length ? vocab.categories.join(', ') : '(unknown)'
  return [
    "You translate a request about the user's Steam library into a JSON filter.",
    'Respond with ONLY a single minified JSON object — no prose, no code fences.',
    'Shape (omit keys you do not need):',
    FILTER_KEYS,
    '',
    'Rules:',
    '- Prefer values from the provided vocabularies; match casing loosely.',
    '- "random"/"surprise me"/"pick one" → "sortBy":"random" and a small "limit" (1 unless asked).',
    '- "haven\'t played"/"new to me" → "unplayedOnly":true. "installed" → "installedOnly":true.',
    '- "favorites"/"most played" → "sortBy":"playtimeForever","sortDir":"desc".',
    '- "co-op"/"controller"/"VR"/"cloud saves" etc. → add the matching "features".',
    '- "well-reviewed"/"highly rated" → "reviewPercentMin" (e.g. 85) or "metacriticMin".',
    '- If the request is vague, return {}.',
    '',
    `Genre vocabulary: ${genres}`,
    `Category vocabulary: ${categories}`,
    `Feature vocabulary: ${FEATURE_KEYS.join(', ')}`,
  ].join('\n')
}

/** Tolerant JSON extraction — strip code fences, grab the first {...}, sanitize. */
const parseFilterSpec = (text: string): FilterSpec => {
  const cleaned = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) return {}
  try {
    return sanitize(JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>)
  } catch {
    return {}
  }
}

/** Keep only known keys with correct primitive types — never trust raw model output. */
const sanitize = (o: Record<string, unknown>): FilterSpec => {
  const spec: FilterSpec = {}
  const strArr = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : undefined
  const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? v : undefined)
  // Small models love to fill every numeric field with 0 ("unset"), which here
  // means real filters (releaseYear 0-0 excludes everything). Treat non-positive
  // bounds as absent so they don't silently nuke the results.
  const posNum = (v: unknown) => {
    const n = num(v)
    return n != null && n > 0 ? n : undefined
  }
  const bool = (v: unknown) => (typeof v === 'boolean' ? v : undefined)

  if (typeof o.text === 'string') spec.text = o.text
  spec.genres = strArr(o.genres)
  spec.categories = strArr(o.categories)
  spec.tags = strArr(o.tags)
  spec.developers = strArr(o.developers)
  spec.publishers = strArr(o.publishers)
  spec.playtimeForeverMin = posNum(o.playtimeForeverMin)
  spec.playtimeForeverMax = posNum(o.playtimeForeverMax)
  if (o.releaseYear && typeof o.releaseYear === 'object') {
    const ry = o.releaseYear as Record<string, unknown>
    const min = posNum(ry.min)
    const max = posNum(ry.max)
    if (min != null || max != null) spec.releaseYear = { min, max }
  }
  spec.metacriticMin = posNum(o.metacriticMin)
  const rpm = posNum(o.reviewPercentMin)
  if (rpm != null) spec.reviewPercentMin = Math.max(0, Math.min(100, rpm))
  spec.features = strArr(o.features)?.filter((f) => FEATURE_KEYS.includes(f))
  const platforms = strArr(o.platforms)?.filter((p) =>
    ['windows', 'mac', 'linux'].includes(p),
  ) as ('windows' | 'mac' | 'linux')[] | undefined
  // Drop platforms that lists all 3 — it reads as "any platform" but triggers AND-all
  // in matches(), silently excluding Windows-only games. Only apply when it's a real
  // restriction (the user asked for mac/linux games, not all-platforms).
  if (platforms?.length && platforms.length < 3) spec.platforms = platforms
  spec.installedOnly = bool(o.installedOnly)
  spec.unplayedOnly = bool(o.unplayedOnly)
  spec.playedOnly = bool(o.playedOnly)
  spec.freeOnly = bool(o.freeOnly)
  spec.hasControllerSupport = bool(o.hasControllerSupport)
  const SORT_KEYS = [
    'name',
    'playtimeForever',
    'playtime2weeks',
    'releaseYear',
    'metacritic',
    'reviewTotal',
    'random',
  ]
  if (typeof o.sortBy === 'string' && SORT_KEYS.includes(o.sortBy)) {
    spec.sortBy = o.sortBy as FilterSpec['sortBy']
  }
  if (o.sortDir === 'asc' || o.sortDir === 'desc') spec.sortDir = o.sortDir
  // Use num (not posNum) so a negative/zero limit is floored to 1 by the clamp
  // below rather than dropped — the clamp's Math.max(1, …) is the intended guard.
  const lim = num(o.limit)
  if (lim != null) spec.limit = Math.max(1, Math.min(500, Math.floor(lim)))

  // Weak models echo the genre/tag word into `text` too (e.g. text:"RPG" alongside
  // genres:["RPG"]), which wrongly narrows to titles literally containing it. If
  // `text` just duplicates a facet value we already captured, drop it.
  if (spec.text) {
    const norm = (s: string) => s.toLowerCase().replace(/s$/, '').trim()
    const facetVals = [
      ...(spec.genres ?? []),
      ...(spec.categories ?? []),
      ...(spec.tags ?? []),
      ...(spec.features ?? []),
    ].map(norm)
    if (facetVals.includes(norm(spec.text))) delete spec.text
  }

  return JSON.parse(JSON.stringify(spec)) // drop undefined keys
}

export { FEATURE_KEYS, buildSystemPrompt, parseFilterSpec, sanitize }

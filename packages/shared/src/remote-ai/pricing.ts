import type { SessionUsage } from '../agent'

/** USD per million tokens. Source: Anthropic model catalog and prompt-caching docs;
 *  cache writes are the 5-minute TTL price (1.25x input). */
interface ModelPrice {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

// Keyed by model-id prefix; the longest matching prefix wins.
const PRICES: Record<string, ModelPrice> = {
  'claude-fable-5-2': { input: 8, output: 40, cacheRead: 0.2, cacheWrite: 10 },
  'claude-fable-5-1': { input: 10, output: 50, cacheRead: 0.25, cacheWrite: 12.5 },
  'claude-fable-5': { input: 10, output: 50, cacheRead: 1, cacheWrite: 12.5 },
  'claude-opus-5-5': { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
  'claude-opus-5': { input: 5, output: 25, cacheRead: 0.5, cacheWrite: 6.25 },
  'claude-sonnet-5-5': { input: 2, output: 10, cacheRead: 0.1, cacheWrite: 2.5 },
}

const PREFIXES = Object.keys(PRICES).sort((a, b) => b.length - a.length)

/** Price for a model ref (`anthropic/claude-opus-5-5`) or bare id; null when unknown. */
const priceFor = (modelRef: string): ModelPrice | null => {
  const id = modelRef.includes('/') ? modelRef.slice(modelRef.indexOf('/') + 1) : modelRef
  const key = PREFIXES.find((p) => id.startsWith(p))
  return key ? PRICES[key] : null
}

/** Estimated USD for the given usage, or null when the model has no known price. */
const estimateCostUsd = (modelRef: string, u: SessionUsage): number | null => {
  const p = priceFor(modelRef)
  if (!p) return null
  return (
    (u.inputTokens * p.input +
      u.outputTokens * p.output +
      u.cacheReadTokens * p.cacheRead +
      u.cacheWriteTokens * p.cacheWrite) /
    1_000_000
  )
}

export { priceFor, estimateCostUsd }
export type { ModelPrice }

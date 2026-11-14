import type { ModelCaps, ProviderModel } from '../remote-llm.types'

const ANTHROPIC_BASE_URL = 'https://api.anthropic.com'
const REQUEST_TIMEOUT_MS = 300_000
const MAX_RETRIES = 3

const SERVER_FALLBACK_BETA = 'server-side-fallback-2026-07-01'

/** Output budget per step; raised to the model's maximum only after a tool call is cut off. */
const DEFAULT_MAX_TOKENS = 32_000

/** Anthropic's documented limits for strict tool definitions in one request. */
const STRICT_MAX_TOOLS = 20
const STRICT_MAX_OPTIONAL = 24
const STRICT_MAX_UNION = 16

const MAX_JSON_RETRIES = 2

const RECOMMENDED_MODEL_ID = 'claude-opus-5-5'
const PREFERRED_ORDER: readonly string[] = ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5']

const DEFAULT_CAPS: ModelCaps = { adaptiveThinking: true, effort: true, maxOutput: 64_000, contextSize: 200_000 }

const STATIC_MODELS: ProviderModel[] = [
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5', caps: DEFAULT_CAPS, created: 3 },
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5', caps: DEFAULT_CAPS, created: 2 },
  {
    id: 'claude-haiku-5-5',
    label: 'Claude Haiku 5.5',
    caps: { ...DEFAULT_CAPS, effort: false },
    created: 1,
  },
]

export {
  ANTHROPIC_BASE_URL,
  REQUEST_TIMEOUT_MS,
  MAX_RETRIES,
  SERVER_FALLBACK_BETA,
  DEFAULT_MAX_TOKENS,
  STRICT_MAX_TOOLS,
  STRICT_MAX_OPTIONAL,
  STRICT_MAX_UNION,
  MAX_JSON_RETRIES,
  RECOMMENDED_MODEL_ID,
  PREFERRED_ORDER,
  DEFAULT_CAPS,
  STATIC_MODELS,
}

import Anthropic from '@anthropic-ai/sdk'
import { ANTHROPIC_BASE_URL, MAX_RETRIES, REQUEST_TIMEOUT_MS } from './anthropic.constants'

let cached: { key: string; client: Anthropic } | null = null

// The key is always passed explicitly and the base URL is pinned, so neither the
// environment nor a proxy variable can redirect a key to another host. Logging is
// off: the SDK's debug logger would print request bodies.
const makeClient = (key: string): Anthropic =>
  new Anthropic({
    apiKey: key,
    baseURL: ANTHROPIC_BASE_URL,
    maxRetries: MAX_RETRIES,
    timeout: REQUEST_TIMEOUT_MS,
    logLevel: 'off',
  })

const getClient = (key: string): Anthropic => {
  if (cached?.key === key) return cached.client
  cached = { key, client: makeClient(key) }
  return cached.client
}

const forgetClient = (): void => {
  cached = null
}

export { getClient, makeClient, forgetClient }

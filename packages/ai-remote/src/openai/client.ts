import OpenAI from 'openai'
import { MAX_RETRIES, OPENAI_BASE_URL, REQUEST_TIMEOUT_MS } from './openai.constants'

let cached: { key: string; client: OpenAI } | null = null

// Explicit key and pinned base URL: the environment (OPENAI_API_KEY, OPENAI_BASE_URL)
// can never redirect or substitute the key. Logging is off.
const makeClient = (key: string): OpenAI =>
  new OpenAI({
    apiKey: key,
    baseURL: OPENAI_BASE_URL,
    maxRetries: MAX_RETRIES,
    timeout: REQUEST_TIMEOUT_MS,
    logLevel: 'off',
  })

const getClient = (key: string): OpenAI => {
  if (cached?.key === key) return cached.client
  cached = { key, client: makeClient(key) }
  return cached.client
}

const forgetClient = (): void => {
  cached = null
}

export { getClient, makeClient, forgetClient }

import type { ModelCaps } from '../remote-llm.types'

const OPENAI_BASE_URL = 'https://api.openai.com/v1'
const REQUEST_TIMEOUT_MS = 300_000
const MAX_RETRIES = 3

const MAX_OUTPUT_TOKENS = 32_000

const CHAT_MODEL_PATTERN = /^(gpt-|o\d)/
const EXCLUDED_MODEL_PATTERN =
  /audio|realtime|tts|transcribe|image|embedding|search|moderation|instruct|dall-e|whisper/

// OpenAI does not report a context size; reasoning is tried first and dropped per
// model if the API rejects it.
const OPENAI_CAPS: ModelCaps = { adaptiveThinking: false, effort: true, maxOutput: MAX_OUTPUT_TOKENS, contextSize: null }

export {
  OPENAI_BASE_URL,
  REQUEST_TIMEOUT_MS,
  MAX_RETRIES,
  MAX_OUTPUT_TOKENS,
  CHAT_MODEL_PATTERN,
  EXCLUDED_MODEL_PATTERN,
  OPENAI_CAPS,
}

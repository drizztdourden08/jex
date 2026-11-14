import { randomUUID } from 'node:crypto'
import type { LlmToolSpec, LlmTurnItem, LlmUsage } from '@jex/ai-contract'
import { buildSystemPrompt } from '../system-prompt'
import { buildToolSpecs } from './tool-specs'

interface RemoteSession {
  /** Stable per chat (the OpenAI prompt_cache_key). */
  conversationId: string
  modelRef: string
  /** Frozen at the first turn so the provider's prompt cache stays valid. */
  system: string
  /** Frozen at the first turn; live policy is re-checked when a tool runs. */
  tools: LlmToolSpec[]
  transcript: LlmTurnItem[]
  lastUsage: LlmUsage | null
  contextSize: number | null
}

let current: RemoteSession | null = null

/** The session for this model, created on first use. A different model starts a fresh
 *  conversation (provider-native items do not carry across models). */
const ensureRemoteSession = (modelRef: string): RemoteSession => {
  if (current && current.modelRef === modelRef) return current
  current = {
    conversationId: randomUUID(),
    modelRef,
    system: buildSystemPrompt(),
    tools: buildToolSpecs(),
    transcript: [],
    lastUsage: null,
    contextSize: null,
  }
  return current
}

const getRemoteSession = (): RemoteSession | null => current

const resetRemoteSession = (): void => {
  current = null
}

export { ensureRemoteSession, getRemoteSession, resetRemoteSession }
export type { RemoteSession }

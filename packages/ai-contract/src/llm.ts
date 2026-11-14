// The LLM port: how the agent loop talks to a remote model without ever seeing an
// SDK or an API key. The host implements HostLlm; step() never throws, it returns
// an LlmStepOutcome (the plugin and the host are separate bundles, so SDK error
// classes cannot cross the seam).

import type { RemoteKeyStatus, RemoteModelOption, RemoteProviderId } from '@jex/shared/remote-ai'

interface LlmToolSpec {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  sensitive: boolean
}

interface LlmToolCall {
  callId: string
  name: string
  input: unknown
  rawInput: string
  parseError: boolean
}

interface LlmToolResult {
  callId: string
  ok: boolean
  content: string
}

interface LlmAssistantItem {
  kind: 'assistant'
  provider: RemoteProviderId
  /** Provider output, unchanged: Anthropic BetaContentBlock[] | OpenAI ResponseOutputItem[]. */
  native: unknown
  text: string
  toolCalls: LlmToolCall[]
}

type LlmTurnItem =
  | { kind: 'user'; text: string }
  | LlmAssistantItem
  | { kind: 'tool-results'; results: LlmToolResult[] }

type LlmDelta = { kind: 'text' | 'thinking'; text: string }

type LlmStopReason = 'end' | 'tool_use' | 'max_tokens' | 'refusal' | 'pause'

interface LlmUsage {
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
}

interface LlmStep {
  stop: LlmStopReason
  assistant: LlmAssistantItem
  usage: LlmUsage
  contextSize: number | null
}

type LlmFailureKind = 'auth' | 'rate_limit' | 'overloaded' | 'bad_request' | 'network' | 'aborted' | 'unknown'

interface LlmFailure {
  kind: LlmFailureKind
  provider: RemoteProviderId
  /** Never contains a key. */
  message: string
  retryAfterSec?: number
}

type LlmStepOutcome = { ok: true; step: LlmStep } | { ok: false; failure: LlmFailure }

interface LlmStepRequest {
  modelRef: string
  /** Stable per chat; used as the OpenAI prompt_cache_key. */
  conversationId: string
  /** Byte-stable for the conversation. */
  system: string
  /** Byte-stable for the conversation. */
  tools: LlmToolSpec[]
  transcript: LlmTurnItem[]
}

interface HostLlm {
  providers: () => RemoteKeyStatus
  listModels: () => Promise<RemoteModelOption[]>
  step: (req: LlmStepRequest, onDelta: (d: LlmDelta) => void, signal: AbortSignal) => Promise<LlmStepOutcome>
}

export type {
  LlmToolSpec,
  LlmToolCall,
  LlmToolResult,
  LlmAssistantItem,
  LlmTurnItem,
  LlmDelta,
  LlmStopReason,
  LlmUsage,
  LlmStep,
  LlmFailureKind,
  LlmFailure,
  LlmStepOutcome,
  LlmStepRequest,
  HostLlm,
}

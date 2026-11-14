import type { BetaMessage, BetaToolUseBlock } from '@anthropic-ai/sdk/resources/beta/messages/messages'
import type { LlmAssistantItem, LlmStep, LlmStopReason, LlmToolCall, LlmUsage } from '@jex/ai-contract'
import type { ModelCaps } from '../remote-llm.types'

// stop_reason is read before any content is trusted.
const stopOf = (msg: BetaMessage): LlmStopReason => {
  switch (msg.stop_reason) {
    case 'tool_use':
      return 'tool_use'
    case 'refusal':
      return 'refusal'
    case 'pause_turn':
      return 'pause'
    case 'max_tokens':
    case 'model_context_window_exceeded':
      return 'max_tokens'
    default:
      return 'end'
  }
}

const toToolCall = (b: BetaToolUseBlock): LlmToolCall => ({
  callId: b.id,
  name: b.name,
  input: b.input,
  rawInput: JSON.stringify(b.input ?? {}),
  parseError: false,
})

const usageOf = (msg: BetaMessage): LlmUsage => ({
  inputTokens: msg.usage.input_tokens,
  outputTokens: msg.usage.output_tokens,
  cacheReadTokens: msg.usage.cache_read_input_tokens ?? 0,
  cacheWriteTokens: msg.usage.cache_creation_input_tokens ?? 0,
})

const hasToolUse = (msg: BetaMessage): boolean => msg.content.some((b) => b.type === 'tool_use')

const toStep = (msg: BetaMessage, caps: ModelCaps): LlmStep => {
  const stop = stopOf(msg)
  const text = msg.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('')
  const toolCalls = msg.content.flatMap((b) => (b.type === 'tool_use' ? [toToolCall(b)] : []))
  const assistant: LlmAssistantItem = {
    kind: 'assistant',
    provider: 'anthropic',
    native: msg.content, // unchanged, thinking blocks included
    text,
    toolCalls, // always listed so the engine can close calls it never runs
  }
  return { stop, assistant, usage: usageOf(msg), contextSize: caps.contextSize }
}

export { toStep, hasToolUse }

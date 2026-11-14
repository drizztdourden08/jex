import type { Response, ResponseFunctionToolCall, ResponseOutputItem } from 'openai/resources/responses/responses'
import type { LlmAssistantItem, LlmStep, LlmStopReason, LlmToolCall, LlmUsage } from '@jex/ai-contract'

const parseArgs = (raw: string): { input: unknown; parseError: boolean } => {
  try {
    return { input: JSON.parse(raw || '{}'), parseError: false }
  } catch {
    return { input: null, parseError: true }
  }
}

const toToolCall = (item: ResponseFunctionToolCall): LlmToolCall => ({
  callId: item.call_id,
  name: item.name,
  rawInput: item.arguments,
  ...parseArgs(item.arguments),
})

const toolCallsOf = (output: ResponseOutputItem[]): LlmToolCall[] =>
  output.flatMap((o) => (o.type === 'function_call' ? [toToolCall(o)] : []))

const textOf = (output: ResponseOutputItem[]): string =>
  output
    .flatMap((o) => (o.type === 'message' ? o.content : []))
    .flatMap((c) => (c.type === 'output_text' ? [c.text] : []))
    .join('')

const hasRefusal = (output: ResponseOutputItem[]): boolean =>
  output.some((o) => o.type === 'message' && o.content.some((c) => c.type === 'refusal'))

const stopOf = (res: Response, toolCalls: LlmToolCall[]): LlmStopReason => {
  if (toolCalls.length > 0) return 'tool_use'
  if (res.status === 'incomplete') {
    if (res.incomplete_details?.reason === 'max_output_tokens') return 'max_tokens'
    if (res.incomplete_details?.reason === 'content_filter') return 'refusal'
  }
  return hasRefusal(res.output) ? 'refusal' : 'end'
}

const usageOf = (res: Response): LlmUsage => ({
  inputTokens: res.usage?.input_tokens ?? 0,
  outputTokens: res.usage?.output_tokens ?? 0,
  cacheReadTokens: res.usage?.input_tokens_details?.cached_tokens ?? 0,
  cacheWriteTokens: 0,
})

const toStep = (res: Response): LlmStep => {
  const toolCalls = toolCallsOf(res.output)
  const assistant: LlmAssistantItem = {
    kind: 'assistant',
    provider: 'openai',
    native: res.output,
    text: textOf(res.output),
    toolCalls,
  }
  return { stop: stopOf(res, toolCalls), assistant, usage: usageOf(res), contextSize: null }
}

export { toStep }

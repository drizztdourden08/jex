import type { LlmToolCall, LlmToolResult, LlmTurnItem } from '@jex/ai-contract'
import { getTool } from '../../tools'
import { validate } from '../../tools/schema'
import type { ToolExecutor } from '../executor'

type ToolResultsItem = Extract<LlmTurnItem, { kind: 'tool-results' }>

const failed = (callId: string, payload: unknown): LlmToolResult => ({
  callId,
  ok: false,
  content: typeof payload === 'string' ? payload : JSON.stringify(payload),
})

const runOne = async (call: LlmToolCall, exec: ToolExecutor, signal: AbortSignal): Promise<LlmToolResult> => {
  const { callId, name } = call
  if (signal.aborted) return failed(callId, 'Cancelled by the user.')
  if (call.parseError) return failed(callId, { INVALID_JSON: call.rawInput })
  const tool = getTool(name)
  if (!tool) return failed(callId, { error: `Unknown tool: ${name}` })
  const checked = validate(tool.params as unknown as Record<string, unknown>, call.input)
  if (!checked.ok) return failed(callId, { INVALID_INPUT: checked.errors })
  const result = await exec.run({ callId, name, args: checked.value as Record<string, unknown> })
  return { callId, ok: result.ok, content: result.content }
}

/**
 * Validate and run the model's tool calls one at a time, in order. Always returns ONE
 * tool-results item with a result for every call, so the transcript stays well formed
 * even when the turn is cancelled part-way.
 */
const runToolCalls = async (
  calls: LlmToolCall[],
  exec: ToolExecutor,
  signal: AbortSignal,
): Promise<ToolResultsItem> => {
  const results: LlmToolResult[] = []
  for (const call of calls) results.push(await runOne(call, exec, signal))
  return { kind: 'tool-results', results }
}

export { runToolCalls }

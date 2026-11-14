import { effectivePolicy, getTool } from '../../tools'
import { gate } from '../permission'
import { RESULT_CHAR_LIMIT } from './executor.constants'
import type { ToolCallInput, ToolExecutor, ToolExecutorOptions, ToolRunResult } from './executor.types'
import { createGuards } from './guards'
import { runWithRetry } from './run-with-retry'

const toContent = (value: unknown): string => {
  let text: string
  try {
    text = JSON.stringify(value) ?? 'null'
  } catch {
    text = String(value)
  }
  return text.length > RESULT_CHAR_LIMIT ? `${text.slice(0, RESULT_CHAR_LIMIT)}… [result truncated]` : text
}

/**
 * The one place a tool call is guarded, gated, retried and reported. Both the local
 * (node-llama-cpp) and remote loops run tools through it, with different limits.
 * Emits tool-call / tool-result events and never throws.
 */
const createToolExecutor = (opts: ToolExecutorOptions): ToolExecutor => {
  const { turnId, emit, ctx, limits, signal } = opts
  const guards = createGuards(limits)
  let seq = 0

  const refuse = (callId: string, name: string, error: string, value: unknown): ToolRunResult => {
    emit({ turnId, type: 'tool-result', callId, name, ok: false, error })
    return { ok: false, value, content: error }
  }

  const run = async (call: ToolCallInput): Promise<ToolRunResult> => {
    const { name, args } = call
    const callId = call.callId ?? `${turnId}-${seq++}`
    emit({ turnId, type: 'tool-call', callId, name, args })
    const verdict = guards.check(name, args)
    if (verdict) {
      emit({ turnId, type: 'tool-result', callId, name, ok: false, error: verdict.error })
      return { ok: false, value: { stopped: true }, content: verdict.message, halt: verdict.message }
    }
    // Re-resolve from the registry: a confirm or a settings change may flip the policy.
    const live = getTool(name)
    if (!live) return refuse(callId, name, `Unknown tool: ${name}`, { error: `Unknown tool: ${name}` })
    if (signal?.aborted) return refuse(callId, name, 'Cancelled by the user.', { cancelled: true })
    if (effectivePolicy(live) === 'disabled') {
      const msg = 'This tool is disabled by the user.'
      return refuse(callId, name, msg, { disabled: true, message: msg })
    }
    const allowed = await gate(live, args, turnId, callId, emit)
    if (!allowed) {
      const msg = 'The user declined this action.'
      return refuse(callId, name, msg, { declined: true, message: msg })
    }
    const out = await runWithRetry(() => live.run(args, ctx), limits.attempts, signal)
    if (out.ok) {
      emit({ turnId, type: 'tool-result', callId, name, ok: true, result: out.value })
      return { ok: true, value: out.value, content: toContent(out.value) }
    }
    // Never throw: return the error so the model can recover or report it.
    return refuse(callId, name, out.error, { error: out.error })
  }

  return { run }
}

export { createToolExecutor }

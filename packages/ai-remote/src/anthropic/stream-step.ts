import { AnthropicError, APIError, BadRequestError } from '@anthropic-ai/sdk'
import type { BetaRawMessageStreamEvent } from '@anthropic-ai/sdk/resources/beta/messages/messages'
import type { LlmStepOutcome } from '@jex/ai-contract'
import type { ModelCaps, StepCtx } from '../remote-llm.types'
import { DEFAULT_MAX_TOKENS, MAX_JSON_RETRIES } from './anthropic.constants'
import { getClient } from './client'
import { toFailure } from './errors'
import { buildParams } from './request'
import { planStrict } from './strict-plan'
import { hasToolUse, toStep } from './to-step'
import { toBetaMessages } from './transcript'

const forwardDelta = (ctx: StepCtx, ev: BetaRawMessageStreamEvent): void => {
  if (ev.type !== 'content_block_delta') return
  if (ev.delta.type === 'text_delta') ctx.onDelta({ kind: 'text', text: ev.delta.text })
  else if (ev.delta.type === 'thinking_delta') ctx.onDelta({ kind: 'thinking', text: ev.delta.thinking })
}

// The SDK rejects a tool_use whose streamed JSON does not parse with a plain
// AnthropicError (not an APIError); that is retryable.
const isJsonParseError = (e: unknown): boolean =>
  e instanceof AnthropicError && !(e instanceof APIError) && /parse tool parameter JSON/i.test(e.message)

// Anthropic words this "schema too complex" or "compiled grammar is too large".
const isTooComplex = (e: unknown): boolean =>
  e instanceof BadRequestError && /too complex|too large|grammar|strict tools/i.test(e.message)

// Once a tool set is refused in strict mode, later steps of this run skip strict
// instead of paying for the same 400 again.
let strictRefused = false

// One model step. Never throws. Retries are bounded: a cut-off tool call raises the
// output budget once, bad tool JSON retries up to MAX_JSON_RETRIES, and a "too
// complex" schema error drops strict mode once.
const streamStep = async (ctx: StepCtx, caps: ModelCaps): Promise<LlmStepOutcome> => {
  const client = getClient(ctx.key)
  const messages = toBetaMessages(ctx.req.transcript)
  let strict: ReadonlySet<string> = strictRefused ? new Set() : planStrict(ctx.req.tools)
  let maxTokens = Math.min(caps.maxOutput, DEFAULT_MAX_TOKENS)
  let jsonRetries = 0
  for (;;) {
    try {
      const stream = client.beta.messages.stream(buildParams(ctx, caps, messages, maxTokens, strict), {
        signal: ctx.signal,
      })
      stream.on('streamEvent', (ev) => forwardDelta(ctx, ev))
      const msg = await stream.finalMessage()
      // stop_reason is checked before content: a cut-off tool call may be incomplete.
      if (msg.stop_reason === 'max_tokens' && hasToolUse(msg) && maxTokens < caps.maxOutput) {
        maxTokens = caps.maxOutput
        continue
      }
      return { ok: true, step: toStep(msg, caps) }
    } catch (e) {
      if (!ctx.signal.aborted && isJsonParseError(e) && jsonRetries < MAX_JSON_RETRIES) {
        jsonRetries += 1
        maxTokens = caps.maxOutput
        continue
      }
      if (!ctx.signal.aborted && strict.size > 0 && isTooComplex(e)) {
        strict = new Set()
        strictRefused = true
        continue
      }
      return { ok: false, failure: toFailure(e, ctx) }
    }
  }
}

export { streamStep }

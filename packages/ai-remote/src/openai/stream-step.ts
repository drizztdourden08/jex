import { BadRequestError } from 'openai'
import type { LlmStepOutcome } from '@jex/ai-contract'
import type { StepCtx } from '../remote-llm.types'
import { getClient } from './client'
import { toFailure } from './errors'
import { buildParams, isNoReasoning, markNoReasoning } from './request'
import { toStep } from './to-step'
import { toResponseInput } from './transcript'

const isReasoningRejection = (e: unknown): boolean =>
  e instanceof BadRequestError && /reasoning/i.test(`${e.param ?? ''} ${e.message}`)

// One model step. Never throws. A 400 that blames the reasoning block is retried
// once without it, and the model id is remembered.
const streamStep = async (ctx: StepCtx): Promise<LlmStepOutcome> => {
  const client = getClient(ctx.key)
  const input = toResponseInput(ctx.req.transcript)
  let noReasoning = isNoReasoning(ctx.modelId)
  for (;;) {
    try {
      const stream = client.responses.stream(buildParams(ctx, input, noReasoning), { signal: ctx.signal })
      stream.on('response.output_text.delta', (e) => ctx.onDelta({ kind: 'text', text: e.delta }))
      stream.on('response.reasoning_summary_text.delta', (e) => ctx.onDelta({ kind: 'thinking', text: e.delta }))
      const res = await stream.finalResponse()
      if (res.status === 'failed') {
        const message = res.error?.message ?? 'OpenAI could not complete the response.'
        return { ok: false, failure: { kind: 'unknown', provider: 'openai', message } }
      }
      return { ok: true, step: toStep(res) }
    } catch (e) {
      if (!ctx.signal.aborted && !noReasoning && isReasoningRejection(e)) {
        markNoReasoning(ctx.modelId)
        noReasoning = true
        continue
      }
      return { ok: false, failure: toFailure(e, ctx) }
    }
  }
}

export { streamStep }

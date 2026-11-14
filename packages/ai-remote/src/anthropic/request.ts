import type { BetaMessageParam, MessageCreateParamsBase } from '@anthropic-ai/sdk/resources/beta/messages/messages'
import type { ModelCaps, StepCtx } from '../remote-llm.types'
import { SERVER_FALLBACK_BETA } from './anthropic.constants'
import { toBetaTools } from './tools'

const supportsFallback = (modelId: string): boolean => !modelId.startsWith('claude-haiku-')

// Never sent: temperature / top_p / top_k, assistant prefill, thinking disabled or
// budget_tokens, tool_choice other than auto (a 400 on the 5.5 models).
const buildParams = (
  ctx: StepCtx,
  caps: ModelCaps,
  messages: BetaMessageParam[],
  maxTokens: number,
  strict: ReadonlySet<string>,
): MessageCreateParamsBase => ({
  model: ctx.modelId,
  max_tokens: maxTokens,
  system: [{ type: 'text', text: ctx.req.system, cache_control: { type: 'ephemeral' } }],
  tools: toBetaTools(ctx.req.tools, strict),
  tool_choice: { type: 'auto' },
  messages,
  ...(caps.adaptiveThinking ? { thinking: { type: 'adaptive' as const, display: 'summarized' as const } } : {}),
  ...(caps.effort ? { output_config: { effort: ctx.effort } } : {}),
  cache_control: { type: 'ephemeral' },
  betas: [SERVER_FALLBACK_BETA],
  ...(supportsFallback(ctx.modelId) ? { fallbacks: 'default' as const } : {}),
})

export { buildParams, supportsFallback }

import type { ResponseCreateParamsBase, ResponseInputItem } from 'openai/resources/responses/responses'
import type { StepCtx } from '../remote-llm.types'
import { MAX_OUTPUT_TOKENS } from './openai.constants'
import { toFunctionTools } from './tools'

// Models that rejected the reasoning block; remembered so the retry is paid once.
const noReasoningModels = new Set<string>()

const markNoReasoning = (modelId: string): void => {
  noReasoningModels.add(modelId)
}

const isNoReasoning = (modelId: string): boolean => noReasoningModels.has(modelId)

const forgetReasoning = (): void => noReasoningModels.clear()

// store:false keeps the conversation out of OpenAI's storage; the encrypted
// reasoning items travel with the transcript instead.
const buildParams = (
  ctx: StepCtx,
  input: ResponseInputItem[],
  noReasoning: boolean,
): Omit<ResponseCreateParamsBase, 'stream'> => ({
  model: ctx.modelId,
  instructions: ctx.req.system,
  input,
  tools: toFunctionTools(ctx.req.tools),
  tool_choice: 'auto',
  parallel_tool_calls: true,
  max_output_tokens: MAX_OUTPUT_TOKENS,
  store: false,
  prompt_cache_key: ctx.req.conversationId,
  ...(noReasoning
    ? {}
    : { reasoning: { effort: ctx.effort, summary: 'auto' as const }, include: ['reasoning.encrypted_content' as const] }),
})

export { buildParams, markNoReasoning, isNoReasoning, forgetReasoning }

import type {
  ResponseFunctionCallOutputItemList,
  ResponseInputItem,
} from 'openai/resources/responses/responses'
import type { LlmToolResult, LlmTurnItem } from '@jex/ai-contract'

// The Responses API takes text + input_image parts directly in a function_call_output.
const toOutput = (r: LlmToolResult): string | ResponseFunctionCallOutputItemList => {
  const text = r.ok ? r.content : JSON.stringify({ error: r.content })
  if (!r.images?.length) return text
  return [
    { type: 'input_text', text },
    ...r.images.map((img) => ({
      type: 'input_image' as const,
      image_url: `data:${img.mime};base64,${img.base64}`,
      detail: 'auto' as const,
    })),
  ]
}

const toResponseInput = (items: readonly LlmTurnItem[]): ResponseInputItem[] =>
  items.flatMap((item): ResponseInputItem[] => {
    if (item.kind === 'user') return [{ role: 'user', content: item.text }]
    if (item.kind === 'assistant') {
      // native is the Response output items exactly as returned (reasoning items
      // with encrypted content included); output items are valid input items.
      return item.native as ResponseInputItem[]
    }
    return item.results.map(
      (r): ResponseInputItem => ({
        type: 'function_call_output',
        call_id: r.callId,
        output: toOutput(r),
      }),
    )
  })

export { toResponseInput }

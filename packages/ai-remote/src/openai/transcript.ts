import type { ResponseInputItem } from 'openai/resources/responses/responses'
import type { LlmTurnItem } from '@jex/ai-contract'

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
        output: r.ok ? r.content : JSON.stringify({ error: r.content }),
      }),
    )
  })

export { toResponseInput }

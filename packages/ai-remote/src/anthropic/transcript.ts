import type {
  BetaContentBlockParam,
  BetaMessageParam,
  BetaToolResultBlockParam,
} from '@anthropic-ai/sdk/resources/beta/messages/messages'
import type { LlmToolResult, LlmTurnItem } from '@jex/ai-contract'

const toResultBlock = (r: LlmToolResult): BetaToolResultBlockParam => ({
  type: 'tool_result',
  tool_use_id: r.callId,
  content: r.content,
  is_error: !r.ok,
})

// Builds the message list. A user item right after tool results joins them in ONE
// user message (tool_result blocks first, then the text), as the API requires.
const toBetaMessages = (items: readonly LlmTurnItem[]): BetaMessageParam[] => {
  const out: BetaMessageParam[] = []
  let pendingResults: BetaToolResultBlockParam[] = []
  const flush = (): void => {
    if (pendingResults.length === 0) return
    out.push({ role: 'user', content: pendingResults })
    pendingResults = []
  }
  for (const item of items) {
    if (item.kind === 'tool-results') {
      pendingResults = item.results.map(toResultBlock)
    } else if (item.kind === 'user') {
      const text: BetaContentBlockParam = { type: 'text', text: item.text }
      out.push({ role: 'user', content: [...pendingResults, text] })
      pendingResults = []
    } else {
      flush()
      // native is the BetaMessage content exactly as the API returned it
      // (thinking blocks included); response blocks are valid request blocks.
      out.push({ role: 'assistant', content: item.native as BetaContentBlockParam[] })
    }
  }
  flush()
  return out
}

export { toBetaMessages }

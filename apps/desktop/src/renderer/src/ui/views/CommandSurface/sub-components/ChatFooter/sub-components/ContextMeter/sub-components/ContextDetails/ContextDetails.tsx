import { estimateCostUsd } from '@shared/remote-ai'
import { Box } from '@ds/primitives/layout/Box'
import { fmtCost, fmtCount } from '../../../../ChatFooter.constants'
import type { ContextDetailsProps } from './ContextDetails.type'

// The numbers behind the ring. Remote chats add per-chat token totals and an estimated
// cost (shown only for models with a known price; older engines send no usage).
const ContextDetails = ({ ctx }: ContextDetailsProps) => {
  if (!ctx) return <Box className="chat-ctx-empty">No context data yet.</Box>
  const { usedTokens, contextSize, usage, modelId } = ctx
  const cost = usage ? estimateCostUsd(modelId, usage) : null
  const context =
    contextSize > 0
      ? `${fmtCount(usedTokens)} / ${fmtCount(contextSize)} tokens (${Math.round((usedTokens / contextSize) * 100)}%)`
      : `${fmtCount(usedTokens)} tokens`
  const rows: Array<[string, string]> = [['Context', context]]
  if (usage) {
    rows.push(
      ['Input tokens', fmtCount(usage.inputTokens)],
      ['Output tokens', fmtCount(usage.outputTokens)],
      ['Cache read tokens', fmtCount(usage.cacheReadTokens)],
      ['Cache write tokens', fmtCount(usage.cacheWriteTokens)],
    )
  }
  if (cost != null) rows.push(['Estimated cost (this chat)', fmtCost(cost)])
  return (
    <Box className="chat-ctx-details">
      {rows.map(([k, v]) => (
        <Box key={k} className="chat-ctx-row">
          <Box as="span" className="chat-ctx-key">{k}</Box>
          <Box as="span" className="chat-ctx-val">{v}</Box>
        </Box>
      ))}
    </Box>
  )
}

export { ContextDetails }

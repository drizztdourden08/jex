import type { ChatMessage } from '@shared/agent'
import { fmtArgs } from './formatToolArgs'

/**
 * Serialize a chat transcript to plain text for the "copy conversation" button.
 * Includes each turn's answer text, the model's reasoning, and the tool calls it made
 * (with their outcome) — the full thought process, so it's useful for diagnosing and
 * improving the assistant. Pure.
 */
const transcriptText = (messages: ChatMessage[]): string =>
  messages
    .map((m) => {
      if (m.role === 'user') return `You: ${m.content.trim()}`
      const lines = ['Assistant:']
      const parts = m.parts ?? [{ kind: 'text' as const, text: m.content }]
      for (const p of parts) {
        if (p.kind === 'text' && p.text.trim()) lines.push(p.text.trim())
        else if (p.kind === 'thinking' && p.text.trim()) {
          lines.push(`  [reasoning] ${p.text.trim().replace(/\n/g, '\n  ')}`)
        } else if (p.kind === 'tool') {
          const args = fmtArgs(p.args)
          const outcome =
            p.status === 'error' ? ` → error: ${p.error ?? 'failed'}` : p.status === 'done' ? ' → ok' : ' → …'
          lines.push(`  ↳ ${p.name}${args ? `(${args})` : ''}${outcome}`)
        }
      }
      return lines.join('\n')
    })
    .join('\n\n')

export { transcriptText }

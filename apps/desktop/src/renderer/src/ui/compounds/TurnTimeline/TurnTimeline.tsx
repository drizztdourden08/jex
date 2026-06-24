import { useEffect, useRef } from 'react'
import type { TurnPart } from '@shared/agent'
import { Box } from '@ds/primitives/layout/Box'
import { fmtArgs } from '@/lib/chat/formatToolArgs'

/**
 * Renders an assistant turn as a linear timeline: reasoning, answer text, and tool
 * calls in the exact order they streamed. The active (last) thinking part of a live
 * turn auto-scrolls and stays open; earlier reasoning collapses into a toggle so
 * scrollback stays tidy. One render path serves both the live turn and committed
 * messages. Bare and presentational.
 */
const ThinkingPart = ({ text, live }: { text: string; live: boolean }) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (live && ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [text, live])
  if (!text.trim()) return null
  if (live) {
    return (
      <Box className="thinking-stream" ref={ref}>
        <Box className="thinking-stream-label">💭 thinking…</Box>
        {text.trimStart()}
      </Box>
    )
  }
  return (
    <Box as="details" className="thinking-details">
      <Box as="summary">💭 Reasoning</Box>
      <Box className="thinking-body">{text.trim()}</Box>
    </Box>
  )
}

const ToolPart = ({ part }: { part: Extract<TurnPart, { kind: 'tool' }> }) => {
  const args = fmtArgs(part.args)
  const icon = part.status === 'running' ? '●' : part.status === 'done' ? '✓' : '✕'
  return (
    <Box className="tool-chips">
      <Box as="span" className={`tool-chip ${part.status}`} title={part.error ?? ''}>
        <Box as="span" className="tool-chip-ic">{icon}</Box>
        <Box as="code">{part.name}</Box>
        {args && <Box as="span" className="tool-chip-args">{args}</Box>}
      </Box>
    </Box>
  )
}

const TurnTimeline = ({ parts, live }: TurnTimelineProps) => {
  const lastThinkingIdx = parts.reduce((acc, p, i) => (p.kind === 'thinking' ? i : acc), -1)
  return (
    <>
      {parts.map((part, i) => {
        if (part.kind === 'tool') return <ToolPart key={part.callId} part={part} />
        if (part.kind === 'thinking') {
          return <ThinkingPart key={`t${i}`} text={part.text} live={live && i === lastThinkingIdx} />
        }
        return part.text.trim() ? (
          <Box key={`x${i}`} className="chat-text">
            {part.text.trimStart()}
          </Box>
        ) : null
      })}
    </>
  )
}

interface TurnTimelineProps {
  parts: TurnPart[]
  /** True for the in-progress turn (enables live thinking auto-scroll). */
  live: boolean
}

export { TurnTimeline }
export type { TurnTimelineProps }

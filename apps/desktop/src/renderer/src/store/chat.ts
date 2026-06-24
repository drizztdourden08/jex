import { create } from 'zustand'
import type { ChatMessage, ConfirmDecision, TurnPart } from '@shared/agent'

interface PendingConfirm {
  callId: string
  name: string
  summary: string
}

/** The turn currently being generated — an ordered timeline of reasoning, text,
 *  and tool calls as they stream, plus any pending confirmation. */
interface ActiveTurn {
  id: string
  startedAt: number
  parts: TurnPart[]
  confirm: PendingConfirm | null
}

interface ChatState {
  messages: ChatMessage[]
  turn: ActiveTurn | null
  busy: boolean
  send: (message: string) => Promise<void>
  decide: (callId: string, decision: ConfirmDecision) => Promise<void>
  cancel: () => Promise<void>
  newChat: () => Promise<void>
}

let streamSubscribed = false
let turnSeq = 0

/** Append streaming text to the last part if it's the same kind, else start a new
 *  part — this is what interleaves reasoning/answer text with tool calls in order. */
const appendStreaming = (parts: TurnPart[], kind: 'text' | 'thinking', text: string): TurnPart[] => {
  const last = parts[parts.length - 1]
  if (last && last.kind === kind) {
    return [...parts.slice(0, -1), { kind, text: last.text + text }]
  }
  return [...parts, { kind, text }]
}

/** Commit a finished turn's parts as an assistant message (skips an empty turn). */
const commit = (messages: ChatMessage[], parts: TurnPart[], startedAt: number): ChatMessage[] => {
  const meaningful = parts.some((p) => p.kind === 'tool' || p.text.trim() !== '')
  if (!meaningful) return messages
  const content = parts
    .filter((p): p is Extract<TurnPart, { kind: 'text' }> => p.kind === 'text')
    .map((p) => p.text)
    .join('')
    .trim()
  return [...messages, { role: 'assistant', content, parts, durationMs: Date.now() - startedAt }]
}

const useChat = create<ChatState>((set, get) => {
  // One global subscription routes agent stream events into the active turn.
  const ensureStreamSub = (): void => {
    if (streamSubscribed) return
    streamSubscribed = true
    window.api.ai.onStream((ev) => {
      const turn = get().turn
      if (!turn || ev.turnId !== turn.id) return
      switch (ev.type) {
        case 'token':
          set({ turn: { ...turn, parts: appendStreaming(turn.parts, 'text', ev.text) } })
          break
        case 'thinking':
          set({ turn: { ...turn, parts: appendStreaming(turn.parts, 'thinking', ev.text) } })
          break
        case 'tool-call':
          set({
            turn: {
              ...turn,
              parts: [
                ...turn.parts,
                { kind: 'tool', callId: ev.callId, name: ev.name, args: ev.args, status: 'running' },
              ],
            },
          })
          break
        case 'tool-result':
          set({
            turn: {
              ...turn,
              parts: turn.parts.map((p) =>
                p.kind === 'tool' && p.callId === ev.callId
                  ? { ...p, status: ev.ok ? 'done' : 'error', error: ev.error }
                  : p,
              ),
            },
          })
          break
        case 'confirm':
          set({
            turn: { ...turn, confirm: { callId: ev.callId, name: ev.name, summary: ev.summary } },
          })
          break
        case 'done': {
          // Tokens already streamed the answer into text parts; only fall back to
          // ev.text if nothing streamed (some models emit only a final text).
          const hasText = turn.parts.some((p) => p.kind === 'text' && p.text.trim() !== '')
          const parts =
            !hasText && ev.text ? appendStreaming(turn.parts, 'text', ev.text) : turn.parts
          set((s) => ({
            messages: commit(s.messages, parts, turn.startedAt),
            turn: null,
            busy: false,
          }))
          break
        }
        case 'error': {
          const parts = appendStreaming(turn.parts, 'text', `⚠️ ${ev.error}`)
          set((s) => ({
            messages: commit(s.messages, parts, turn.startedAt),
            turn: null,
            busy: false,
          }))
          break
        }
      }
    })
  }

  return {
    messages: [],
    turn: null,
    busy: false,

    async send(message) {
      const text = message.trim()
      if (!text || get().busy) return
      ensureStreamSub()
      const id = `turn-${Date.now()}-${turnSeq++}`
      set((s) => ({
        messages: [...s.messages, { role: 'user', content: text }],
        turn: { id, startedAt: Date.now(), parts: [], confirm: null },
        busy: true,
      }))
      try {
        await window.api.ai.chatTurn(id, text)
      } catch {
        // The agent emits an 'error' stream event before throwing; if we somehow
        // get here without one, clear the stuck turn.
        if (get().turn?.id === id) set({ turn: null, busy: false })
      }
    },

    async decide(callId, decision) {
      await window.api.ai.confirm(callId, decision)
      const turn = get().turn
      if (turn?.confirm?.callId === callId) set({ turn: { ...turn, confirm: null } })
    },

    async cancel() {
      // Aborts the in-flight turn; the agent emits a 'done' event that commits the
      // partial answer and clears busy. Keeps the conversation (unlike newChat).
      if (!get().busy) return
      await window.api.ai.cancel()
    },

    async newChat() {
      await window.api.ai.resetChat()
      set({ messages: [], turn: null, busy: false })
    },
  }
})

export { useChat }
export type { PendingConfirm }

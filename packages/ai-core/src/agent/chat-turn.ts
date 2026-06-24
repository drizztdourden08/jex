import type { BrowserWindow } from 'electron'
import type { AiStreamEvent } from '@jex/shared/agent'
import { type ToolContext, registerAllTools } from '../tools'
import { ensureSession, trimHistory, resetChat, setAbort } from './session'
import { buildFunctions } from './tool-functions'
import { getUiDispatcher } from './ui-dispatcher'

/**
 * Run one user turn. Streams tokens/tool events via `emit` and resolves with the
 * final assistant text. Throws only on a hard model/load failure.
 */
const chatTurn = async (
  turnId: string,
  message: string,
  window: BrowserWindow | null,
  emit: (e: AiStreamEvent) => void,
): Promise<string> => {
  registerAllTools()
  const ctx: ToolContext = {
    window,
    ui: async (action, payload) => {
      const uiDispatch = getUiDispatcher()
      if (!uiDispatch) throw new Error('UI is not available right now.')
      return uiDispatch(action, payload)
    },
  }

  // Hard cap on a single turn so it can NEVER hang forever (a weak model can spin
  // without ever finishing). On timeout we abort, clear the stuck session, and
  // report — we do NOT retry a hang (it would just hang again).
  const MAX_TURN_MS = Number(process.env.AI_TURN_TIMEOUT_MS) || 120_000
  const MAX_ATTEMPTS = 3
  let lastErr: unknown
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let timedOut = false
    // Set when a loop guard ends the turn gracefully (so the abort is treated as a
    // clean finish with this message, not an error or empty cancel).
    let endedMessage: string | null = null
    // Local controller so resetChat() (called inside ensureSession on the first
    // turn / a model switch, which nulls the shared _abort) can't disarm the
    // watchdog. The watchdog covers the WHOLE turn — session build + generation —
    // so the turn can never hang regardless of WHERE it stalls.
    const abort = new AbortController()
    const watchdog = setTimeout(() => {
      timedOut = true
      abort.abort()
    }, MAX_TURN_MS)
    // End the turn gracefully with a message (loop guard, or the spiral guard below).
    const endTurn = (msg: string): void => {
      endedMessage = msg
      abort.abort()
    }
    // Reasoning-spiral guard: a weak model can loop in PURE reasoning (no tool calls,
    // no answer), which the tool loop-guards never see. Count "thought" chars since the
    // last sign of progress (a tool call or an answer token); if it blows past the
    // budget without producing either, stop gracefully instead of grinding to the
    // watchdog. resets to 0 on real progress so legit multi-step reasoning is fine.
    const MAX_THINK_CHARS = 9000
    let thinkChars = 0
    const onProgress = (): void => {
      thinkChars = 0
    }
    try {
      const session = await ensureSession()
      trimHistory(session)
      const functions = await buildFunctions(turnId, ctx, (e) => {
        if (e.type === 'tool-call') onProgress()
        emit(e)
      }, endTurn)
      setAbort(abort)
      // stopOnAbortSignal: an abort (loop guard / watchdog / user cancel) STOPS the
      // generation gracefully and RESOLVES instead of throwing — so the user message and
      // partial reply stay in the session history and the next turn still remembers them.
      // Without it, the abort throws and node-llama-cpp rolls the whole turn out of
      // history, which is what wiped the conversation after a timeout.
      const text = await session.prompt(message, {
        functions: functions as never,
        signal: abort.signal,
        stopOnAbortSignal: true,
        // onResponseChunk splits the stream into the main answer and "thought"
        // segments (reasoning models). Non-reasoning models only emit main text.
        onResponseChunk: (chunk: { type?: string; segmentType?: string; text: string }) => {
          if (!chunk.text) return
          if (chunk.type === 'segment') {
            thinkChars += chunk.text.length
            emit({ turnId, type: 'thinking', text: chunk.text })
            if (thinkChars > MAX_THINK_CHARS && endedMessage == null) {
              endTurn(
                "I got stuck over-thinking that and stopped. Let me try a cleaner path — could you rephrase, or ask me directly (e.g. for your taste I can use taste_profile)?",
              )
            }
          } else {
            onProgress() // an answer token = real progress
            emit({ turnId, type: 'token', text: chunk.text })
          }
        },
      })
      // A loop guard ended the turn: clean finish with its message (history kept).
      if (endedMessage != null) {
        emit({ turnId, type: 'done', text: endedMessage })
        return endedMessage
      }
      // Watchdog fired: report, but KEEP the session so the conversation survives.
      if (timedOut) {
        const secs = Math.round(MAX_TURN_MS / 1000)
        emit({
          turnId,
          type: 'error',
          error: `The assistant didn't finish in ${secs}s — try a simpler request, or switch to a faster model.`,
        })
        return ''
      }
      // A user-initiated abort (new chat / model switch) isn't an error.
      if (abort.signal.aborted) {
        emit({ turnId, type: 'done', text: '' })
        return ''
      }
      emit({ turnId, type: 'done', text })
      return text
    } catch (e) {
      lastErr = e
      // Only a HARD model/context failure reaches here now (aborts resolve cleanly).
      // Drop the possibly-corrupt session and retry with a fresh one.
      if (attempt < MAX_ATTEMPTS) {
        await resetChat().catch(() => {})
        await new Promise((r) => setTimeout(r, 400 * attempt))
      }
    } finally {
      clearTimeout(watchdog)
      setAbort(null)
    }
  }

  const error = lastErr instanceof Error ? lastErr.message : String(lastErr)
  emit({ turnId, type: 'error', error })
  throw lastErr
}

export { chatTurn }

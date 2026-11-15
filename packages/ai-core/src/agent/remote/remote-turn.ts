import type { BrowserWindow } from 'electron'
import type { AiStreamEvent } from '@jex/shared/agent'
import type { LlmStepOutcome } from '@jex/ai-contract'
import { host } from '../../host'
import { registerAllTools } from '../../tools'
import { activeModelRef } from '../../model/catalog'
import { createToolExecutor, REMOTE_LIMITS } from '../executor'
import { setAbort } from '../session'
import { buildToolContext } from '../tool-context'
import { failureMessage } from './failure-message'
import { MAX_PAUSES, MAX_STEPS } from './remote.constants'
import { ensureRemoteSession } from './remote-session'
import { runToolCalls } from './run-tool-calls'
import { closeDanglingCalls, rollbackTo } from './transcript-guards'

/**
 * Run one user turn on a remote model. Each loop pass is one model call through
 * host().llm.step; tool calls run through the shared executor and their results go
 * back as one tool-results item, until the model answers. Invariants: every assistant
 * item with tool calls is followed by exactly one tool-results item covering every
 * callId; a failure before any assistant step removes the user item. No history
 * trimming and no turn watchdog (a confirm can wait minutes; the host times out each request).
 */
const runRemoteTurn = async (
  turnId: string,
  message: string,
  window: BrowserWindow | null,
  emit: (e: AiStreamEvent) => void,
): Promise<string> => {
  registerAllTools()
  const s = ensureRemoteSession(activeModelRef())
  const abort = new AbortController()
  setAbort(abort)
  const mark = s.transcript.length
  s.transcript.push({ kind: 'user', text: message })
  const exec = createToolExecutor({
    turnId,
    emit,
    ctx: buildToolContext(window, true),
    limits: REMOTE_LIMITS,
    signal: abort.signal,
  })
  let text = ''
  let answered = false
  let pauses = 0
  const done = (): string => {
    emit({ turnId, type: 'done', text })
    return text
  }
  const fail = (error: string): string => {
    emit({ turnId, type: 'error', error })
    return ''
  }
  try {
    for (let i = 0; i < MAX_STEPS; i += 1) {
      let out: LlmStepOutcome
      try {
        out = await host().llm.step(
          { modelRef: s.modelRef, conversationId: s.conversationId, system: s.system, tools: s.tools, transcript: s.transcript },
          (d) => {
            if (d.kind === 'text') text += d.text
            emit({ turnId, type: d.kind === 'text' ? 'token' : 'thinking', text: d.text })
          },
          abort.signal,
        )
      } catch (e) {
        out = {
          ok: false,
          failure: { kind: 'unknown', provider: 'anthropic', message: e instanceof Error ? e.message : String(e) },
        }
      }
      if (!out.ok) {
        if (!answered) rollbackTo(s, mark)
        else closeDanglingCalls(s, 'Turn ended before this tool ran.')
        return out.failure.kind === 'aborted' ? done() : fail(failureMessage(out.failure))
      }
      answered = true
      const { step } = out
      s.transcript.push(step.assistant)
      s.lastUsage = step.usage
      s.totalUsage = {
        inputTokens: s.totalUsage.inputTokens + step.usage.inputTokens,
        outputTokens: s.totalUsage.outputTokens + step.usage.outputTokens,
        cacheReadTokens: s.totalUsage.cacheReadTokens + step.usage.cacheReadTokens,
        cacheWriteTokens: s.totalUsage.cacheWriteTokens + step.usage.cacheWriteTokens,
      }
      s.contextSize = step.contextSize
      if (step.stop === 'pause') {
        pauses += 1
        if (pauses > MAX_PAUSES) return fail('Stopped: the model kept pausing the turn.')
        continue
      }
      pauses = 0
      const calls = step.assistant.toolCalls
      if (step.stop === 'refusal') {
        closeDanglingCalls(s, 'Not run: the model declined this turn.')
        return done()
      }
      if (step.stop !== 'tool_use' || calls.length === 0) {
        closeDanglingCalls(s, 'Not run: the response ended before this tool could run.')
        return done()
      }
      s.transcript.push(await runToolCalls(calls, exec, abort.signal))
      if (abort.signal.aborted) return done()
    }
    return fail('Stopped: too many steps in one turn.')
  } finally {
    setAbort(null)
  }
}

export { runRemoteTurn }

import type { AiStreamEvent } from '@jex/shared/agent'
import { enabledTools, getTool, type ToolContext } from '../tools'
import { gate } from './permission'

/** node-llama-cpp function definitions for the currently-enabled tools. */
const buildFunctions = async (
  turnId: string,
  ctx: ToolContext,
  emit: (e: AiStreamEvent) => void,
  endTurn: (message: string) => void,
): Promise<Record<string, unknown>> => {
  const { defineChatSessionFunction } = await import('node-llama-cpp')
  const fns: Record<string, unknown> = {}
  let seq = 0
  // Per-turn loop guards. A weak model can spin: re-calling the SAME tool with the
  // SAME args without ever changing it (and ignoring any corrective tool result —
  // it doesn't read them). A returned message can't stop such a model, so once a
  // tight loop is detected we END THE TURN with a graceful message. A total cap is
  // the backstop for slower spins across different calls.
  const callCounts = new Map<string, number>()
  const toolCounts = new Map<string, number>()
  let totalCalls = 0
  const MAX_REPEATS = 3 // same tool + SAME args
  const MAX_PER_TOOL = 5 // same tool, ANY args (catches re-rolling / re-searching with varied args)
  const MAX_TOTAL_CALLS = 24 // backstop across different tools
  const sigOf = (name: string, args: Record<string, unknown>): string => {
    try {
      return `${name}:${JSON.stringify(args)}`
    } catch {
      return name
    }
  }
  for (const tool of enabledTools()) {
    // Our JsonSchema is a structural subset of GbnfJsonSchema; cast the whole
    // definition so node-llama-cpp's const-param inference doesn't fight us.
    const def = {
      description: tool.description,
      params: tool.params,
      async handler(args: Record<string, unknown>) {
        const callId = `${turnId}-${seq++}`
        emit({ turnId, type: 'tool-call', callId, name: tool.name, args })
        // Loop guard 1 — same tool + same args repeated: the result won't change and
        // a weak model won't heed a corrective, so END the turn (abort generation)
        // with a graceful, helpful message instead of spinning to the cap.
        const sig = sigOf(tool.name, args)
        const repeats = (callCounts.get(sig) ?? 0) + 1
        callCounts.set(sig, repeats)
        if (repeats >= MAX_REPEATS) {
          emit({ turnId, type: 'tool-result', callId, name: tool.name, ok: false, error: 'stopped — repeated identical call' })
          endTurn(
            "I kept repeating the same step without making progress, so I stopped. What you're after may be on a different page or need a different approach — could you rephrase, or tell me more specifically what you're looking for?",
          )
          return { stopped: true }
        }
        // Loop guard 2 — the SAME tool over and over with varied args (the common
        // thrash: re-rolling the randomizer or re-searching the store for a "better"
        // hit). The identical-args guard above misses this, so cap per tool name.
        const used = (toolCounts.get(tool.name) ?? 0) + 1
        toolCounts.set(tool.name, used)
        if (used > MAX_PER_TOOL) {
          emit({ turnId, type: 'tool-result', callId, name: tool.name, ok: false, error: 'stopped — same tool used too many times' })
          endTurn(
            `I kept using "${tool.name}" without getting closer to an answer, so I stopped. Repeating it won't surface a better result — could you rephrase, or tell me more specifically what you're looking for?`,
          )
          return { stopped: true }
        }
        // Loop guard 3 — too many tool calls overall (slower spin across varied
        // calls): stop and let the user know rather than burn the whole turn.
        if (++totalCalls > MAX_TOTAL_CALLS) {
          emit({ turnId, type: 'tool-result', callId, name: tool.name, ok: false, error: 'stopped — tool-call limit reached' })
          endTurn(
            "I made a lot of attempts without completing that — I've stopped so it doesn't hang. Could you rephrase or break it into a smaller step?",
          )
          return { stopped: true }
        }
        // Re-resolve the tool from the registry: a confirm may flip its policy.
        const live = getTool(tool.name) ?? tool
        const allowed = await gate(live, args, turnId, callId, emit)
        if (!allowed) {
          const msg = 'The user declined this action.'
          emit({ turnId, type: 'tool-result', callId, name: tool.name, ok: false, error: msg })
          return { declined: true, message: msg }
        }
        // Retry the tool up to 3 times for transient failures (e.g. a UI-bridge
        // timeout). Tools that *return* an error object aren't retried — only thrown ones.
        let lastErr: unknown
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const result = await live.run(args, ctx)
            emit({ turnId, type: 'tool-result', callId, name: tool.name, ok: true, result })
            return result
          } catch (e) {
            lastErr = e
            if (attempt < 3) await new Promise((r) => setTimeout(r, 300 * attempt))
          }
        }
        // Never throw out of a handler — that aborts generation. Return the error
        // so the model can recover or report it.
        const error = lastErr instanceof Error ? lastErr.message : String(lastErr)
        emit({ turnId, type: 'tool-result', callId, name: tool.name, ok: false, error })
        return { error }
      },
    }
    fns[tool.name] = defineChatSessionFunction(def as never)
  }
  return fns
}

export { buildFunctions }

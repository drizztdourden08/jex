import { getTool } from '../../tools'
import type { GuardVerdict, ToolExecLimits } from './executor.types'

const sigOf = (name: string, args: Record<string, unknown>): string => {
  try {
    return `${name}:${JSON.stringify(args)}`
  } catch {
    return name
  }
}

/**
 * Per-turn loop guards. A weak model can spin: re-calling the SAME tool with the
 * SAME args, re-rolling with varied args, or burning calls across tools. Each check
 * returns a verdict that ends the turn gracefully, or null to let the call run.
 */
const createGuards = (limits: ToolExecLimits) => {
  const callCounts = new Map<string, number>()
  const toolCounts = new Map<string, number>()
  let totalCalls = 0

  const check = (name: string, args: Record<string, unknown>): GuardVerdict | null => {
    const sig = sigOf(name, args)
    const repeats = (callCounts.get(sig) ?? 0) + 1
    callCounts.set(sig, repeats)
    if (repeats >= limits.maxRepeats) {
      return {
        error: 'stopped — repeated identical call',
        message:
          "I kept repeating the same step without making progress, so I stopped. What you're after may be on a different page or need a different approach — could you rephrase, or tell me more specifically what you're looking for?",
      }
    }
    const used = (toolCounts.get(name) ?? 0) + 1
    toolCounts.set(name, used)
    const cap = getTool(name)?.category === 'store' ? limits.maxPerStoreTool : limits.maxPerTool
    if (used > cap) {
      return {
        error: 'stopped — same tool used too many times',
        message: `I kept using "${name}" without getting closer to an answer, so I stopped. Repeating it won't surface a better result — could you rephrase, or tell me more specifically what you're looking for?`,
      }
    }
    if (++totalCalls > limits.maxTotal) {
      return {
        error: 'stopped — tool-call limit reached',
        message:
          "I made a lot of attempts without completing that — I've stopped so it doesn't hang. Could you rephrase or break it into a smaller step?",
      }
    }
    return null
  }

  return { check }
}

export { createGuards }

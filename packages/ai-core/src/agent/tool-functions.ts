import type { AiStreamEvent } from '@jex/shared/agent'
import { enabledTools, type ToolContext } from '../tools'
import { createToolExecutor, LOCAL_LIMITS } from './executor'
import { requireLocalRuntime } from '../model/runtime'

/** node-llama-cpp function definitions for the currently-enabled tools. A thin
 *  adapter: guards, gate and retry live in the shared executor. */
const buildFunctions = async (
  turnId: string,
  ctx: ToolContext,
  emit: (e: AiStreamEvent) => void,
  endTurn: (message: string) => void,
): Promise<Record<string, unknown>> => {
  await requireLocalRuntime()
  const { defineChatSessionFunction } = await import('node-llama-cpp')
  const exec = createToolExecutor({ turnId, emit, ctx, limits: LOCAL_LIMITS })
  const fns: Record<string, unknown> = {}
  for (const tool of enabledTools()) {
    // Our JsonSchema is a structural subset of GbnfJsonSchema; cast the whole
    // definition so node-llama-cpp's const-param inference doesn't fight us.
    const def = {
      description: tool.description,
      params: tool.params,
      async handler(args: Record<string, unknown>) {
        const result = await exec.run({ name: tool.name, args })
        // A loop guard tripped: END the turn (abort generation) with its message.
        if (result.halt) endTurn(result.halt)
        return result.value
      },
    }
    fns[tool.name] = defineChatSessionFunction(def as never)
  }
  return fns
}

export { buildFunctions }

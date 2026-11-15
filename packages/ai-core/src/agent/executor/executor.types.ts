import type { AiStreamEvent } from '@jex/shared/agent'
import type { LlmImagePart } from '@jex/ai-contract'
import type { ToolContext } from '../../tools'

interface ToolExecLimits {
  /** Same tool + same args: the call that reaches this count is refused. */
  maxRepeats: number
  /** Same tool, any args: calls beyond this count are refused. */
  maxPerTool: number
  /** Same cap for store-browsing tools (category "store"): browsing needs many small calls. */
  maxPerStoreTool: number
  /** All tools: calls beyond this count are refused. */
  maxTotal: number
  /** Tries for a tool that throws. */
  attempts: number
}

interface ToolCallInput {
  /** Provider call id (remote). Omitted locally: the executor numbers calls per turn. */
  callId?: string
  name: string
  args: Record<string, unknown>
}

interface ToolRunResult {
  ok: boolean
  /** What the local path hands back to node-llama-cpp. */
  value: unknown
  /** The same outcome as text, for a remote tool-result. */
  content: string
  /** Images the tool returned for the model (remote only; never sent to the UI). */
  images?: LlmImagePart[]
  /** Set when a loop guard tripped: a message that should end the turn. */
  halt?: string
}

interface ToolExecutorOptions {
  turnId: string
  emit: (e: AiStreamEvent) => void
  ctx: ToolContext
  limits: ToolExecLimits
  signal?: AbortSignal
}

interface ToolExecutor {
  run: (call: ToolCallInput) => Promise<ToolRunResult>
}

interface GuardVerdict {
  /** Short reason shown on the tool-result event. */
  error: string
  /** The graceful message that ends the turn. */
  message: string
}

export type { ToolExecLimits, ToolCallInput, ToolRunResult, ToolExecutorOptions, ToolExecutor, GuardVerdict }

/**
 * Types for the conversational AI agent — shared by main (the agent loop + tool
 * registry) and renderer (the chat UI + the AI-tools settings panel).
 */

/** A tool the agent invoked during a turn, kept in the transcript. */
interface ToolCallRecord {
  callId: string
  name: string
  args?: unknown
  status: 'running' | 'done' | 'error'
  error?: string
}

/**
 * One ordered segment of an assistant turn. The agent streams reasoning, answer
 * text, and tool calls intermixed; capturing them as an ordered list lets the UI
 * render the turn as a linear timeline (think → write → call a tool → keep going
 * under it) instead of grouping all thinking/tools/text separately.
 */
type TurnPart =
  | { kind: 'thinking'; text: string }
  | { kind: 'text'; text: string }
  | {
      kind: 'tool'
      callId: string
      name: string
      args?: unknown
      status: 'running' | 'done' | 'error'
      error?: string
    }

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  /** Ordered timeline of the turn (reasoning, text, tool calls), for linear render. */
  parts?: TurnPart[]
  /** Tools invoked while producing an assistant message (shown inline). */
  tools?: ToolCallRecord[]
  /** Reasoning text emitted by a thinking model (collapsible under the message). */
  thinking?: string
  /** Wall-clock time the assistant turn took, in ms (shown as "12s"). */
  durationMs?: number
}

/** Broad grouping for the settings panel. */
type ToolCategory =
  | 'navigation'
  | 'library'
  | 'filter'
  | 'wishlist'
  | 'sync'
  | 'launch'
  | 'store'
  | 'settings'
  | 'secrets'
  | 'system'
  | 'memory'

/** Built-in risk level of a tool (the default before any user override). */
type ToolSensitivity = 'safe' | 'sensitive'

/**
 * Per-tool policy the user can set in Settings:
 * - `allow`   — run without asking ("Always allow")
 * - `confirm` — ask before running ("Ask first")
 * - `disabled`— never offered to the model
 */
type ToolPolicy = 'allow' | 'confirm' | 'disabled'

/** Renderer-facing view of a registered tool (for the settings panel). */
interface ToolInfo {
  name: string
  description: string
  category: ToolCategory
  sensitivity: ToolSensitivity
  /** The effective policy after applying the user's override (if any). */
  policy: ToolPolicy
  /** Whether the user has overridden the built-in default. */
  overridden: boolean
}

/** The user's decision on a confirm-gated tool call. */
type ConfirmDecision = 'once' | 'always' | 'deny'

/** Per-chat-session permission override (not persisted). */
type PermissionMode = 'default' | 'allow' | 'ask'

/** Context-window allocation level (maps to a token budget, capped to model max). */
type ContextLevel = 'low' | 'medium' | 'high'

/** Live context-window usage, for the in-chat meter. */
interface ContextStatus {
  usedTokens: number
  contextSize: number
  modelId: string
}

/**
 * The reverse bridge: a `ui`-surface tool runs in main but must act on renderer
 * state, so main sends a UiInvokeRequest to the renderer and awaits a
 * UiInvokeResult. Correlated by `id`.
 */
interface UiInvokeRequest {
  id: string
  action: string
  payload: unknown
}
interface UiInvokeResult {
  id: string
  ok: boolean
  result?: unknown
  error?: string
}

/**
 * Events streamed from the agent to the chat UI during a single turn, on the
 * `ai:stream` channel (same fire-and-forget pattern as `enrich:progress`).
 */
type AiStreamEvent =
  | { turnId: string; type: 'token'; text: string }
  /** Live chain-of-thought from a reasoning model (shown in the scrolling panel). */
  | { turnId: string; type: 'thinking'; text: string }
  | { turnId: string; type: 'tool-call'; callId: string; name: string; args: unknown }
  | {
      turnId: string
      type: 'tool-result'
      callId: string
      name: string
      ok: boolean
      result?: unknown
      error?: string
    }
  /** The agent is blocked awaiting a confirm decision for a sensitive tool. */
  | { turnId: string; type: 'confirm'; callId: string; name: string; args: unknown; summary: string }
  | { turnId: string; type: 'done'; text: string }
  | { turnId: string; type: 'error'; error: string }

export type {
  ToolCallRecord,
  TurnPart,
  ChatMessage,
  ToolCategory,
  ToolSensitivity,
  ToolPolicy,
  ToolInfo,
  ConfirmDecision,
  PermissionMode,
  ContextLevel,
  ContextStatus,
  UiInvokeRequest,
  UiInvokeResult,
  AiStreamEvent,
}

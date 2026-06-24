import type { BrowserWindow } from 'electron'
import type { ToolCategory, ToolInfo, ToolPolicy, ToolSensitivity } from '@jex/shared/agent'

/**
 * The tool registry — the single source of truth for what the AI agent can do.
 * Each tool declares its schema, category, and built-in sensitivity; the agent
 * builds node-llama-cpp functions from the *enabled* subset, and the Settings
 * panel renders the whole list with per-tool policy controls.
 *
 * Two execution surfaces:
 *  - `main`: the handler runs here in the main process (DB, sync, shell, …).
 *  - `ui`:   the handler must act on renderer state (route, filters, webview), so
 *            it dispatches through `ctx.ui(...)` to the renderer (see Phase 2).
 */

/** A minimal JSON-schema object accepted by node-llama-cpp's `params`. */
interface JsonSchema {
  type: 'object'
  properties: Record<string, unknown>
  required?: string[]
}

interface ToolContext {
  window: BrowserWindow | null
  /** Dispatch a UI-surface action to the renderer and await its result. */
  ui: (action: string, payload: unknown) => Promise<unknown>
}

interface ToolDef {
  name: string
  description: string
  category: ToolCategory
  sensitivity: ToolSensitivity
  surface: 'main' | 'ui'
  params: JsonSchema
  /** A short, human-readable summary of a pending call (for the confirm card). */
  summarize?: (args: Record<string, unknown>) => string
  run: (args: Record<string, unknown>, ctx: ToolContext) => Promise<unknown>
}

const REGISTRY = new Map<string, ToolDef>()

const registerTool = (tool: ToolDef): void => {
  if (REGISTRY.has(tool.name)) throw new Error(`Duplicate tool: ${tool.name}`)
  REGISTRY.set(tool.name, tool)
}

const getTool = (name: string): ToolDef | undefined => {
  return REGISTRY.get(name)
}

const allTools = (): ToolDef[] => {
  return [...REGISTRY.values()]
}

// ── Per-tool policy ─────────────────────────────────────────────────────────
// Persistence is injected (the app wires it to config.json in index.ts) so the
// registry stays free of electron and is unit-testable. Defaults to in-memory.

interface PolicyStore {
  get: () => Record<string, ToolPolicy>
  set: (overrides: Record<string, ToolPolicy>) => void
}

let memory: Record<string, ToolPolicy> = {}
let policyStore: PolicyStore = {
  get: () => memory,
  set: (o) => {
    memory = o
  },
}

/** Wire policy persistence (config.json). Called once at startup by main. */
const setPolicyStore = (store: PolicyStore): void => {
  policyStore = store
}

const policyOverrides = (): Record<string, ToolPolicy> => {
  return policyStore.get() ?? {}
}

/** The default policy from a tool's built-in sensitivity. */
const defaultPolicy = (tool: ToolDef): ToolPolicy => {
  return tool.sensitivity === 'sensitive' ? 'confirm' : 'allow'
}

/** The effective policy: user override if set, else the built-in default. */
const effectivePolicy = (tool: ToolDef): ToolPolicy => {
  return policyOverrides()[tool.name] ?? defaultPolicy(tool)
}

const setToolPolicy = (name: string, policy: ToolPolicy): void => {
  policyStore.set({ ...policyOverrides(), [name]: policy })
}

/** Tools the agent should actually offer to the model (everything not disabled). */
const enabledTools = (): ToolDef[] => {
  return allTools().filter((t) => effectivePolicy(t) !== 'disabled')
}

/** Renderer-facing view of every tool, for the Settings panel. */
const listToolInfo = (): ToolInfo[] => {
  const overrides = policyOverrides()
  return allTools().map((t) => ({
    name: t.name,
    description: t.description,
    category: t.category,
    sensitivity: t.sensitivity,
    policy: overrides[t.name] ?? defaultPolicy(t),
    overridden: overrides[t.name] != null,
  }))
}

export {
  registerTool,
  getTool,
  allTools,
  setPolicyStore,
  defaultPolicy,
  effectivePolicy,
  setToolPolicy,
  enabledTools,
  listToolInfo,
}
export type { JsonSchema, ToolContext, ToolDef, PolicyStore }

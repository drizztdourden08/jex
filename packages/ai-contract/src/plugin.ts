// AiPlugin — the surface a loaded AI plugin exposes back to the host. The host's
// ai:* IPC handlers delegate 1:1 to these methods; push streams (tokens, download
// and CUDA progress) go out through `emit`, which the host forwards to the renderer
// on the same channel names used today (ai:stream, ai:downloadProgress, …).

import type {
  AiBackendInfo,
  AiModelOption,
  AiModelStatus,
  AiDownloadProgress,
  CudaStatus,
  AiVocab,
  QueryResult,
} from '@jex/shared/ai'
import type {
  ContextLevel,
  ContextStatus,
  PermissionMode,
  ToolInfo,
  ConfirmDecision,
  ToolPolicy,
} from '@jex/shared/agent'
import type { HostServices } from './host'

// Push channel: the plugin streams to the renderer through the host (which owns the
// webContents). Same channel strings the renderer already listens on.
type PluginEmit = (channel: string, ...args: unknown[]) => void

// Request/response into the renderer for `ui`-surface tools (route, filters, …).
// The host wires this to its ui:invoke / ui:result bridge.
type UiDispatcher = (action: string, payload: unknown) => Promise<unknown>

interface AiPluginInitOpts {
  host: HostServices
  emit: PluginEmit
  ui: UiDispatcher
  // Where this plugin may read/write its GGUF model files (under userData).
  modelDir: string
}

interface AiPlugin {
  // Bumped when this interface changes incompatibly; the host refuses to load a
  // plugin whose apiVersion it doesn't support.
  apiVersion: number
  init: (opts: AiPluginInitOpts) => Promise<void>
  dispose: () => Promise<void>

  // ── Model + backend ──
  modelStatus: () => AiModelStatus
  backendInfo: () => Promise<AiBackendInfo>
  warmup: () => Promise<void>
  listModels: () => AiModelOption[]
  setModel: (id: string) => Promise<void>
  downloadModel: (modelId?: string) => Promise<void>
  activeDownloads: () => Record<string, AiDownloadProgress>
  deleteModel: (id: string) => void
  cudaStatus: () => Promise<CudaStatus>
  installCuda: () => Promise<void>

  // ── Agent chat ──
  chatTurn: (turnId: string, message: string) => Promise<void>
  resetChat: () => void
  cancel: () => void
  contextStatus: () => ContextStatus
  getContextLevel: () => ContextLevel
  setContextLevel: (level: ContextLevel) => Promise<void>
  getPermissionMode: () => PermissionMode
  setPermissionMode: (mode: PermissionMode) => void
  confirm: (callId: string, decision: ConfirmDecision) => void
  listTools: () => ToolInfo[]
  setToolPolicy: (name: string, policy: ToolPolicy) => void

  // ── NL → FilterSpec ──
  buildQuery: (prompt: string, vocab: AiVocab) => Promise<QueryResult>
}

// A plugin module's default export is a factory returning the AiPlugin.
type AiPluginFactory = () => AiPlugin

export type { AiPlugin, AiPluginInitOpts, AiPluginFactory, PluginEmit, UiDispatcher }

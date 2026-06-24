import { ipcRenderer, type IpcRendererEvent } from 'electron'
import type {
  AiBackendInfo,
  AiDownloadDone,
  AiDownloadProgress,
  AiEngineStatus,
  EnginePluginInfo,
  AiModelOption,
  AiModelStatus,
  AiVocab,
  CudaStatus,
  QueryResult,
} from '@shared/ai'
import type {
  AiStreamEvent,
  ConfirmDecision,
  ContextLevel,
  ContextStatus,
  PermissionMode,
  ToolInfo,
  ToolPolicy,
  UiInvokeRequest,
  UiInvokeResult,
} from '@shared/agent'
import type { IpcApi } from '@shared/ipc/api'

// The `ai` slice of the preload bridge — engine-plugin setup, model management, the
// conversational agent stream, the tool registry, and the UI tool bridge. Split out of
// preload/index.ts to keep each file focused (and under the 200-line cap).
const aiApi = {
  // ── Engine plugin lifecycle (first-run setup) ──
  engineStatus: (): Promise<AiEngineStatus> => ipcRenderer.invoke('ai:engineStatus'),
  enginePlugins: (): Promise<EnginePluginInfo[]> => ipcRenderer.invoke('ai:enginePlugins'),
  installEngine: (ids: string[]): Promise<void> => ipcRenderer.invoke('ai:installEngine', ids),
  onEngineProgress: (cb: (msg: string) => void): (() => void) => {
    const listener = (_e: IpcRendererEvent, msg: string) => cb(msg)
    ipcRenderer.on('ai:engineProgress', listener)
    return () => ipcRenderer.removeListener('ai:engineProgress', listener)
  },
  // ── Model management ──
  status: (): Promise<AiModelStatus> => ipcRenderer.invoke('ai:status'),
  backend: (): Promise<AiBackendInfo> => ipcRenderer.invoke('ai:backend'),
  warmup: (): Promise<void> => ipcRenderer.invoke('ai:warmup'),
  listModels: (): Promise<AiModelOption[]> => ipcRenderer.invoke('ai:listModels'),
  setModel: (id: string): Promise<void> => ipcRenderer.invoke('ai:setModel', id),
  downloadModel: (modelId?: string): Promise<string> => ipcRenderer.invoke('ai:downloadModel', modelId),
  deleteModel: (id: string): Promise<void> => ipcRenderer.invoke('ai:deleteModel', id),
  downloads: (): Promise<Record<string, AiDownloadProgress>> => ipcRenderer.invoke('ai:downloads'),
  cudaStatus: (): Promise<CudaStatus> => ipcRenderer.invoke('ai:cudaStatus'),
  installCuda: (): Promise<void> => ipcRenderer.invoke('ai:installCuda'),
  onCudaProgress: (cb: (status: string) => void): (() => void) => {
    const listener = (_e: IpcRendererEvent, status: string) => cb(status)
    ipcRenderer.on('ai:cudaProgress', listener)
    return () => ipcRenderer.removeListener('ai:cudaProgress', listener)
  },
  buildQuery: (prompt: string, vocab?: AiVocab): Promise<QueryResult> =>
    ipcRenderer.invoke('ai:buildQuery', prompt, vocab),
  onDownloadProgress: (cb: (p: AiDownloadProgress) => void): (() => void) => {
    const listener = (_e: IpcRendererEvent, p: AiDownloadProgress) => cb(p)
    ipcRenderer.on('ai:downloadProgress', listener)
    return () => ipcRenderer.removeListener('ai:downloadProgress', listener)
  },
  onDownloadDone: (cb: (d: AiDownloadDone) => void): (() => void) => {
    const listener = (_e: IpcRendererEvent, d: AiDownloadDone) => cb(d)
    ipcRenderer.on('ai:downloadDone', listener)
    return () => ipcRenderer.removeListener('ai:downloadDone', listener)
  },
  // ── Conversational agent ──
  chatTurn: (turnId: string, message: string): Promise<string> =>
    ipcRenderer.invoke('ai:chatTurn', turnId, message),
  resetChat: (): Promise<void> => ipcRenderer.invoke('ai:resetChat'),
  cancel: (): Promise<void> => ipcRenderer.invoke('ai:cancel'),
  contextStatus: (): Promise<ContextStatus> => ipcRenderer.invoke('ai:contextStatus'),
  getContextLevel: (): Promise<ContextLevel> => ipcRenderer.invoke('ai:getContextLevel'),
  setContextLevel: (level: ContextLevel): Promise<void> => ipcRenderer.invoke('ai:setContextLevel', level),
  getPermissionMode: (): Promise<PermissionMode> => ipcRenderer.invoke('ai:getPermissionMode'),
  setPermissionMode: (mode: PermissionMode): Promise<void> => ipcRenderer.invoke('ai:setPermissionMode', mode),
  confirm: (callId: string, decision: ConfirmDecision): Promise<void> =>
    ipcRenderer.invoke('ai:confirm', callId, decision),
  onStream: (cb: (ev: AiStreamEvent) => void): (() => void) => {
    const listener = (_e: IpcRendererEvent, ev: AiStreamEvent) => cb(ev)
    ipcRenderer.on('ai:stream', listener)
    return () => ipcRenderer.removeListener('ai:stream', listener)
  },
  // ── Tool registry (Settings panel) ──
  listTools: (): Promise<ToolInfo[]> => ipcRenderer.invoke('ai:listTools'),
  setToolPolicy: (name: string, policy: ToolPolicy): Promise<void> =>
    ipcRenderer.invoke('ai:setToolPolicy', name, policy),
  // ── UI tool bridge (main → renderer) ──
  onUiInvoke: (cb: (req: UiInvokeRequest) => void): (() => void) => {
    const listener = (_e: IpcRendererEvent, req: UiInvokeRequest) => cb(req)
    ipcRenderer.on('ui:invoke', listener)
    return () => ipcRenderer.removeListener('ui:invoke', listener)
  },
  uiResult: (result: UiInvokeResult): void => ipcRenderer.send('ui:result', result),
} satisfies IpcApi['ai']

export { aiApi }

import type { DetectResult, Game, LibraryStats, ScanResult, SyncProgress, SyncState } from '../library'
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
} from '../ai'
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
} from '../agent'
import type { FilterSpec } from '../filter'
import type { SearchQuery, SearchResponse, SearchVocab, StoreRandomResponse } from '../search'
import type { WishlistGroup, WishlistGroupPatch, WishlistSyncResult } from '../wishlist'

/**
 * The single source of truth for the renderer↔main bridge surface. Both ends derive
 * from this one type: `global.d.ts` declares `window.api: IpcApi`, and the preload
 * object is checked with `satisfies IpcApi`. Keeping the shape here (in pure shared
 * TS) means the two ends can no longer drift independently. Tying the main-process
 * `ipcMain.handle` channels to this contract is a further (optional) enhancement.
 */
interface IpcApi {
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<boolean>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
  settings: {
    getAll: () => Promise<Record<string, unknown>>
    get: <T>(key: string) => Promise<T>
    set: (key: string, value: unknown) => Promise<void>
  }
  secrets: {
    available: () => Promise<boolean>
    set: (key: string, value: string) => Promise<void>
    has: (key: string) => Promise<boolean>
    get: (key: string) => Promise<string | null>
    clear: (key: string) => Promise<void>
  }
  steam: {
    detect: () => Promise<DetectResult>
  }
  library: {
    scanLocal: () => Promise<ScanResult>
    getAll: () => Promise<Game[]>
    get: (appid: number) => Promise<Game | null>
    refresh: (appid: number) => Promise<Game | null>
    ensure: (appid: number, name?: string) => Promise<Game | null>
    detailCore: (appid: number, name?: string) => Promise<Game | null>
    detailExtras: (appid: number) => Promise<Game | null>
    dropMetadata: () => Promise<number>
    stats: () => Promise<LibraryStats>
    syncFull: () => Promise<void>
    syncState: () => Promise<SyncState>
    cancelSync: () => Promise<void>
  }
  enrich: {
    setActive: (ctx: { tab: string; appid?: number }) => Promise<void>
    onProgress: (cb: (p: SyncProgress) => void) => () => void
  }
  wishlist: {
    sync: () => Promise<WishlistSyncResult>
    add: (appid: number) => Promise<{ ok: boolean; needsLogin?: boolean; error?: string }>
    groups: {
      list: () => Promise<WishlistGroup[]>
      create: (
        name: string,
        filterSpec?: FilterSpec | null,
        manualAppids?: number[],
      ) => Promise<WishlistGroup>
      update: (id: number, patch: WishlistGroupPatch) => Promise<WishlistGroup | null>
      delete: (id: number) => Promise<void>
      reorder: (ids: number[]) => Promise<void>
    }
  }
  app: {
    openExternal: (url: string) => Promise<void>
  }
  store: {
    setActive: (active: boolean) => Promise<void>
    nav: (action: 'back' | 'forward') => Promise<void>
  }
  search: {
    query: (query: SearchQuery) => Promise<SearchResponse>
    randomPicks: (query: SearchQuery, count: number) => Promise<StoreRandomResponse>
    syncVocab: () => Promise<SearchVocab>
    getVocab: () => Promise<SearchVocab | null>
  }
  ai: {
    engineStatus: () => Promise<AiEngineStatus>
    enginePlugins: () => Promise<EnginePluginInfo[]>
    installEngine: (ids: string[]) => Promise<void>
    onEngineProgress: (cb: (msg: string) => void) => () => void
    status: () => Promise<AiModelStatus>
    backend: () => Promise<AiBackendInfo>
    warmup: () => Promise<void>
    listModels: () => Promise<AiModelOption[]>
    setModel: (id: string) => Promise<void>
    downloadModel: (modelId?: string) => Promise<string>
    deleteModel: (id: string) => Promise<void>
    downloads: () => Promise<Record<string, AiDownloadProgress>>
    cudaStatus: () => Promise<CudaStatus>
    installCuda: () => Promise<void>
    onCudaProgress: (cb: (status: string) => void) => () => void
    buildQuery: (prompt: string, vocab?: AiVocab) => Promise<QueryResult>
    onDownloadProgress: (cb: (p: AiDownloadProgress) => void) => () => void
    onDownloadDone: (cb: (d: AiDownloadDone) => void) => () => void
    chatTurn: (turnId: string, message: string) => Promise<string>
    resetChat: () => Promise<void>
    cancel: () => Promise<void>
    contextStatus: () => Promise<ContextStatus>
    getContextLevel: () => Promise<ContextLevel>
    setContextLevel: (level: ContextLevel) => Promise<void>
    getPermissionMode: () => Promise<PermissionMode>
    setPermissionMode: (mode: PermissionMode) => Promise<void>
    confirm: (callId: string, decision: ConfirmDecision) => Promise<void>
    onStream: (cb: (ev: AiStreamEvent) => void) => () => void
    listTools: () => Promise<ToolInfo[]>
    setToolPolicy: (name: string, policy: ToolPolicy) => Promise<void>
    onUiInvoke: (cb: (req: UiInvokeRequest) => void) => () => void
    uiResult: (result: UiInvokeResult) => void
  }
}

export type { IpcApi }

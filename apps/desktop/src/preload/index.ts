import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type {
  DetectResult,
  Game,
  LibraryStats,
  ScanResult,
  SyncProgress,
  SyncState,
} from '@shared/library'
import type { FilterSpec } from '@shared/filter'
import type { SearchQuery, SearchResponse, SearchVocab, StoreRandomResponse } from '@shared/search'
import type { WishlistGroup, WishlistGroupPatch, WishlistSyncResult } from '@shared/wishlist'
import type { IpcApi } from '@shared/ipc/api'
import { aiApi } from './ai-api'

/**
 * The single, typed bridge between renderer and main. The renderer has no Node
 * access — everything privileged goes through these explicit, named channels. The
 * `satisfies IpcApi` check ties this implementation to the shared contract (the
 * same type `window.api` is declared from), so the two can't drift.
 */
const api = {
  window: {
    minimize: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
    maximize: (): Promise<boolean> => ipcRenderer.invoke('window:maximize'),
    close: (): Promise<void> => ipcRenderer.invoke('window:close'),
    isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),
  },
  settings: {
    getAll: (): Promise<Record<string, unknown>> => ipcRenderer.invoke('settings:getAll'),
    get: <T>(key: string): Promise<T> => ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: unknown): Promise<void> =>
      ipcRenderer.invoke('settings:set', key, value),
  },
  secrets: {
    available: (): Promise<boolean> => ipcRenderer.invoke('secret:available'),
    set: (key: string, value: string): Promise<void> =>
      ipcRenderer.invoke('secret:set', key, value),
    has: (key: string): Promise<boolean> => ipcRenderer.invoke('secret:has', key),
    get: (key: string): Promise<string | null> => ipcRenderer.invoke('secret:get', key),
    clear: (key: string): Promise<void> => ipcRenderer.invoke('secret:clear', key),
  },
  steam: {
    detect: (): Promise<DetectResult> => ipcRenderer.invoke('steam:detect'),
  },
  library: {
    scanLocal: (): Promise<ScanResult> => ipcRenderer.invoke('library:scanLocal'),
    getAll: (): Promise<Game[]> => ipcRenderer.invoke('library:getAll'),
    get: (appid: number): Promise<Game | null> => ipcRenderer.invoke('library:get', appid),
    refresh: (appid: number): Promise<Game | null> => ipcRenderer.invoke('library:refresh', appid),
    ensure: (appid: number, name?: string): Promise<Game | null> =>
      ipcRenderer.invoke('library:ensure', appid, name),
    detailCore: (appid: number, name?: string): Promise<Game | null> =>
      ipcRenderer.invoke('library:detailCore', appid, name),
    detailExtras: (appid: number): Promise<Game | null> =>
      ipcRenderer.invoke('library:detailExtras', appid),
    dropMetadata: (): Promise<number> => ipcRenderer.invoke('library:dropMetadata'),
    stats: (): Promise<LibraryStats> => ipcRenderer.invoke('library:stats'),
    syncFull: (): Promise<void> => ipcRenderer.invoke('library:syncFull'),
    syncState: (): Promise<SyncState> => ipcRenderer.invoke('library:syncState'),
    cancelSync: (): Promise<void> => ipcRenderer.invoke('library:cancelSync'),
  },
  // The shared enrichment scheduler: one progress stream for library + wishlist +
  // game-detail, plus a hint about which tab/detail is open (so it prioritizes).
  enrich: {
    setActive: (ctx: { tab: string; appid?: number }): Promise<void> =>
      ipcRenderer.invoke('enrich:setActive', ctx),
    onProgress: (cb: (p: SyncProgress) => void): (() => void) => {
      const listener = (_e: IpcRendererEvent, p: SyncProgress) => cb(p)
      ipcRenderer.on('enrich:progress', listener)
      return () => ipcRenderer.removeListener('enrich:progress', listener)
    },
  },
  wishlist: {
    sync: (): Promise<WishlistSyncResult> => ipcRenderer.invoke('wishlist:sync'),
    /** Add a game to the Steam wishlist via the logged-in Store-tab session. */
    add: (appid: number): Promise<{ ok: boolean; needsLogin?: boolean; error?: string }> =>
      ipcRenderer.invoke('wishlist:add', appid),
    groups: {
      list: (): Promise<WishlistGroup[]> => ipcRenderer.invoke('wishlist:groups:list'),
      create: (
        name: string,
        filterSpec?: FilterSpec | null,
        manualAppids?: number[],
      ): Promise<WishlistGroup> =>
        ipcRenderer.invoke('wishlist:groups:create', name, filterSpec, manualAppids),
      update: (id: number, patch: WishlistGroupPatch): Promise<WishlistGroup | null> =>
        ipcRenderer.invoke('wishlist:groups:update', id, patch),
      delete: (id: number): Promise<void> => ipcRenderer.invoke('wishlist:groups:delete', id),
      reorder: (ids: number[]): Promise<void> =>
        ipcRenderer.invoke('wishlist:groups:reorder', ids),
    },
  },
  app: {
    openExternal: (url: string): Promise<void> => ipcRenderer.invoke('app:openExternal', url),
  },
  store: {
    /** Report whether the Store tab is showing (gates browser-nav keys in main). */
    setActive: (active: boolean): Promise<void> => ipcRenderer.invoke('store:setActive', active),
    /** Mouse back/forward caught in the renderer DOM, forwarded to the store webview. */
    nav: (action: 'back' | 'forward'): Promise<void> => ipcRenderer.invoke('store:nav', action),
  },
  search: {
    /** One page of a whole-catalog Steam search (12 results, manual paging). */
    query: (query: SearchQuery): Promise<SearchResponse> => ipcRenderer.invoke('search:query', query),
    /** A random sample from the live store catalog (the randomizer's Store source). */
    randomPicks: (query: SearchQuery, count: number): Promise<StoreRandomResponse> =>
      ipcRenderer.invoke('search:randomPicks', query, count),
    /** Sync the faceted vocabulary (popular tags) into AppData; returns it. */
    syncVocab: (): Promise<SearchVocab> => ipcRenderer.invoke('search:syncVocab'),
    /** The last-synced vocabulary, or null if never synced. */
    getVocab: (): Promise<SearchVocab | null> => ipcRenderer.invoke('search:getVocab'),
  },
  ai: aiApi,
} satisfies IpcApi

contextBridge.exposeInMainWorld('api', api)

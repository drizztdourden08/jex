// HostServices — everything the desktop host exposes to a loaded AI plugin. The
// plugin depends only on this interface (and @jex/shared), never on src/main; the
// app implements it by wrapping its real main-process modules (db, library, steam,
// settings, secrets). This is the dependency-inversion seam (DIP): the AI engine and
// its tools call `host.*` instead of importing privileged code directly.

import type { Game } from '@jex/shared/library/game'
import type { LibraryStats, SyncState } from '@jex/shared/library/sync'
import type { DetectResult } from '@jex/shared/library/detect'
import type { FilterSpec } from '@jex/shared/filter'
import type { WishlistGroup, WishlistGroupPatch, WishlistSyncResult } from '@jex/shared/wishlist'
import type { SearchQuery, SearchResponse } from '@jex/shared/search'

// The SQLite library mirror (read paths + the AI's small key/value scratch space).
interface HostDb {
  getAllGames: () => Game[]
  getGame: (appid: number) => Game | null
  getStats: () => LibraryStats
  getMeta: <T>(key: string) => T | null
  setMeta: (key: string, value: unknown) => void
}

// Wishlist groups (the AI can curate them).
interface HostWishlist {
  listGroups: () => WishlistGroup[]
  getGroup: (id: number) => WishlistGroup | null
  createGroup: (name: string, filterSpec?: FilterSpec | null, manualAppids?: number[]) => WishlistGroup
  updateGroup: (id: number, patch: WishlistGroupPatch) => WishlistGroup | null
  deleteGroup: (id: number) => void
}

// Library scan/sync orchestration (throttled enrichment lives behind these).
interface HostLibrary {
  runFullSync: () => Promise<void>
  runWishlistSync: () => Promise<WishlistSyncResult>
  cancelEnrich: () => void
  getSyncState: () => SyncState
}

// Steam detection + the throttled Store catalog search.
interface HostSteam {
  detectSteam: () => Promise<DetectResult>
  searchCatalog: (query: SearchQuery, countryCode?: string) => Promise<SearchResponse>
}

// Non-secret settings (electron-store `config.json`).
interface HostSettings {
  get: <T = unknown>(key: string) => T | undefined
  set: (key: string, value: unknown) => void
}

// Encrypted secrets (safeStorage) — write-only from a plugin's perspective.
interface HostSecrets {
  setSecret: (key: string, value: string) => void
}

// Writable, plugin-managed locations the host resolves (under userData).
interface HostPaths {
  userData: string
  models: string
}

interface HostServices {
  db: HostDb
  wishlist: HostWishlist
  library: HostLibrary
  steam: HostSteam
  settings: HostSettings
  secrets: HostSecrets
  paths: HostPaths
  log: (level: 'info' | 'warn' | 'error', message: string) => void
}

export type {
  HostServices,
  HostDb,
  HostWishlist,
  HostLibrary,
  HostSteam,
  HostSettings,
  HostSecrets,
  HostPaths,
}

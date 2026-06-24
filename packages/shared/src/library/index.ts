/**
 * Barrel for the shared library domain — re-exports the full public surface so
 * `@shared/library` keeps resolving for both main and renderer importers.
 */

export { emptyGame } from './game'
export type {
  EnrichmentStatus,
  GameMovie,
  GameMedia,
  ReviewSummary,
  GameReviews,
  GameFeatures,
  HltbInfo,
  Game,
} from './game'
export type {
  SteamUser,
  LibraryFolder,
  InstalledApp,
  DetectResult,
  ScanResult,
} from './detect'
export type {
  WorkerProgress,
  SyncProgress,
  LibraryStats,
  SyncState,
  EnrichOptions,
} from './sync'

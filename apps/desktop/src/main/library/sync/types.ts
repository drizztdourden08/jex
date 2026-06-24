import type { SyncProgress } from '@shared/library'

const DAY_MS = 86_400_000
const MONTH_MS = 30 * DAY_MS

type ProgressFn = (p: SyncProgress) => void

/** Granular auto-sync toggles (all default on). */
interface AutoSyncFlags {
  onOpen: boolean
  daily: boolean
  monthly: boolean
}

export { DAY_MS, MONTH_MS }
export type { ProgressFn, AutoSyncFlags }

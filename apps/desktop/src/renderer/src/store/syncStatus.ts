import { create } from 'zustand'
import type { SyncProgress } from '@shared/library'

/**
 * App-wide state of the library scan + owned/metadata sync. The sync runs in main and
 * outlives any page, so one feed (useSyncStatusFeed, mounted by the always-on
 * TitleBar) keeps this in step with main; the Library page reads and drives it, and
 * the title-bar activity popover shows it from anywhere.
 */
interface SyncStatusState {
  syncing: boolean
  cancelling: boolean
  /** A local Steam-install rescan started from the Library is in flight. */
  scanning: boolean
  progress: SyncProgress | null

  /** Adopt main's real state (on app start). */
  hydrate: (running: boolean, progress: SyncProgress | null) => void
  /** A progress event from main; terminal phases end the syncing state. */
  receive: (p: SyncProgress) => void
  setScanning: (scanning: boolean) => void
  start: () => void
  cancel: () => void
}

const isTerminal = (p: SyncProgress): boolean =>
  p.phase === 'done' || p.phase === 'paused' || p.phase === 'error'

const STARTING: SyncProgress = { phase: 'owned', total: 1, done: 0, message: 'Starting…' }

const useSyncStatus = create<SyncStatusState>((set) => ({
  syncing: false,
  cancelling: false,
  scanning: false,
  progress: null,

  hydrate: (running, progress) => {
    if (running) set({ syncing: true, progress })
  },
  receive: (p) =>
    set(isTerminal(p) ? { progress: p, syncing: false, cancelling: false } : { progress: p, syncing: true }),
  setScanning: (scanning) => set({ scanning }),
  start: () => {
    set({ syncing: true, cancelling: false, progress: STARTING })
    window.api.library.syncFull().catch((e: unknown) => {
      set({ syncing: false, progress: { phase: 'error', total: 0, done: 0, message: String(e) } })
    })
  },
  cancel: () => {
    set({ cancelling: true })
    window.api.library.cancelSync().catch(() => set({ cancelling: false }))
  },
}))

export { useSyncStatus, isTerminal }
export type { SyncStatusState }

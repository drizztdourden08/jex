import type { SyncProgress } from '@shared/library'

interface SyncActivityProps {
  open: boolean
  syncing: boolean
  scanning: boolean
  cancelling: boolean
  progress: SyncProgress | null
  onToggle: () => void
  onClose: () => void
  onCancel: () => void
}

export type { SyncActivityProps }

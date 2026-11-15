import type { InstalledRemote } from '@/lib/ai/installedRemote'

interface RemoteModelListProps {
  /** One provider's added models. */
  models: InstalledRemote[]
  activeRef: string | null
  busyRef: string | null
  onUse: (ref: string) => void
  onRemove: (ref: string) => void
}

export type { RemoteModelListProps }

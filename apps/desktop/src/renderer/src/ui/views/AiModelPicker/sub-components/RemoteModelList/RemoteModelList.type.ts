import type { RemoteModelOption } from '@shared/remote-ai'

interface RemoteModelListProps {
  models: RemoteModelOption[]
  activeRef: string | null
  busyRef: string | null
  onUse: (ref: string) => void
}

export type { RemoteModelListProps }

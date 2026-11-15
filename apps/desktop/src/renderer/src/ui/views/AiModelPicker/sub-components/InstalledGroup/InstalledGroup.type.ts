import type { AiModelOption } from '@shared/ai'
import type { RemoteProviderId } from '@shared/remote-ai'
import type { InstalledRemote } from '@/lib/ai/installedRemote'
import type { DownloadingModel } from '../../behavior/useModelCatalog'
import type { RemoteKeysModel } from '../../behavior/useRemoteKeys'

interface ProviderSection {
  provider: RemoteProviderId
  models: InstalledRemote[]
}

interface InstalledGroupProps {
  localModels: AiModelOption[]
  downloading: DownloadingModel[]
  inactiveCount: number
  onSelectLocal: (id: string) => void
  onRemoveLocal: (id: string) => void
  onCleanLocal: () => void
  /** Cloud providers to show, in order, each with its added models. */
  sections: ProviderSection[]
  activeRef: string | null
  busyRef: string | null
  onUseRemote: (ref: string) => void
  onRemoveRemote: (ref: string) => void
  keys: RemoteKeysModel
  error: string | null
}

export type { InstalledGroupProps, ProviderSection }

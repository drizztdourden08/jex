import type { RemoteProviderId } from '@shared/remote-ai'

interface ProviderKeyResult {
  check: 'ok' | 'unverified' | 'rejected'
  message?: string
}

interface ProviderKeyRowProps {
  provider: RemoteProviderId
  present: boolean
  loaded: boolean
  draft: string
  replacing: boolean
  result: ProviderKeyResult | null
  busy: boolean
  disabled: boolean
  onDraft: (p: RemoteProviderId, v: string) => void
  onSave: (p: RemoteProviderId) => void
  onClear: (p: RemoteProviderId) => void
  onReplace: (p: RemoteProviderId) => void
  onCancelReplace: (p: RemoteProviderId) => void
}

export type { ProviderKeyRowProps, ProviderKeyResult }

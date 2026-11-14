type RemoteProviderId = 'anthropic' | 'openai'

type RemoteEffort = 'low' | 'medium' | 'high'

interface RemoteModelOption {
  /** `${provider}/${id}`, e.g. 'anthropic/claude-opus-5-5'. */
  ref: string
  provider: RemoteProviderId
  id: string
  label: string
  /** Null when the provider does not report it (OpenAI). */
  contextSize: number | null
  recommended: boolean
  keyPresent: boolean
}

interface RemoteKeyState {
  present: boolean
}

type RemoteKeyStatus = Record<RemoteProviderId, RemoteKeyState>

type RemoteKeyCheck = 'ok' | 'unverified' | 'rejected'

interface RemoteSetKeyResult {
  status: RemoteKeyStatus
  check: RemoteKeyCheck
  message?: string
}

export type {
  RemoteProviderId,
  RemoteEffort,
  RemoteModelOption,
  RemoteKeyState,
  RemoteKeyStatus,
  RemoteKeyCheck,
  RemoteSetKeyResult,
}

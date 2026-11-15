// Provider API keys live only in main, encrypted by safeStorage (see ../secrets).
// Nothing here ever returns a key to the renderer: status is presence only.
import type { RemoteKeyStatus, RemoteProviderId } from '@shared/remote-ai'
import { REMOTE_PROVIDERS } from '@shared/remote-ai'
import { clearSecret, getSecret, hasSecret } from '../secrets'

const PROVIDER_SECRET: Record<RemoteProviderId, string> = {
  anthropic: 'anthropicApiKey',
  openai: 'openaiApiKey',
}

const getKey = (provider: RemoteProviderId): Promise<string | null> => getSecret(PROVIDER_SECRET[provider])

const clearKey = (provider: RemoteProviderId): void => clearSecret(PROVIDER_SECRET[provider])

const keyStatus = (): RemoteKeyStatus => {
  const status = {} as RemoteKeyStatus
  for (const p of REMOTE_PROVIDERS) status[p] = { present: hasSecret(PROVIDER_SECRET[p]) }
  return status
}

export { PROVIDER_SECRET, getKey, clearKey, keyStatus }

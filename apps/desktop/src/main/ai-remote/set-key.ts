// Save a provider key: verify first, store only when not rejected. The key is never
// echoed, logged or returned; callers get the presence status and the check result.
import type { RemoteKeyStatus, RemoteProviderId, RemoteSetKeyResult } from '@shared/remote-ai'
import { setSecret } from '../secrets'
import { PROVIDER_SECRET, clearKey, keyStatus } from './keys'
import { remoteLlm } from './remote-llm'
import { invalidateModels } from './model-cache'

const REJECTED_MESSAGE = 'The provider rejected this key. It was not saved.'

const setProviderKey = async (provider: RemoteProviderId, key: string): Promise<RemoteSetKeyResult> => {
  const trimmed = typeof key === 'string' ? key.trim() : ''
  if (!trimmed) return { status: keyStatus(), check: 'rejected', message: 'Enter an API key.' }
  const check = await remoteLlm().verifyKey(provider, trimmed)
  if (check === 'rejected') return { status: keyStatus(), check, message: REJECTED_MESSAGE }
  setSecret(PROVIDER_SECRET[provider], trimmed)
  remoteLlm().forget(provider)
  invalidateModels()
  return {
    status: keyStatus(),
    check,
    ...(check === 'unverified' ? { message: 'Saved, but the key could not be verified (network).' } : {}),
  }
}

const clearProviderKey = (provider: RemoteProviderId): RemoteKeyStatus => {
  clearKey(provider)
  remoteLlm().forget(provider)
  invalidateModels()
  return keyStatus()
}

export { setProviderKey, clearProviderKey }

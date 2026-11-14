import type { RemoteProviderId } from './types'

const REMOTE_PROVIDERS: readonly RemoteProviderId[] = ['anthropic', 'openai']

const toModelRef = (provider: RemoteProviderId, id: string): string => `${provider}/${id}`

const parseModelRef = (ref: string): { provider: RemoteProviderId; id: string } | null => {
  const at = ref.indexOf('/')
  if (at <= 0) return null
  const provider = ref.slice(0, at)
  const id = ref.slice(at + 1)
  return (REMOTE_PROVIDERS as readonly string[]).includes(provider) && id
    ? { provider: provider as RemoteProviderId, id }
    : null
}

// Local GGUF ids contain no '/', so the two never collide.
const isRemoteRef = (ref: string | null | undefined): boolean => ref != null && parseModelRef(ref) != null

export { REMOTE_PROVIDERS, toModelRef, parseModelRef, isRemoteRef }

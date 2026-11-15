import type { RemoteProviderId } from './types'

/** Short provider names for pickers and group headers. */
const REMOTE_PROVIDER_LABEL: Record<RemoteProviderId, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
}

export { REMOTE_PROVIDER_LABEL }

import type { RemoteProviderId } from '@shared/remote-ai'

const PROVIDER_LABEL: Record<RemoteProviderId, string> = {
  anthropic: 'Anthropic (Claude)',
  openai: 'OpenAI',
}

const PROVIDERS: RemoteProviderId[] = ['anthropic', 'openai']

export { PROVIDER_LABEL, PROVIDERS }

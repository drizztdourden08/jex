import type { RemoteProviderId } from '@shared/remote-ai'
import type { CatalogEntry } from './AiModelPicker.type'

const BACKEND_LABEL: Record<string, string> = {
  cuda: 'NVIDIA GPU (CUDA)',
  vulkan: 'GPU (Vulkan)',
  metal: 'Apple GPU (Metal)',
  cpu: 'CPU only',
}

const ADD_HELP =
  'One list for every model. Local models run fully on your PC: no account, no key, nothing leaves your machine; bigger ones are smarter but need more disk and RAM, and each is a one-time download. Cloud models (Claude, OpenAI) are added instantly and use your own API key.'

const INSTALLED_HELP =
  'Grouped by provider. A cloud provider’s key is stored encrypted on this PC and sent only to that provider; while one of its models is active, messages and tool results go to it.'

/** Section header names in Settings (the chat picker uses the short shared labels). */
const PROVIDER_LABEL: Record<RemoteProviderId, string> = {
  anthropic: 'Anthropic (Claude)',
  openai: 'OpenAI',
}

/** The catalog button: local models download, cloud models are added, a provider entry opens its key. */
const ACTION_LABEL: Record<CatalogEntry['kind'], string> = {
  local: 'Download',
  remote: 'Add',
  provider: 'Add key',
}

export { BACKEND_LABEL, ADD_HELP, INSTALLED_HELP, PROVIDER_LABEL, ACTION_LABEL }

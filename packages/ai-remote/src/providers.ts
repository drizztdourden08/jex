import type { RemoteProviderId } from '@jex/shared/remote-ai/index'
import { anthropicAdapter } from './anthropic/adapter'
import { openaiAdapter } from './openai/adapter'
import type { ProviderAdapter } from './remote-llm.types'

const providers: Record<RemoteProviderId, ProviderAdapter> = {
  anthropic: anthropicAdapter,
  openai: openaiAdapter,
}

export { providers }

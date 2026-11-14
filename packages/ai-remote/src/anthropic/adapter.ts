import { AuthenticationError, PermissionDeniedError } from '@anthropic-ai/sdk'
import type { RemoteKeyCheck } from '@jex/shared/remote-ai'
import type { ProviderAdapter } from '../remote-llm.types'
import { forgetClient, makeClient } from './client'
import { capsFor, forgetCaps, listAnthropicModels } from './models'
import { streamStep } from './stream-step'

// A throwaway client, so a rejected key is never cached.
const verifyAnthropicKey = async (key: string): Promise<RemoteKeyCheck> => {
  try {
    await makeClient(key).models.list({ limit: 1 })
    return 'ok'
  } catch (e) {
    return e instanceof AuthenticationError || e instanceof PermissionDeniedError ? 'rejected' : 'unverified'
  }
}

const anthropicAdapter: ProviderAdapter = {
  id: 'anthropic',
  step: (ctx) => streamStep(ctx, capsFor(ctx.modelId)),
  listModels: listAnthropicModels,
  verifyKey: verifyAnthropicKey,
  forget: () => {
    forgetClient()
    forgetCaps()
  },
}

export { anthropicAdapter }

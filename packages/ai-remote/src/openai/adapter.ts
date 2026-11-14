import { AuthenticationError, PermissionDeniedError } from 'openai'
import type { RemoteKeyCheck } from '@jex/shared/remote-ai'
import type { ProviderAdapter } from '../remote-llm.types'
import { forgetClient, makeClient } from './client'
import { listOpenAiModels } from './models'
import { forgetReasoning } from './request'
import { streamStep } from './stream-step'

// A throwaway client, so a rejected key is never cached.
const verifyOpenAiKey = async (key: string): Promise<RemoteKeyCheck> => {
  try {
    await makeClient(key).models.list()
    return 'ok'
  } catch (e) {
    return e instanceof AuthenticationError || e instanceof PermissionDeniedError ? 'rejected' : 'unverified'
  }
}

const openaiAdapter: ProviderAdapter = {
  id: 'openai',
  step: streamStep,
  listModels: listOpenAiModels,
  verifyKey: verifyOpenAiKey,
  forget: () => {
    forgetClient()
    forgetReasoning()
  },
}

export { openaiAdapter }

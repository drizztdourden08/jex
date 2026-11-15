import type { LlmFailureKind, LlmStepOutcome } from '@jex/ai-contract'
import { parseModelRef, REMOTE_PROVIDERS, toModelRef } from '@jex/shared/remote-ai/index'
import type { RemoteKeyStatus, RemoteModelOption, RemoteProviderId } from '@jex/shared/remote-ai/index'
import { RECOMMENDED_MODEL_ID } from './anthropic/anthropic.constants'
import { providers } from './providers'
import type { ProviderModel, RemoteLlm, RemoteLlmDeps } from './remote-llm.types'

const PROVIDER_NAME: Record<RemoteProviderId, string> = { anthropic: 'Anthropic', openai: 'OpenAI' }

const fail = (kind: LlmFailureKind, provider: RemoteProviderId, message: string): LlmStepOutcome => ({
  ok: false,
  failure: { kind, provider, message },
})

const toOption = (provider: RemoteProviderId, m: ProviderModel, keyPresent: boolean): RemoteModelOption => ({
  ref: toModelRef(provider, m.id),
  provider,
  id: m.id,
  label: m.label,
  contextSize: m.caps.contextSize,
  recommended: provider === 'anthropic' && m.id === RECOMMENDED_MODEL_ID,
  keyPresent,
})

// Facade over the provider adapters: client caching, capabilities, retries and error
// mapping stay behind step / listModels / verifyKey / forget. step() never throws.
const createRemoteLlm = (deps: RemoteLlmDeps): RemoteLlm => {
  const { getKey, getEffort, log } = deps

  const step: RemoteLlm['step'] = async (req, onDelta, signal) => {
    const ref = parseModelRef(req.modelRef)
    if (!ref) return fail('bad_request', 'anthropic', 'Unknown model reference.')
    const key = await getKey(ref.provider)
    if (!key) return fail('auth', ref.provider, `No ${PROVIDER_NAME[ref.provider]} API key is set. Add it in Settings.`)
    try {
      return await providers[ref.provider].step({
        key,
        modelId: ref.id,
        effort: getEffort(),
        req,
        onDelta,
        signal,
        log,
      })
    } catch {
      // Adapters never throw; this guards a bug without leaking its text.
      return fail('unknown', ref.provider, `${PROVIDER_NAME[ref.provider]} request failed unexpectedly.`)
    }
  }

  const listFor = async (provider: RemoteProviderId, present: boolean): Promise<RemoteModelOption[]> => {
    try {
      const models = await providers[provider].listModels(present ? await getKey(provider) : null)
      return models.map((m) => toOption(provider, m, present))
    } catch {
      log('model list failed', { provider })
      return []
    }
  }

  const listModels: RemoteLlm['listModels'] = async (status: RemoteKeyStatus) =>
    (await Promise.all(REMOTE_PROVIDERS.map((p) => listFor(p, status[p].present)))).flat()

  return {
    step,
    listModels,
    verifyKey: (p, key) => providers[p].verifyKey(key),
    forget: (p) => providers[p].forget(),
  }
}

export { createRemoteLlm }

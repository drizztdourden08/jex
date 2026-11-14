import { parseModelRef } from '@jex/shared/remote-ai'
import type { AiModelStatus } from '@jex/shared/ai'
import { host } from '../host'

/** Model status for a remote ref: ready when its provider has a key, else an error that says so. */
const remoteModelStatus = (ref: string): AiModelStatus => {
  const parsed = parseModelRef(ref)
  if (!parsed) return { state: 'error', activeModelId: ref, error: `Unknown model: ${ref}` }
  if (host().llm.providers()[parsed.provider].present) {
    return { state: 'ready', activeModelId: ref, modelName: parsed.id }
  }
  return { state: 'error', activeModelId: ref, error: `Add your ${parsed.provider} API key in Settings to use this model.` }
}

export { remoteModelStatus }

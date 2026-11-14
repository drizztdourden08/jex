import type { RemoteModelOption } from '@shared/remote-ai'
import { keyStatus } from './keys'
import { remoteLlm } from './remote-llm'
import { getCachedModels, setCachedModels } from './model-cache'

const listRemoteModels = async (): Promise<RemoteModelOption[]> => {
  const hit = getCachedModels()
  if (hit) return hit
  const models = await remoteLlm().listModels(keyStatus())
  setCachedModels(models)
  return models
}

export { listRemoteModels }

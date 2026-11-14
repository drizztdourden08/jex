import type { ProviderModel } from '../remote-llm.types'
import { getClient } from './client'
import { CHAT_MODEL_PATTERN, EXCLUDED_MODEL_PATTERN, OPENAI_CAPS } from './openai.constants'

const isChatModel = (id: string): boolean => CHAT_MODEL_PATTERN.test(id) && !EXCLUDED_MODEL_PATTERN.test(id)

// A key is required; a failure propagates to the facade, which shows no models.
const listOpenAiModels = async (key: string | null): Promise<ProviderModel[]> => {
  if (!key) return []
  const out: ProviderModel[] = []
  for await (const m of getClient(key).models.list()) {
    if (isChatModel(m.id)) out.push({ id: m.id, label: m.id, caps: OPENAI_CAPS, created: m.created })
  }
  return out.sort((a, b) => b.created - a.created)
}

export { listOpenAiModels }

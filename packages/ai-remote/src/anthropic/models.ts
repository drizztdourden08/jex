import type { ModelInfo } from '@anthropic-ai/sdk/resources/models'
import type { ModelCaps, ProviderModel } from '../remote-llm.types'
import { DEFAULT_CAPS, PREFERRED_ORDER, STATIC_MODELS } from './anthropic.constants'
import { getClient } from './client'

// Caps by model id, filled by listModels and read by step().
const capsById = new Map<string, ModelCaps>()

const forgetCaps = (): void => capsById.clear()

const capsFor = (modelId: string): ModelCaps =>
  capsById.get(modelId) ??
  STATIC_MODELS.find((m) => m.id === modelId)?.caps ??
  { ...DEFAULT_CAPS, effort: !modelId.startsWith('claude-haiku-') }

// Reads capabilities defensively: any field may be missing on a new model.
const toProviderModel = (m: ModelInfo): ProviderModel => {
  const caps: ModelCaps = {
    adaptiveThinking: m.capabilities?.thinking?.types?.adaptive?.supported ?? DEFAULT_CAPS.adaptiveThinking,
    effort: m.capabilities?.effort?.supported ?? DEFAULT_CAPS.effort,
    maxOutput: m.max_tokens ?? DEFAULT_CAPS.maxOutput,
    contextSize: m.max_input_tokens ?? null,
  }
  return { id: m.id, label: m.display_name || m.id, caps, created: Date.parse(m.created_at) || 0 }
}

const rank = (id: string): number => {
  const at = PREFERRED_ORDER.indexOf(id)
  return at === -1 ? PREFERRED_ORDER.length : at
}

const sortModels = (models: ProviderModel[]): ProviderModel[] =>
  [...models].sort((a, b) => rank(a.id) - rank(b.id) || b.created - a.created)

const fetchModels = async (key: string): Promise<ProviderModel[]> => {
  const out: ProviderModel[] = []
  for await (const m of getClient(key).models.list({ limit: 100 })) {
    if (m.id.startsWith('claude-')) out.push(toProviderModel(m))
  }
  return out
}

// No key or any failure: the static list, so the picker still shows the defaults.
const listAnthropicModels = async (key: string | null): Promise<ProviderModel[]> => {
  if (!key) return sortModels(STATIC_MODELS)
  try {
    const models = await fetchModels(key)
    if (models.length === 0) return sortModels(STATIC_MODELS)
    models.forEach((m) => capsById.set(m.id, m.caps))
    return sortModels(models)
  } catch {
    return sortModels(STATIC_MODELS)
  }
}

export { listAnthropicModels, capsFor, forgetCaps }

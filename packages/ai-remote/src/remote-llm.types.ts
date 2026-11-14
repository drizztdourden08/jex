import type { HostLlm, LlmDelta, LlmStepOutcome, LlmStepRequest } from '@jex/ai-contract'
import type {
  RemoteEffort,
  RemoteKeyCheck,
  RemoteKeyStatus,
  RemoteModelOption,
  RemoteProviderId,
} from '@jex/shared/remote-ai'

interface RemoteLlmDeps {
  getKey: (p: RemoteProviderId) => string | null
  getEffort: () => RemoteEffort
  /** meta carries provider, kind, status and requestId only; never params, headers or keys. */
  log: (msg: string, meta?: Record<string, unknown>) => void
}

interface ModelCaps {
  adaptiveThinking: boolean
  effort: boolean
  maxOutput: number
  contextSize: number | null
}

interface ProviderModel {
  id: string
  label: string
  caps: ModelCaps
  created: number
}

interface StepCtx {
  key: string
  modelId: string
  effort: RemoteEffort
  req: LlmStepRequest
  onDelta: (d: LlmDelta) => void
  signal: AbortSignal
  log: RemoteLlmDeps['log']
}

interface ProviderAdapter {
  id: RemoteProviderId
  /** Never throws. */
  step: (ctx: StepCtx) => Promise<LlmStepOutcome>
  listModels: (key: string | null) => Promise<ProviderModel[]>
  verifyKey: (key: string) => Promise<RemoteKeyCheck>
  /** Drop the cached client and capabilities (the key changed). */
  forget: () => void
}

interface RemoteLlm {
  step: HostLlm['step']
  listModels: (status: RemoteKeyStatus) => Promise<RemoteModelOption[]>
  verifyKey: (p: RemoteProviderId, key: string) => Promise<RemoteKeyCheck>
  forget: (p: RemoteProviderId) => void
}

export type { RemoteLlmDeps, ModelCaps, ProviderModel, StepCtx, ProviderAdapter, RemoteLlm }

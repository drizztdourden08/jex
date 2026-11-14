// HostLlm: the port the downloaded engine plugin sees. It is a thin binding of
// @jex/ai-remote to the key store; the plugin never gets a key or an SDK.
import type { HostLlm } from '@jex/ai-contract'
import { keyStatus } from './keys'
import { remoteLlm } from './remote-llm'
import { listRemoteModels } from './models'

const createHostLlm = (): HostLlm => ({
  providers: keyStatus,
  listModels: listRemoteModels,
  step: (req, onDelta, signal) => remoteLlm().step(req, onDelta, signal),
})

export { createHostLlm }

// The one RemoteLlm for the app. The log hook receives provider/kind/status/requestId
// meta only (never params, headers or keys), and prefixes it for the console.
import { createRemoteLlm } from '@jex/ai-remote'
import type { RemoteLlm } from '@jex/ai-remote'
import { getKey } from './keys'
import { getEffort } from './effort'

let instance: RemoteLlm | null = null

const remoteLlm = (): RemoteLlm =>
  (instance ??= createRemoteLlm({
    getKey,
    getEffort,
    log: (msg, meta) => console.log(`[ai-remote] ${msg}`, meta ?? ''),
  }))

export { remoteLlm }

import { isRemoteRef } from '@jex/shared/remote-ai/index'
import type { ContextStatus } from '@jex/shared/agent'
import { activeModelRef } from '../model/catalog'
import { getRemoteSession } from './remote/remote-session'
import { localContextStatus } from './session'

/** Context-window usage for the in-chat meter, from whichever model is active. A remote
 *  model with no reported window gives contextSize 0 (the UI shows tokens only). */
const contextStatus = (): ContextStatus => {
  const ref = activeModelRef()
  if (!isRemoteRef(ref)) return localContextStatus()
  const s = getRemoteSession()
  const u = s?.lastUsage
  const usedTokens = u ? u.inputTokens + u.cacheReadTokens + u.cacheWriteTokens + u.outputTokens : 0
  return { usedTokens, contextSize: s?.contextSize ?? 0, modelId: ref, usage: s?.totalUsage }
}

export { contextStatus }

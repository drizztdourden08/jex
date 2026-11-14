import type { BrowserWindow } from 'electron'
import { isRemoteRef } from '@jex/shared/remote-ai'
import type { AiStreamEvent } from '@jex/shared/agent'
import { activeModelRef } from '../model/catalog'
import { localRuntimeAvailable, LOCAL_RUNTIME_MISSING } from '../model/runtime'
import { runLocalTurn } from './local/local-turn'
import { runRemoteTurn } from './remote'

/**
 * Run one user turn on the active model: the remote loop for a `provider/id` ref,
 * the node-llama-cpp loop otherwise. Streams via `emit`, resolves with the final text.
 */
const chatTurn = async (
  turnId: string,
  message: string,
  window: BrowserWindow | null,
  emit: (e: AiStreamEvent) => void,
): Promise<string> => {
  if (isRemoteRef(activeModelRef())) return runRemoteTurn(turnId, message, window, emit)
  if (!(await localRuntimeAvailable())) {
    emit({ turnId, type: 'error', error: LOCAL_RUNTIME_MISSING })
    return ''
  }
  return runLocalTurn(turnId, message, window, emit)
}

export { chatTurn }

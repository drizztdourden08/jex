// Remote-model IPC: key status/set/clear, the model list, the added (installed) remote
// models, and the effort setting. Keys flow renderer -> main only; every reply is
// status/metadata, never a key.
import { ipcMain } from 'electron'
import type { RemoteEffort, RemoteProviderId } from '@shared/remote-ai'
import { REMOTE_PROVIDERS } from '@shared/remote-ai'
import {
  addRemote,
  clearProviderKey,
  getEffort,
  keyStatus,
  listAdded,
  listRemoteModels,
  removeRemote,
  setEffort,
  setProviderKey,
} from '../ai-remote'
import { getEngine } from '../ai-host/engine'
import { activateIfNoUsable } from '../ai-remote/activate-added'

const assertProvider = (p: unknown): RemoteProviderId => {
  if (!(REMOTE_PROVIDERS as readonly unknown[]).includes(p)) throw new Error('Unknown provider.')
  return p as RemoteProviderId
}

const registerAiRemoteHandlers = (): void => {
  ipcMain.handle('ai:remote:keyStatus', () => keyStatus())
  ipcMain.handle('ai:remote:setKey', (_e, provider: RemoteProviderId, key: string) =>
    setProviderKey(assertProvider(provider), key),
  )
  ipcMain.handle('ai:remote:clearKey', (_e, provider: RemoteProviderId) =>
    clearProviderKey(assertProvider(provider)),
  )
  ipcMain.handle('ai:remote:models', () => listRemoteModels())
  ipcMain.handle('ai:remote:added', () => listAdded(getEngine()?.modelStatus().activeModelId))
  ipcMain.handle('ai:remote:add', async (_e, ref: string) => {
    const refs = addRemote(String(ref))
    await activateIfNoUsable(String(ref))
    return refs
  })
  ipcMain.handle('ai:remote:remove', (_e, ref: string) => removeRemote(String(ref)))
  ipcMain.handle('ai:remote:getEffort', () => getEffort())
  ipcMain.handle('ai:remote:setEffort', (_e, effort: RemoteEffort) => setEffort(effort))
}

export { registerAiRemoteHandlers }

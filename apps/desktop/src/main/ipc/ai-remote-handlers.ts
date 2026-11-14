// Remote-model IPC: key status/set/clear, the model list, and the effort setting.
// Keys flow renderer -> main only; every reply is status/metadata, never a key.
import { ipcMain } from 'electron'
import type { RemoteEffort, RemoteProviderId } from '@shared/remote-ai'
import { REMOTE_PROVIDERS } from '@shared/remote-ai'
import { clearProviderKey, getEffort, keyStatus, listRemoteModels, setEffort, setProviderKey } from '../ai-remote'

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
  ipcMain.handle('ai:remote:getEffort', () => getEffort())
  ipcMain.handle('ai:remote:setEffort', (_e, effort: RemoteEffort) => setEffort(effort))
}

export { registerAiRemoteHandlers }

import { ipcRenderer } from 'electron'
import type {
  RemoteEffort,
  RemoteKeyStatus,
  RemoteModelOption,
  RemoteProviderId,
  RemoteSetKeyResult,
} from '@shared/remote-ai'
import type { IpcApi } from '@shared/ipc/api'

// The `ai.remote` slice of the bridge: invoke only, no logic. Keys travel renderer ->
// main on setKey and are never returned.
const aiRemoteApi = {
  keyStatus: (): Promise<RemoteKeyStatus> => ipcRenderer.invoke('ai:remote:keyStatus'),
  setKey: (provider: RemoteProviderId, key: string): Promise<RemoteSetKeyResult> =>
    ipcRenderer.invoke('ai:remote:setKey', provider, key),
  clearKey: (provider: RemoteProviderId): Promise<RemoteKeyStatus> =>
    ipcRenderer.invoke('ai:remote:clearKey', provider),
  models: (): Promise<RemoteModelOption[]> => ipcRenderer.invoke('ai:remote:models'),
  added: (): Promise<string[]> => ipcRenderer.invoke('ai:remote:added'),
  add: (ref: string): Promise<string[]> => ipcRenderer.invoke('ai:remote:add', ref),
  remove: (ref: string): Promise<string[]> => ipcRenderer.invoke('ai:remote:remove', ref),
  getEffort: (): Promise<RemoteEffort> => ipcRenderer.invoke('ai:remote:getEffort'),
  setEffort: (effort: RemoteEffort): Promise<void> => ipcRenderer.invoke('ai:remote:setEffort', effort),
} satisfies IpcApi['ai']['remote']

export { aiRemoteApi }

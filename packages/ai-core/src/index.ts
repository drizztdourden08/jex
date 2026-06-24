// Public surface of the AI engine — what the desktop host's ai:* IPC handlers call.
// The host injects its capabilities once via setHost(); everything else mirrors the
// functions the app used to import from src/main/ai/*.

export { setHost } from './host'
export { createAiPlugin } from './plugin'
export {
  chatTurn,
  resetChat,
  cancelTurn,
  resolveConfirm,
  contextStatus,
  setPermissionMode,
  getPermissionMode,
  setUiDispatcher,
} from './agent'
export {
  setContextLevel,
  getContextLevel,
  downloadModel,
  deleteModel,
  activeDownloads,
  activeModel,
  modelStatus,
  listModels,
  setActiveModel,
  backendInfo,
  warmupModel,
} from './model'
export { listToolInfo, setToolPolicy, setPolicyStore, registerAllTools } from './tools'
export { cudaStatus, installCuda } from './cuda'
export { buildFilter } from './query'

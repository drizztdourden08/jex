// The AiPlugin adapter — wraps the engine's functions in the @jex/ai-contract
// surface. init() wires the three host injection points (host capabilities, the UI
// dispatcher, and the push `emit`); every method then delegates to the same
// functions the app used to call in-process. This is what each built plugin's entry
// default-exports, and what the host loads in P3.

import type { AiPlugin, PluginEmit, UiDispatcher } from '@jex/ai-contract'
import type { HostServices } from '@jex/ai-contract'
import type { AiStreamEvent } from '@jex/shared/agent'
import { setHost } from './host'
import {
  chatTurn,
  resetChat,
  cancelTurn,
  resolveConfirm,
  contextStatus,
  setPermissionMode,
  getPermissionMode,
  setUiDispatcher,
} from './agent'
import {
  setContextLevel,
  getContextLevel,
  downloadModel,
  deleteModel,
  activeDownloads,
  modelStatus,
  listModels,
  setActiveModel,
  backendInfo,
  warmupModel,
} from './model'
import { listToolInfo, setToolPolicy, setPolicyStore, registerAllTools } from './tools'
import { cudaStatus, installCuda } from './cuda'
import { buildFilter } from './query'
import type { ToolPolicy } from '@jex/shared/agent'

const createAiPlugin = (): AiPlugin => {
  let emit: PluginEmit = () => {}

  const init = async (opts: {
    host: HostServices
    emit: PluginEmit
    ui: UiDispatcher
    modelDir: string
  }): Promise<void> => {
    emit = opts.emit
    setHost(opts.host)
    setUiDispatcher(opts.ui)
    // Tool-policy persistence → the host's settings store; then register every tool
    // so the Settings panel can list them before the first chat.
    setPolicyStore({
      get: () => opts.host.settings.get<Record<string, ToolPolicy>>('aiToolPolicies') ?? {},
      set: (o) => opts.host.settings.set('aiToolPolicies', o),
    })
    registerAllTools()
  }

  return {
    apiVersion: 1,
    init,
    dispose: async () => {
      setUiDispatcher(null)
    },

    // Model + backend
    modelStatus: () => modelStatus(),
    backendInfo: () => backendInfo(),
    warmup: async () => {
      await warmupModel()
    },
    listModels: () => listModels(),
    setModel: async (id) => {
      await setActiveModel(id)
    },
    downloadModel: async (modelId) => {
      try {
        const id = await downloadModel((p) => emit('ai:downloadProgress', p), modelId)
        emit('ai:downloadDone', { modelId: id, ok: true })
      } catch (e) {
        emit('ai:downloadDone', {
          modelId,
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        })
        throw e
      }
    },
    activeDownloads: () => activeDownloads(),
    deleteModel: (id) => deleteModel(id),
    cudaStatus: () => cudaStatus(),
    installCuda: () => installCuda((status) => emit('ai:cudaProgress', status)),

    // Agent chat
    chatTurn: async (turnId, message) => {
      await chatTurn(turnId, message, null, (ev: AiStreamEvent) => emit('ai:stream', ev))
    },
    resetChat: () => {
      void resetChat()
    },
    cancel: () => cancelTurn(),
    contextStatus: () => contextStatus(),
    getContextLevel: () => getContextLevel(),
    setContextLevel: async (level) => {
      await setContextLevel(level)
    },
    getPermissionMode: () => getPermissionMode(),
    setPermissionMode: (mode) => setPermissionMode(mode),
    confirm: (callId, decision) => resolveConfirm(callId, decision),
    listTools: () => listToolInfo(),
    setToolPolicy: (name, policy) => setToolPolicy(name, policy),

    // NL → FilterSpec
    buildQuery: (prompt, vocab) => buildFilter(prompt, vocab),
  }
}

export { createAiPlugin }

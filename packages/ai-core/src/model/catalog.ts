import { host } from '../host'
import { join } from 'node:path'
import { existsSync, readdirSync } from 'node:fs'
import type { AiModelOption, AiModelStatus } from '@jex/shared/ai'
import { isRemoteRef, parseModelRef } from '@jex/shared/remote-ai/index'
import { MODELS, DEFAULT_MODEL_ID, findModel, type ModelDef } from '../models'
import { ENV_MODEL, modelsDir, disposeModel, getLoadedId, downloads } from './state'
import { remoteModelStatus } from './remote-status'
import { LOCAL_RUNTIME_MISSING, localRuntimeKnown } from './runtime'

/**
 * The selected model's ref: a remote `provider/id`, or a local model id (env override
 * wins, else remembered, else default). A stale remembered id falls back to the default.
 */
const activeModelRef = (): string => {
  if (ENV_MODEL) return ENV_MODEL.id
  const saved = host().db.getMeta<string>('aiActiveModelId')
  if (saved && (isRemoteRef(saved) || findModel(saved))) return saved
  return (findModel(DEFAULT_MODEL_ID) ?? MODELS[0]).id
}

/** The active LOCAL model definition. While a remote model is active this is the
 *  default local one (used only by the local code paths). */
const activeModel = (): ModelDef => {
  if (ENV_MODEL) return ENV_MODEL
  return findModel(host().db.getMeta<string>('aiActiveModelId')) ?? findModel(DEFAULT_MODEL_ID) ?? MODELS[0]
}

/** Remembered on-disk paths, keyed by model id. */
const modelPaths = (): Record<string, string> => {
  return host().db.getMeta<Record<string, string>>('aiModelPaths') ?? {}
}
const rememberPath = (id: string, path: string): void => {
  host().db.setMeta('aiModelPaths', { ...modelPaths(), [id]: path })
}
const forgetPath = (id: string): void => {
  const { [id]: _drop, ...rest } = modelPaths()
  host().db.setMeta('aiModelPaths', rest)
}

// One-time migration: pre-multi-model builds stored a single `aiModelPath` for the
// old Llama-3.2-3B default. Adopt it under that specific id (never under another
// model, which would mislabel the file) so existing installs don't re-download.
const migrateLegacyPath = (): void => {
  if (host().db.getMeta<Record<string, string>>('aiModelPaths')) return
  const legacy = host().db.getMeta<string>('aiModelPath')
  if (legacy && existsSync(legacy)) rememberPath('llama-3.2-3b-instruct', legacy)
}

/** Resolve the on-disk path for a model: remembered path if it still exists, else null. */
const resolveModelPath = (model: ModelDef): string | null => {
  migrateLegacyPath()
  const remembered = modelPaths()[model.id]
  if (remembered && existsSync(remembered)) return remembered
  // The env-override model isn't downloaded through us — adopt any .gguf present.
  if (model.id === 'env-override') {
    try {
      const gguf = readdirSync(modelsDir()).find((f) => f.toLowerCase().endsWith('.gguf'))
      if (gguf) {
        const full = join(modelsDir(), gguf)
        rememberPath(model.id, full)
        return full
      }
    } catch {
      /* dir doesn't exist yet */
    }
  }
  return null
}

const isInstalled = (model: ModelDef): boolean => {
  return resolveModelPath(model) != null
}

const modelStatus = (): AiModelStatus => {
  const ref = activeModelRef()
  if (isRemoteRef(ref)) return remoteModelStatus(ref)
  const model = activeModel()
  if (downloads().has(model.id)) return { state: 'downloading', activeModelId: model.id }
  const path = resolveModelPath(model)
  if (!path) return { state: 'absent', activeModelId: model.id }
  if (localRuntimeKnown() === false) return { state: 'error', activeModelId: model.id, error: LOCAL_RUNTIME_MISSING }
  return { state: 'ready', activeModelId: model.id, modelName: model.label }
}

/** The local catalog with live install/active flags, for the renderer picker. A local
 *  model is active only on an exact ref match (never while a remote model is active). */
const listModels = (): AiModelOption[] => {
  const activeRef = activeModelRef()
  const catalog = ENV_MODEL ? [ENV_MODEL, ...MODELS] : MODELS
  return catalog.map((m) => ({
    id: m.id,
    label: m.label,
    family: m.family,
    arch: m.arch,
    params: m.params,
    contextSize: m.contextSize,
    sizeGb: m.sizeGb,
    ramGb: m.ramGb,
    toolSupport: m.toolSupport,
    recommended: m.recommended,
    note: m.note,
    installed: isInstalled(m),
    active: m.id === activeRef,
  }))
}

/** Select the active model: a local id or a remote `provider/id` ref. Disposes any
 *  loaded local model that is no longer the one in use so the next call reloads. */
const setActiveModel = async (ref: string): Promise<void> => {
  if (!parseModelRef(ref) && !findModel(ref)) throw new Error(`Unknown model: ${ref}`)
  host().db.setMeta('aiActiveModelId', ref)
  if (getLoadedId() !== ref) await disposeModel()
}

export {
  activeModelRef,
  activeModel,
  modelPaths,
  rememberPath,
  forgetPath,
  resolveModelPath,
  isInstalled,
  modelStatus,
  listModels,
  setActiveModel,
}

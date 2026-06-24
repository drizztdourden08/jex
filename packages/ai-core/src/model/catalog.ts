import { host } from '../host'
import { join } from 'node:path'
import { existsSync, readdirSync } from 'node:fs'
import type { AiModelOption, AiModelStatus } from '@jex/shared/ai'
import { MODELS, DEFAULT_MODEL_ID, findModel, type ModelDef } from '../models'
import { ENV_MODEL, modelsDir, disposeModel, getLoadedId, downloads } from './state'

/** The model the user has selected (env override wins, else remembered, else default). */
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
  const model = activeModel()
  if (downloads().has(model.id)) return { state: 'downloading', activeModelId: model.id }
  const path = resolveModelPath(model)
  if (!path) return { state: 'absent', activeModelId: model.id }
  return { state: 'ready', activeModelId: model.id, modelName: model.label }
}

/** The catalog with live install/active flags, for the renderer picker. */
const listModels = (): AiModelOption[] => {
  const active = activeModel()
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
    active: m.id === active.id,
  }))
}

/** Select the active model. Disposes any loaded model so the next call reloads. */
const setActiveModel = async (id: string): Promise<void> => {
  if (!findModel(id)) throw new Error(`Unknown model: ${id}`)
  host().db.setMeta('aiActiveModelId', id)
  if (getLoadedId() !== id) await disposeModel()
}

export {
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

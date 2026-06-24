import { app } from 'electron'
import { join } from 'node:path'
import type { Llama, LlamaModel } from 'node-llama-cpp'
import type { ModelDef } from '../models'

/**
 * Baked-in local inference via node-llama-cpp. Models are NOT bundled (they're
 * GB-scale) — they're downloaded to AppData on first use. node-llama-cpp ships
 * prebuilt binaries, so there's no native build step. All inference runs here in
 * main.
 *
 * The active model is user-selectable (see models.ts + the Settings picker).
 * `AI_MODEL_URI` still overrides everything with a custom URI — handy for tests
 * with a tiny model (used by the SMOKE_AI path).
 */
const ENV_URI = process.env.AI_MODEL_URI

/** A synthetic model entry standing in for the AI_MODEL_URI override. */
const ENV_MODEL: ModelDef | null = ENV_URI
  ? {
      id: 'env-override',
      label: 'Custom (AI_MODEL_URI)',
      family: 'Qwen3.6',
      arch: 'dense',
      params: 'custom',
      uri: ENV_URI,
      sizeGb: 0,
      ramGb: 0,
      contextSize: 4096,
      toolSupport: 'generic',
      note: 'Set via AI_MODEL_URI',
    }
  : null

let _modelsDir = ''
const modelsDir = (): string => {
  if (!_modelsDir) _modelsDir = join(app.getPath('userData'), 'models')
  return _modelsDir
}

let _llama: Llama | null = null
let _model: LlamaModel | null = null
/** Id of the model currently held in memory, to detect a model switch. */
let _loadedId = ''
/** Compute backend in use: 'cuda' | 'vulkan' | 'metal' | 'cpu' (null until probed). */
let _backend: string | null = null
/** Real dedicated VRAM in bytes (nvidia-smi), or null if undetectable. Used to
 *  constrain the library's VRAM budget so it doesn't over-offload on hybrid GPUs. */
let _realVramBytes: number | null = null
/** In-flight downloads keyed by model id → live byte progress. Supports concurrent
 *  downloads so the UI can show per-model progress for several at once. */
const _downloads = new Map<string, { downloadedSize: number; totalSize: number }>()

const getLlamaRef = (): Llama | null => _llama
const setLlamaRef = (llama: Llama | null): void => {
  _llama = llama
}
const getBackend = (): string | null => _backend
const setBackend = (backend: string | null): void => {
  _backend = backend
}
const getRealVramBytes = (): number | null => _realVramBytes
const setRealVramBytes = (bytes: number | null): void => {
  _realVramBytes = bytes
}
const getModelRef = (): LlamaModel | null => _model
const setModelRef = (model: LlamaModel | null): void => {
  _model = model
}
const getLoadedId = (): string => _loadedId
const setLoadedId = (id: string): void => {
  _loadedId = id
}
const downloads = (): Map<string, { downloadedSize: number; totalSize: number }> => _downloads

const disposeModel = async (): Promise<void> => {
  const m = _model
  _model = null
  _loadedId = ''
  if (m) await m.dispose()
}

export { ENV_MODEL, modelsDir, disposeModel }
export {
  getLlamaRef,
  setLlamaRef,
  getBackend,
  setBackend,
  getRealVramBytes,
  setRealVramBytes,
  getModelRef,
  setModelRef,
  getLoadedId,
  setLoadedId,
  downloads,
}

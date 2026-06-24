import { host } from '../host'
import { existsSync } from 'node:fs'
import { mkdir, rm } from 'node:fs/promises'
import type { AiDownloadProgress } from '@jex/shared/ai'
import { MODELS, findModel } from '../models'
import { modelsDir, disposeModel, getLoadedId, downloads } from './state'
import { activeModel, modelPaths, rememberPath, forgetPath, isInstalled } from './catalog'

/** Snapshot of in-flight downloads (id → bytes), so a (re)mounting UI can hydrate. */
const activeDownloads = (): Record<string, AiDownloadProgress> => {
  const out: Record<string, AiDownloadProgress> = {}
  for (const [modelId, p] of downloads()) out[modelId] = { modelId, ...p }
  return out
}

/**
 * Download a model to AppData (skips if already present), reporting per-model byte
 * progress. Multiple models can download concurrently — each is tracked in
 * `_downloads` by id. Returns the downloaded model's id.
 */
const downloadModel = async (
  onProgress: (p: AiDownloadProgress) => void,
  modelId?: string,
): Promise<string> => {
  const model = modelId ? findModel(modelId) ?? activeModel() : activeModel()
  if (downloads().has(model.id)) throw new Error(`${model.label} is already downloading.`)
  downloads().set(model.id, { downloadedSize: 0, totalSize: 0 })
  try {
    await mkdir(modelsDir(), { recursive: true })
    const { createModelDownloader } = await import('node-llama-cpp')
    const downloader = await createModelDownloader({
      modelUri: model.uri,
      dirPath: modelsDir(),
      skipExisting: true,
      onProgress: ({ totalSize, downloadedSize }) => {
        downloads().set(model.id, { downloadedSize, totalSize })
        onProgress({ modelId: model.id, downloadedSize, totalSize })
      },
    })
    const path = await downloader.download()
    rememberPath(model.id, path)
    // If the active model isn't installed (e.g. the default points at a model the
    // user never downloaded), adopt this freshly-downloaded one so the assistant
    // works immediately instead of erroring on a missing file.
    if (!isInstalled(activeModel())) host().db.setMeta('aiActiveModelId', model.id)
    return model.id
  } finally {
    downloads().delete(model.id)
  }
}

/**
 * Delete a downloaded model's GGUF from disk and forget its remembered path. If
 * it's the model currently held in memory, dispose it first to release the file
 * lock (Windows won't delete an mmap'd file). No-op if it isn't installed.
 */
const deleteModel = async (id: string): Promise<void> => {
  const path = modelPaths()[id]
  if (getLoadedId() === id) await disposeModel()
  if (path && existsSync(path)) await rm(path, { force: true })
  forgetPath(id)
  // If we removed the active model, fall back to another installed one so the
  // assistant stays usable; if none remain, leave it — the UI prompts to download.
  if (activeModel().id === id) {
    const fallback = MODELS.find((m) => isInstalled(m))
    if (fallback) host().db.setMeta('aiActiveModelId', fallback.id)
  }
}

export { activeDownloads, downloadModel, deleteModel }

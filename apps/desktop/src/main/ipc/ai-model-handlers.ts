import { ipcMain } from 'electron'
import { getEngine, requireEngine } from '../ai-host/engine'
import type { AiVocab } from '@shared/ai'

/** AI model management for the baked-in local model (download/select/warmup/CUDA),
 *  delegated to the loaded engine plugin. */
const registerAiModelHandlers = (): void => {
  ipcMain.handle('ai:status', () => getEngine()?.modelStatus() ?? { state: 'absent' })
  ipcMain.handle('ai:backend', () => requireEngine().backendInfo())
  // Pre-load the model into memory (called when the chat panel opens) so the first
  // message doesn't pay the multi-GB load on top of inference.
  ipcMain.handle('ai:warmup', () => requireEngine().warmup())
  ipcMain.handle('ai:listModels', () => getEngine()?.listModels() ?? [])
  ipcMain.handle('ai:setModel', (_e, id: string) => requireEngine().setModel(id))
  ipcMain.handle('ai:downloadModel', (_e, modelId?: string) => requireEngine().downloadModel(modelId))
  ipcMain.handle('ai:downloads', () => getEngine()?.activeDownloads() ?? {})
  ipcMain.handle('ai:deleteModel', (_e, id: string) => getEngine()?.deleteModel(id))
  ipcMain.handle('ai:cudaStatus', () => requireEngine().cudaStatus())
  ipcMain.handle('ai:installCuda', () => requireEngine().installCuda())
  // Legacy one-shot NL→FilterSpec (still used by apply_filter / wishlist tools).
  ipcMain.handle('ai:buildQuery', (_e, prompt: string, vocab: AiVocab) =>
    requireEngine().buildQuery(prompt, vocab ?? {}),
  )
}

export { registerAiModelHandlers }

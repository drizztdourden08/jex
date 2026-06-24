import type { LlamaModel } from 'node-llama-cpp'
import { disposeModel, getModelRef, setModelRef, getLoadedId, setLoadedId } from './state'
import { activeModel, resolveModelPath } from './catalog'
import { ensureLlama } from './backend'
import { activeContextSize, createInferenceContext } from './context'

/** Load the active model into memory (reusing it across calls). */
const ensureModel = async (): Promise<LlamaModel> => {
  const model = activeModel()
  const loaded = getModelRef()
  if (loaded && getLoadedId() === model.id) return loaded
  if (loaded) await disposeModel() // active model changed under us
  const path = resolveModelPath(model)
  if (!path) throw new Error(`AI model "${model.label}" not downloaded yet.`)
  const llama = await ensureLlama()
  // Offload as many layers as fit, but tell auto-fit to RESERVE room for the KV
  // cache of the context we'll open — otherwise it greedily fills VRAM with weights
  // and createContext then OOMs ("failed to allocate buffer for kv cache"). With the
  // VRAM budget constrained to the real card (see ensureLlama), oversized models
  // offload partially and run the rest on CPU. If even that fails, fall back to a
  // pure-CPU load so a too-big model still runs (slowly) rather than not at all.
  let model_: LlamaModel
  try {
    model_ = await llama.loadModel({
      modelPath: path,
      gpuLayers: { fitContext: { contextSize: activeContextSize() } },
    })
  } catch {
    model_ = await llama.loadModel({ modelPath: path, gpuLayers: 0 })
  }
  setModelRef(model_)
  setLoadedId(model.id)
  return model_
}

/**
 * Pre-load the active model in the background (called at startup if one is
 * installed) so the FIRST chat doesn't pay the multi-GB load on top of inference.
 * Failures are swallowed — the next real call surfaces them.
 */
const warmupModel = async (): Promise<void> => {
  try {
    if (resolveModelPath(activeModel())) await ensureModel()
  } catch {
    /* surfaced on first real use */
  }
}

/**
 * Run one completion with a fresh chat session (independent per query). Creates +
 * disposes a context each call — used by the legacy NL→FilterSpec path. The
 * conversational agent uses a persistent session instead (see agent.ts).
 */
const complete = async (
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 512,
): Promise<string> => {
  const model = await ensureModel()
  const { LlamaChatSession } = await import('node-llama-cpp')
  const context = await createInferenceContext(model)
  try {
    const session = new LlamaChatSession({
      contextSequence: context.getSequence(),
      systemPrompt,
    })
    return await session.prompt(userPrompt, { maxTokens })
  } finally {
    await context.dispose()
  }
}

export { ensureModel, warmupModel, complete }

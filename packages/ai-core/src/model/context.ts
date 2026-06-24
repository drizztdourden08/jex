import type { LlamaContext, LlamaModel } from 'node-llama-cpp'
import type { ContextLevel } from '@jex/shared/agent'
import { activeModel } from './catalog'

/**
 * Per-session context-window level (not persisted). 'high' = the model's native
 * window; low/medium cap it (less memory, faster prompt eval, less history room).
 */
let _contextLevel: ContextLevel = 'high'
const setContextLevel = (level: ContextLevel): void => {
  _contextLevel = level
}
const getContextLevel = (): ContextLevel => {
  return _contextLevel
}

/** The context window to open for the active model, honoring the session level. */
const activeContextSize = (): number => {
  const native = activeModel().contextSize
  if (_contextLevel === 'low') return Math.min(native, 8192)
  if (_contextLevel === 'medium') return Math.min(native, 16384)
  return native
}

/**
 * Create an inference context with graceful fallbacks. `flashAttention` is a big
 * win on CUDA but fails to initialize on some Vulkan/CPU builds and newer model
 * archs, and a large context can exceed available VRAM — both surface as the
 * opaque "Failed to create context". So we try the fast path first, then
 * progressively safer ones (no flash-attn, then a smaller window) before failing.
 */
const createInferenceContext = async (model: LlamaModel): Promise<LlamaContext> => {
  const want = activeContextSize()
  const attempts = [
    { contextSize: want, flashAttention: true },
    { contextSize: want, flashAttention: false },
    { contextSize: Math.min(want, 8192), flashAttention: false },
    { contextSize: 4096, flashAttention: false },
  ]
  let lastErr: unknown
  for (let i = 0; i < attempts.length; i++) {
    try {
      const ctx = await model.createContext(attempts[i])
      // A fallback means the fast path (flash-attn / full window) didn't fit or
      // wasn't supported on this backend — worth a line so the cause isn't silent.
      if (i > 0) {
        console.log(
          `[ai] context created on fallback #${i} (contextSize=${attempts[i].contextSize}, flashAttention=${attempts[i].flashAttention})`,
        )
      }
      return ctx
    } catch (e) {
      lastErr = e
      console.log(
        `[ai] createContext attempt #${i} failed (contextSize=${attempts[i].contextSize}, flashAttention=${attempts[i].flashAttention}): ${e instanceof Error ? e.message : String(e)}`,
      )
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Failed to create an inference context.')
}

export { setContextLevel, getContextLevel, activeContextSize, createInferenceContext }

import type { LlamaContext, LlamaChatSession, LlamaContextSequence } from 'node-llama-cpp'
import type { ContextStatus } from '@jex/shared/agent'
import { ensureModel, activeModel, activeContextSize, createInferenceContext } from '../model'
import { buildSystemPrompt } from './system-prompt'
import { clearPendingConfirms } from './confirm'

/**
 * The conversational agent's persistent session + context-window state. Unlike the
 * legacy one-shot NL→FilterSpec path, this keeps a PERSISTENT LlamaChatSession
 * (multi-turn memory) and drives node-llama-cpp's grammar-constrained function
 * calling. This module owns the session lifecycle and the in-flight abort handle.
 */

let _context: LlamaContext | null = null
let _session: LlamaChatSession | null = null
let _sequence: LlamaContextSequence | null = null
let _sessionModelId = ''
/** Aborts the in-flight turn (on new chat / model switch). */
let _abort: AbortController | null = null

const getAbort = (): AbortController | null => _abort
const setAbort = (a: AbortController | null): void => {
  _abort = a
}

/** Live context-window usage for the in-chat meter. */
const contextStatus = (): ContextStatus => {
  const contextSize = activeContextSize()
  const usedTokens = _sequence ? _sequence.nextTokenIndex : 0
  return { usedTokens, contextSize, modelId: activeModel().id }
}

/** Build (or rebuild) the persistent session, reloading if the active model changed. */
const ensureSession = async (): Promise<LlamaChatSession> => {
  const modelId = activeModel().id
  if (_session && _sessionModelId === modelId) return _session
  await resetChat()
  const model = await ensureModel()
  const { LlamaChatSession } = await import('node-llama-cpp')
  _context = await createInferenceContext(model)
  _sequence = _context.getSequence()
  _session = new LlamaChatSession({
    contextSequence: _sequence,
    systemPrompt: buildSystemPrompt(),
  })
  _sessionModelId = modelId
  return _session
}

/**
 * Compaction: keep the conversation bounded so the window slides instead of
 * overflowing on long chats. We keep the leading system message + the most recent
 * exchanges (whole items, so a model turn and its tool results stay together).
 */
const MAX_HISTORY_ITEMS = 12
const trimHistory = (session: LlamaChatSession): void => {
  const h = session.getChatHistory()
  if (h.length <= MAX_HISTORY_ITEMS + 1) return
  const head = h[0]?.type === 'system' ? [h[0]] : []
  session.setChatHistory([...head, ...h.slice(-MAX_HISTORY_ITEMS)])
}

/** Stop the in-flight turn WITHOUT dropping the conversation. The abort surfaces in
 *  chat-turn as a clean finish, so the partial answer is kept and history stays intact. */
const cancelTurn = (): void => {
  _abort?.abort()
}

/** Drop the conversation + free the context (new chat, or model switch). */
const resetChat = async (): Promise<void> => {
  _abort?.abort()
  _abort = null
  // Resolve any dangling confirm so a blocked turn can unwind.
  clearPendingConfirms()
  _session = null
  _sequence = null
  _sessionModelId = ''
  const ctx = _context
  _context = null
  if (ctx) await ctx.dispose()
}

export { contextStatus, ensureSession, trimHistory, resetChat, cancelTurn, getAbort, setAbort }

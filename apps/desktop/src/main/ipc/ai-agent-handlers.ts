import { ipcMain } from 'electron'
import { getEngine, requireEngine } from '../ai-host/engine'
import type { ContextLevel, PermissionMode } from '@shared/agent'

/** The conversational AI agent: streaming turns, context/permission state, tools.
 *  Delegates to the loaded engine plugin (emit/UI are wired in the plugin's init). */
const registerAiAgentHandlers = (): void => {
  // One streaming turn: tokens + tool events flow on `ai:stream` (the plugin emits);
  // the handle resolves with the final assistant text when the turn ends.
  ipcMain.handle('ai:chatTurn', (_e, turnId: string, message: string) =>
    requireEngine().chatTurn(turnId, message),
  )
  ipcMain.handle('ai:resetChat', () => getEngine()?.resetChat())
  // Stop the current turn but keep the conversation (the partial answer is committed).
  ipcMain.handle('ai:cancel', () => getEngine()?.cancel())
  // Live context-window usage for the in-chat meter.
  ipcMain.handle('ai:contextStatus', () => getEngine()?.contextStatus() ?? null)
  // Per-session context level (low/medium/high) — recreates the context to apply.
  ipcMain.handle('ai:getContextLevel', () => getEngine()?.getContextLevel() ?? 'medium')
  ipcMain.handle('ai:setContextLevel', async (_e, level: ContextLevel) => {
    const engine = getEngine()
    if (!engine) return
    await engine.setContextLevel(level)
    engine.resetChat()
  })
  // Per-session permission override (default / allow-all / ask-all).
  ipcMain.handle('ai:getPermissionMode', () => getEngine()?.getPermissionMode() ?? 'default')
  ipcMain.handle('ai:setPermissionMode', (_e, mode: PermissionMode) => getEngine()?.setPermissionMode(mode))
  // The renderer's answer to a pending confirm card.
  ipcMain.handle('ai:confirm', (_e, callId: string, decision: 'once' | 'always' | 'deny') =>
    getEngine()?.confirm(callId, decision),
  )
  // Tool registry: list every tool + its policy, and set per-tool policy.
  ipcMain.handle('ai:listTools', () => getEngine()?.listTools() ?? [])
  ipcMain.handle('ai:setToolPolicy', (_e, name: string, policy: 'allow' | 'confirm' | 'disabled') =>
    getEngine()?.setToolPolicy(name, policy),
  )
}

export { registerAiAgentHandlers }

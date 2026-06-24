import type { AiStreamEvent, ConfirmDecision, PermissionMode } from '@jex/shared/agent'
import { effectivePolicy, setToolPolicy, type ToolDef } from '../tools'
import { _pendingConfirms, CONFIRM_TIMEOUT_MS } from './confirm'

/** Per-session permission override (not persisted): default | allow-all | ask-all. */
let _permMode: PermissionMode = 'default'

const setPermissionMode = (mode: PermissionMode): void => {
  _permMode = mode
}

const getPermissionMode = (): PermissionMode => _permMode

/** Decide whether a confirm-gated tool may run, asking the renderer if needed. */
const gate = async (
  tool: ToolDef,
  args: Record<string, unknown>,
  turnId: string,
  callId: string,
  emit: (e: AiStreamEvent) => void,
): Promise<boolean> => {
  // Per-session override wins: 'allow' runs everything silently; 'ask' confirms
  // everything; 'default' uses the saved per-tool policy.
  if (_permMode === 'allow') return true
  const policy = _permMode === 'ask' ? 'confirm' : effectivePolicy(tool)
  if (policy === 'allow') return true
  // 'confirm' → ask the user. ('disabled' tools are never offered to the model.)
  const summary = tool.summarize?.(args) ?? `Run ${tool.name}`
  emit({ turnId, type: 'confirm', callId, name: tool.name, args, summary })
  const decision = await new Promise<ConfirmDecision>((resolve) => {
    const timer = setTimeout(() => resolve('deny'), CONFIRM_TIMEOUT_MS)
    _pendingConfirms.set(callId, (d) => {
      clearTimeout(timer)
      _pendingConfirms.delete(callId)
      resolve(d)
    })
  })
  if (decision === 'always') setToolPolicy(tool.name, 'allow')
  return decision !== 'deny'
}

export { setPermissionMode, getPermissionMode, gate }

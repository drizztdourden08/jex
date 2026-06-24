import type { ConfirmDecision } from '@jex/shared/agent'

// Pending confirmations, keyed by callId, resolved when the renderer responds.
const _pendingConfirms = new Map<string, (d: ConfirmDecision) => void>()
const CONFIRM_TIMEOUT_MS = 5 * 60_000

const resolveConfirm = (callId: string, decision: ConfirmDecision): void => {
  _pendingConfirms.get(callId)?.(decision)
}

/** Resolve any dangling confirm so a blocked turn can unwind, then clear them. */
const clearPendingConfirms = (): void => {
  for (const resolve of _pendingConfirms.values()) resolve('deny')
  _pendingConfirms.clear()
}

export { _pendingConfirms, CONFIRM_TIMEOUT_MS, resolveConfirm, clearPendingConfirms }

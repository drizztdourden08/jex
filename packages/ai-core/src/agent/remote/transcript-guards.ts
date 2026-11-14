import type { RemoteSession } from './remote-session'

/** Drop everything added since `mark` (a failed first step removes the user item). */
const rollbackTo = (session: RemoteSession, mark: number): void => {
  session.transcript.length = Math.min(mark, session.transcript.length)
}

/** If the transcript ends on an assistant item whose tool calls never got results,
 *  close them with an error result so every provider accepts the next request. */
const closeDanglingCalls = (session: RemoteSession, reason: string): void => {
  const last = session.transcript[session.transcript.length - 1]
  if (!last || last.kind !== 'assistant' || last.toolCalls.length === 0) return
  session.transcript.push({
    kind: 'tool-results',
    results: last.toolCalls.map((c) => ({ callId: c.callId, ok: false, content: reason })),
  })
}

export { rollbackTo, closeDanglingCalls }

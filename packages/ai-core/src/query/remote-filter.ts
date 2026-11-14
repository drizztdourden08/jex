import type { AiVocab, QueryResult } from '@jex/shared/ai'
import { host } from '../host'
import { buildSystemPrompt, parseFilterSpec } from '../parse'
import { failureMessage } from '../agent/remote/failure-message'
import { toQueryResult } from './to-query-result'

/**
 * NL → FilterSpec on a remote model: one tool-less host.llm.step call (the contract
 * has no output-token cap, so the provider default applies). A failure returns an
 * empty result carrying the user-facing message in `raw` (never a key).
 */
const remoteFilter = async (modelRef: string, prompt: string, vocab: AiVocab): Promise<QueryResult> => {
  try {
    const out = await host().llm.step(
      {
        modelRef,
        conversationId: 'filter-query',
        system: buildSystemPrompt(vocab),
        tools: [],
        transcript: [{ kind: 'user', text: prompt }],
      },
      () => {},
      new AbortController().signal,
    )
    if (!out.ok) return { spec: {}, raw: failureMessage(out.failure), empty: true }
    const raw = out.step.assistant.text
    return toQueryResult(parseFilterSpec(raw), raw)
  } catch {
    return { spec: {}, raw: 'The remote model could not be reached.', empty: true }
  }
}

export { remoteFilter }

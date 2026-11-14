import type { AiVocab, QueryResult } from '@jex/shared/ai'
import { buildSystemPrompt, parseFilterSpec } from '../parse'
import { complete } from '../model'
import { toQueryResult } from './to-query-result'

/** NL → FilterSpec on the local node-llama-cpp model. */
const localFilter = async (prompt: string, vocab: AiVocab): Promise<QueryResult> => {
  const raw = await complete(buildSystemPrompt(vocab), prompt, 400)
  return toQueryResult(parseFilterSpec(raw), raw)
}

export { localFilter }

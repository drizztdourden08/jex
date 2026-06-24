import type { AiVocab, QueryResult } from '@jex/shared/ai'
import { buildSystemPrompt, parseFilterSpec } from './parse'
import { complete } from './model'

/**
 * NL → validated FilterSpec via the local model. The pure prompt/parse/sanitize
 * logic lives in ./parse (unit-testable); this just runs the model.
 */
const buildFilter = async (prompt: string, vocab: AiVocab = {}): Promise<QueryResult> => {
  const raw = await complete(buildSystemPrompt(vocab), prompt, 400)
  const spec = parseFilterSpec(raw)
  return { spec, raw, empty: Object.keys(spec).length === 0 }
}

export { buildFilter }

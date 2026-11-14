import type { AiVocab, QueryResult } from '@jex/shared/ai'
import { isRemoteRef } from '@jex/shared/remote-ai/index'
import { activeModelRef } from '../model/catalog'
import { localRuntimeAvailable, LOCAL_RUNTIME_MISSING } from '../model/runtime'
import { localFilter } from './local-filter'
import { remoteFilter } from './remote-filter'

/**
 * NL → validated FilterSpec on the active model: remote for a `provider/id` ref,
 * the local model otherwise. Prompt/parse logic is shared in ../parse.
 */
const buildFilter = async (prompt: string, vocab: AiVocab = {}): Promise<QueryResult> => {
  const ref = activeModelRef()
  if (isRemoteRef(ref)) return remoteFilter(ref, prompt, vocab)
  if (!(await localRuntimeAvailable())) return { spec: {}, raw: LOCAL_RUNTIME_MISSING, empty: true }
  return localFilter(prompt, vocab)
}

export { buildFilter }

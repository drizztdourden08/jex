// Remote model lists are cached for 10 minutes; a key change invalidates them.
import type { RemoteModelOption } from '@shared/remote-ai'

const TTL_MS = 10 * 60 * 1000

let cached: { at: number; models: RemoteModelOption[] } | null = null

const getCachedModels = (): RemoteModelOption[] | null =>
  cached && Date.now() - cached.at < TTL_MS ? cached.models : null

const setCachedModels = (models: RemoteModelOption[]): void => {
  cached = { at: Date.now(), models }
}

const invalidateModels = (): void => {
  cached = null
}

export { getCachedModels, setCachedModels, invalidateModels }

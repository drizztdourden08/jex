import type { AiModelOption } from '@shared/ai'
import type { RemoteModelOption, RemoteProviderId } from '@shared/remote-ai'

/**
 * One row of the "add a model" catalog. Local models are downloaded, remote ones are
 * added to the installed list, and a provider entry stands in for a provider that only
 * lists its models once a key is set (it reveals that provider's key field).
 */
type CatalogEntry =
  | { kind: 'local'; key: string; model: AiModelOption }
  | { kind: 'remote'; key: string; model: RemoteModelOption }
  | { kind: 'provider'; key: string; provider: RemoteProviderId }

export type { CatalogEntry }

import { useMemo } from 'react'
import { REMOTE_PROVIDERS } from '@shared/remote-ai'
import type { RemoteKeyStatus, RemoteModelOption, RemoteProviderId } from '@shared/remote-ai'
import { toInstalledRemote } from '@/lib/ai/installedRemote'

// Which cloud provider sections the installed table shows, each with its added models: a
// provider appears once it has an added model, a saved key, or the user asked for its key.
const useProviderSections = (
  added: string[],
  models: RemoteModelOption[],
  status: RemoteKeyStatus | null,
  revealed: RemoteProviderId[],
) =>
  useMemo(() => {
    const installed = toInstalledRemote(added, models, status)
    return REMOTE_PROVIDERS.map((provider) => ({
      provider,
      models: installed.filter((m) => m.provider === provider),
    })).filter((s) => s.models.length > 0 || status?.[s.provider].present || revealed.includes(s.provider))
  }, [added, models, status, revealed])

export { useProviderSections }

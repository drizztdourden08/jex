import { useNavigate } from 'react-router-dom'
import { useUiToolHost } from '@/lib/ai/uiToolHost'
import { useLibrary } from '@/hooks/useLibrary'
import { useWishlistGroups } from '@/hooks/useWishlistGroups'
import { buildFilterHandlers } from './buildFilterHandlers'
import { buildRandomizerHandler } from './buildRandomizerHandler'
import { buildStoreHandlers } from './buildStoreHandlers'
import { buildWishlistGroupHandlers } from './buildWishlistGroupHandlers'

/**
 * Host for `ui`-surface AI tools (the agent acting on renderer state). Loads the
 * mirror + wishlist groups once and hands them to per-domain handler builders
 * (filter/query are scope-aware: library, wishlist, or a sub-wishlist group).
 */
const useLayoutAiTools = () => {
  const navigate = useNavigate()
  const { games } = useLibrary()
  const { groups } = useWishlistGroups()

  useUiToolHost({
    navigate: (payload) => {
      const route = String(payload.route ?? '')
      if (!route.startsWith('/')) throw new Error(`Invalid route: ${route}`)
      navigate(route)
      return { navigated: route }
    },
    ...buildFilterHandlers({ navigate, games, groups }),
    ...buildRandomizerHandler({ navigate, games }),
    ...buildStoreHandlers({ navigate }),
    ...buildWishlistGroupHandlers({ navigate, games, groups }),
  })
}

export { useLayoutAiTools }

import { useCallback } from 'react'
import type { Game } from '@shared/library'
import { useGameDetail } from '@/hooks/useGameDetail'
import { useAutoplaySetting } from '@/hooks/useAutoplaySetting'
import { useOpenInStore } from '@/hooks/useOpenInStore'
import { useLaunchStatus } from '@/hooks/useLaunchStatus'
import type { LaunchAction } from '@shared/launch'

// Wait before loading so arrow-keying through the list does not fire a fetch per row.
const DETAIL_DELAY_MS = 350

/**
 * Detail data for the Library's right pane. The list's copy is shown at once; an
 * already-enriched game is never refetched here (the Store API is rate-limited and
 * the full page still refreshes stale metadata), only an unenriched one is loaded.
 */
const useLibraryDetail = (selected: Game | null) => {
  const { game, extrasLoading, sanitized, reqs } = useGameDetail({
    id: selected?.appid ?? 0,
    name: selected?.name,
    seed: selected,
    delayMs: DETAIL_DELAY_MS,
    freshMs: Infinity,
  })
  const autoplay = useAutoplaySetting()
  const openInStore = useOpenInStore()
  const appid = selected?.appid ?? 0
  const { launch, stop, statusOf } = useLaunchStatus(appid)
  const { busy: launchBusy, text: launchText, running } = statusOf(appid)
  const stopSelected = useCallback(() => stop(appid, selected?.name ?? 'this game'), [stop, appid, selected?.name])
  const launchSelected = useCallback((action: LaunchAction) => launch(appid, action), [launch, appid])
  const open = useCallback((url: string) => {
    window.api.app.openExternal(url).catch(() => {})
  }, [])

  // For the one render before the hook catches up with a new selection, show the
  // list's copy rather than the previous game's details.
  const current = !!game && !!selected && game.appid === selected.appid

  return {
    game: current ? game : selected,
    extrasLoading: current && extrasLoading,
    sanitized: current ? sanitized : null,
    reqs: current ? reqs : null,
    autoplay,
    open,
    openInStore,
    launchBusy,
    launchText,
    running,
    stopSelected,
    launchSelected,
  }
}

export { useLibraryDetail }

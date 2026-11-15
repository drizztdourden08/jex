import { useCallback, useEffect, useRef, useState } from 'react'
import { isFinalPhase } from '@shared/launch'
import type { LaunchAction, LaunchStatus } from '@shared/launch'

// A settled "Running" / "Sent to Steam" line fades out after this long.
const CLEAR_FINAL_MS = 8000

/**
 * Per-appid launch/install progress from main's `game:launchStatus` pushes. `launch`
 * starts one; `busy` is true while its phase is not final.
 */
const useLaunchStatus = () => {
  const [statuses, setStatuses] = useState<Record<number, LaunchStatus>>({})
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    const off = window.api.game.onLaunchStatus((s) => {
      const prev = timers.current.get(s.appid)
      if (prev) clearTimeout(prev)
      timers.current.delete(s.appid)
      setStatuses((cur) => ({ ...cur, [s.appid]: s }))
      if (isFinalPhase(s.phase)) {
        timers.current.set(
          s.appid,
          setTimeout(() => {
            setStatuses((cur) => {
              const { [s.appid]: _gone, ...rest } = cur
              return rest
            })
          }, CLEAR_FINAL_MS),
        )
      }
    })
    const pending = timers.current
    return () => {
      off()
      pending.forEach(clearTimeout)
      pending.clear()
    }
  }, [])

  const launch = useCallback((appid: number, action: LaunchAction) => {
    window.api.game.launch(appid, action).catch(() => {})
  }, [])

  const statusOf = useCallback(
    (appid: number) => {
      const s = statuses[appid]
      return { busy: !!s && !isFinalPhase(s.phase), text: s?.text ?? '' }
    },
    [statuses],
  )

  return { launch, statusOf }
}

export { useLaunchStatus }

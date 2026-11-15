import { useCallback, useEffect, useRef, useState } from 'react'
import { isFinalPhase } from '@shared/launch'
import type { LaunchAction, LaunchStatus } from '@shared/launch'

// A settled "Running" / "Sent to Steam" line fades out after this long.
const CLEAR_FINAL_MS = 8000

/**
 * Per-appid launch/install progress from main's `game:launchStatus` pushes. `launch`
 * starts one; `busy` is true while its phase is not final.
 */
const useLaunchStatus = (watchAppid?: number) => {
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

  const [running, setRunning] = useState<number[]>([])
  useEffect(() => {
    let alive = true
    window.api.game.running().then((ids) => alive && setRunning(ids)).catch(() => {})
    const off = window.api.game.onRunningChanged(setRunning)
    return () => {
      alive = false
      off()
    }
  }, [])

  // Ask main to also process-check the open game (covers games Steam does not flag).
  useEffect(() => {
    if (!watchAppid) return
    window.api.game.watchRunning(watchAppid).catch(() => {})
    return () => {
      window.api.game.watchRunning(null).catch(() => {})
    }
  }, [watchAppid])

  const launch = useCallback((appid: number, action: LaunchAction) => {
    window.api.game.launch(appid, action).catch(() => {})
  }, [])

  const stop = useCallback((appid: number, name: string) => {
    if (!window.confirm(`Stop ${name}? Unsaved progress may be lost.`)) return
    window.api.game.stop(appid).catch(() => {})
  }, [])

  const statusOf = useCallback(
    (appid: number) => {
      const s = statuses[appid]
      const busy = !!s && !isFinalPhase(s.phase)
      const isRunning = running.includes(appid)
      return { busy, running: isRunning, text: isRunning && !busy ? 'Running' : (s?.text ?? '') }
    },
    [statuses, running],
  )

  return { launch, stop, statusOf }
}

export { useLaunchStatus }

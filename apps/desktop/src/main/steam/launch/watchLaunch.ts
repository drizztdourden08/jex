import { isFinalPhase } from '@shared/launch'
import type { LaunchAction, LaunchStatus } from '@shared/launch'
import { POLL_MS } from './launch.constants'
import { nextStatus } from './nextStatus'
import { readSteamState } from './readSteamState'

const watchers = new Map<number, () => void>()

/**
 * Poll Steam's registry about once a second for one appid and report each status
 * change via `emit`. Bounded: stops on a final phase or the action's timeout. One
 * watcher per appid; starting another cancels the previous.
 */
const watchLaunch = (appid: number, action: LaunchAction, emit: (s: LaunchStatus) => void): void => {
  watchers.get(appid)?.()
  let cancelled = false
  let timer: NodeJS.Timeout | undefined
  const startedAt = Date.now()
  let tick = 0
  let wasInstalled = false
  let last = ''

  const stop = () => {
    cancelled = true
    if (timer) clearTimeout(timer)
    if (watchers.get(appid) === stop) watchers.delete(appid)
  }
  watchers.set(appid, stop)

  const step = async () => {
    const state = await readSteamState(appid)
    if (cancelled) return
    if (tick === 0) wasInstalled = state.installed
    const status = nextStatus({ appid, action, state, tick, elapsedMs: Date.now() - startedAt, wasInstalled })
    tick++
    if (status.phase !== last) {
      last = status.phase
      emit(status)
    }
    if (isFinalPhase(status.phase)) return stop()
    timer = setTimeout(() => void step(), POLL_MS)
  }
  void step()
}

export { watchLaunch }

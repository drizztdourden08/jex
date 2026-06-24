import { getMeta, setMeta } from '../../db/database'
import { state } from './state'

const loadTiming = (): void => {
  if (state.timingLoaded) return
  state.timeSum = getMeta<number>('enrichTimeSum') ?? 0
  state.timeCount = getMeta<number>('enrichTimeCount') ?? 0
  state.recentTimes = getMeta<number[]>('enrichRecentTimes') ?? []
  state.timingLoaded = true
}

const saveTiming = (): void => {
  setMeta('enrichTimeSum', state.timeSum, false)
  setMeta('enrichTimeCount', state.timeCount, false)
  setMeta('enrichRecentTimes', state.recentTimes, false)
}

const recordGameTime = (dt: number): void => {
  if (dt <= 0 || dt > 5 * 60_000) return
  state.timeSum += dt
  state.timeCount++
  state.recentTimes.push(dt)
  while (state.recentTimes.length > 10) state.recentTimes.shift()
}

const perGameAvgMs = (): number | null => {
  const allAvg = state.timeCount > 0 ? state.timeSum / state.timeCount : null
  const recentAvg = state.recentTimes.length
    ? state.recentTimes.reduce((a, b) => a + b, 0) / state.recentTimes.length
    : null
  if (allAvg != null && recentAvg != null) return 0.25 * allAvg + 0.75 * recentAvg
  return recentAvg ?? allAvg
}

export { loadTiming, saveTiming, recordGameTime, perGameAvgMs }

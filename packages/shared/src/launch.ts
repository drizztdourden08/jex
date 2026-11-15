type LaunchAction = 'run' | 'install'

type LaunchPhase =
  | 'opening'
  | 'updating'
  | 'starting'
  | 'running'
  | 'installDialog'
  | 'installing'
  | 'done'
  | 'timeout'
  | 'error'

/** A progress line for one launch/install click, pushed main to renderer. */
type LaunchStatus = {
  appid: number
  action: LaunchAction
  phase: LaunchPhase
  text: string
}

const FINAL_PHASES: readonly LaunchPhase[] = ['running', 'done', 'timeout', 'error']

/** True once the watcher has stopped (no further updates for this click). */
const isFinalPhase = (phase: LaunchPhase): boolean => FINAL_PHASES.includes(phase)

export { isFinalPhase }
export type { LaunchAction, LaunchPhase, LaunchStatus }

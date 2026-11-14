/** Shown wherever a local-model feature needs node-llama-cpp and it is absent. */
const LOCAL_RUNTIME_MISSING = 'The local runtime is not installed. Install the local AI backend, or use a remote model.'

let probe: Promise<boolean> | null = null
let known: boolean | null = null

/** Whether node-llama-cpp can be loaded here. Probed once (a dynamic import), then memoised. */
const localRuntimeAvailable = (): Promise<boolean> => {
  if (!probe) {
    probe = import('node-llama-cpp').then(
      () => {
        known = true
        return true
      },
      () => {
        known = false
        return false
      },
    )
  }
  return probe
}

/** The probe result if it has finished, else null (never triggers the probe). */
const localRuntimeKnown = (): boolean | null => known

/** Throws the clear "not installed" error when the local runtime is absent. */
const requireLocalRuntime = async (): Promise<void> => {
  if (!(await localRuntimeAvailable())) throw new Error(LOCAL_RUNTIME_MISSING)
}

export { LOCAL_RUNTIME_MISSING, localRuntimeAvailable, localRuntimeKnown, requireLocalRuntime }

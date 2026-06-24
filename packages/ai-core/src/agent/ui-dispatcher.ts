/** Renderer dispatcher for `ui`-surface tools — wired by the IPC layer (Phase 2). */
type UiDispatcher = (action: string, payload: unknown) => Promise<unknown>

let _uiDispatch: UiDispatcher | null = null

const setUiDispatcher = (fn: UiDispatcher | null): void => {
  _uiDispatch = fn
}

const getUiDispatcher = (): UiDispatcher | null => _uiDispatch

export { setUiDispatcher, getUiDispatcher }
export type { UiDispatcher }

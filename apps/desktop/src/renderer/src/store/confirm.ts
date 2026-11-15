import { create } from 'zustand'

type ConfirmOptions = {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
}

type ConfirmRequest = ConfirmOptions & { resolve: (ok: boolean) => void }

/**
 * Promise-based confirm service: `await askConfirm({...})` from anywhere (hooks,
 * handlers). One request at a time; a new one resolves the previous as false. The
 * ConfirmHost view renders the dialog from `request`.
 */
interface ConfirmState {
  request: ConfirmRequest | null
  ask: (opts: ConfirmOptions) => Promise<boolean>
  settle: (ok: boolean) => void
}

const useConfirm = create<ConfirmState>((set, get) => ({
  request: null,
  ask: (opts) =>
    new Promise<boolean>((resolve) => {
      get().request?.resolve(false)
      set({ request: { ...opts, resolve } })
    }),
  settle: (ok) => {
    const { request } = get()
    if (!request) return
    set({ request: null })
    request.resolve(ok)
  },
}))

const askConfirm = (opts: ConfirmOptions): Promise<boolean> => useConfirm.getState().ask(opts)

export { useConfirm, askConfirm }
export type { ConfirmOptions }

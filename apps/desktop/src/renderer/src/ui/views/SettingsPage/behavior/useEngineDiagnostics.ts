import { useCallback, useEffect, useState } from 'react'
import type { EngineDiagnostics } from '@shared/ai'
import { ipcErrorText } from '@/lib/ipc/ipcErrorText'
import { askConfirm } from '@/store/confirm'

// Troubleshooting state for the AI engine: installed vs published hashes, the last update
// check, and the check / open-log / reinstall actions. `onChecked` refreshes the plugin rows
// so an outdated plugin shows its Update checkbox (the existing install path).
const useEngineDiagnostics = (onChecked: () => void) => {
  const [diag, setDiag] = useState<EngineDiagnostics | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)

  useEffect(() => {
    window.api.ai.engineDiagnostics().then(setDiag).catch(() => {})
  }, [])

  const run = useCallback(async (action: () => Promise<void>) => {
    setBusy(true)
    setNote(null)
    try {
      await action()
    } catch (e) {
      setNote(ipcErrorText(e))
    } finally {
      setBusy(false)
    }
  }, [])

  const check = useCallback(
    () =>
      run(async () => {
        setDiag(await window.api.ai.checkUpdates())
        onChecked()
      }),
    [run, onChecked],
  )

  const reinstall = useCallback(
    () =>
      run(async () => {
        const ok = await askConfirm({ title: 'Reinstall the AI engine?', message: 'The engine is re-downloaded at the next start. Restart Jex to apply it.', confirmLabel: 'Reinstall', tone: 'primary' })
        if (!ok) return
        await window.api.ai.reinstallEngine()
        setDiag(await window.api.ai.engineDiagnostics())
        setNote('Restart Jex to reinstall the engine.')
      }),
    [run],
  )

  const openLog = useCallback(
    () =>
      run(async () => {
        const err = await window.api.ai.openLog()
        if (err) setNote(`Could not open the log: ${err}`)
      }),
    [run],
  )

  return { diag, busy, note, check, reinstall, openLog }
}

export { useEngineDiagnostics }

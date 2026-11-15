import { useCallback, useEffect, useState } from 'react'
import type { AiEngineStatus, EnginePluginInfo } from '@shared/ai'
import { ipcErrorText } from '@/lib/ipc/ipcErrorText'
import { askConfirm } from '@/store/confirm'

// Drives the AI-engine setup: status + the per-machine checklist (with installed state),
// install progress, and installing the selected set. Already-installed items show as
// done (no checkbox); the rest can be installed now or added later.
const useAiEngine = () => {
  const [status, setStatus] = useState<AiEngineStatus | null>(null)
  const [plugins, setPlugins] = useState<EnginePluginInfo[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [installing, setInstalling] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Pre-select the recommended rows that aren't installed yet (e.g. the base engine).
  const load = useCallback(async () => {
    try {
      const [s, list] = await Promise.all([window.api.ai.engineStatus(), window.api.ai.enginePlugins()])
      setStatus(s)
      setPlugins(list)
      setSelected(new Set(list.filter((p) => p.recommended && !p.installed).map((p) => p.id)))
      setLoadError(null)
    } catch (e) {
      setLoadError(ipcErrorText(e))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])
  useEffect(() => window.api.ai.onEngineProgress(setProgress), [])

  // Toggling CUDA also (de)selects its not-yet-installed Toolkit, so they install together.
  const toggle = useCallback(
    (id: string) => {
      setSelected((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        const cuda = plugins.find((p) => p.addOn)
        const toolkit = plugins.find((p) => p.manual && !p.installed)
        if (cuda && toolkit && id === cuda.id) {
          if (next.has(cuda.id)) next.add(toolkit.id)
          else next.delete(toolkit.id)
        }
        return next
      })
    },
    [plugins],
  )

  const install = useCallback(async () => {
    setInstalling(true)
    setError(null)
    try {
      await window.api.ai.installEngine([...selected])
      await load()
    } catch (e) {
      setError(ipcErrorText(e))
    } finally {
      setInstalling(false)
      setProgress(null)
    }
  }, [selected, load])

  const remove = useCallback(
    async (id: string) => {
      const ok = await askConfirm({ title: 'Remove this add-on?', message: 'It is deleted from disk. You can install it again later.', confirmLabel: 'Remove', tone: 'danger' })
      if (!ok) return
      setError(null)
      try {
        const result = await window.api.ai.removePlugin(id)
        setProgress(result === 'after-restart' ? 'Removed after restart.' : null)
        await load()
      } catch (e) {
        setError(ipcErrorText(e))
      }
    },
    [load],
  )

  return { remove, status, plugins, selected, toggle, installing, progress, error, install, loadError, retry: load }
}

export { useAiEngine }

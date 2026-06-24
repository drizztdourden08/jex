import { useEffect, useState } from 'react'
import type { DetectResult } from '@shared/library'
import type { SearchVocab } from '@shared/search'

const useSettings = () => {
  const [detect, setDetect] = useState<DetectResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [keySet, setKeySet] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [confirmDrop, setConfirmDrop] = useState(false)
  const [dropMsg, setDropMsg] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<Record<string, boolean>>({})
  const [vocab, setVocab] = useState<SearchVocab | null>(null)
  const [syncingVocab, setSyncingVocab] = useState(false)

  useEffect(() => {
    window.api.steam
      .detect()
      .then(setDetect)
      .finally(() => setLoading(false))
    window.api.secrets.has('steamApiKey').then(setKeySet)
    // Booleans default true unless explicitly false; autoplay defaults false.
    window.api.settings.getAll().then((all) =>
      setPrefs({
        autoplayVideos: all.autoplayVideos === true,
        autoSyncOnOpen: all.autoSyncOnOpen !== false,
        autoSyncDaily: all.autoSyncDaily !== false,
        autoFullResyncMonthly: all.autoFullResyncMonthly !== false,
      }),
    )
    window.api.search.getVocab().then(setVocab)
  }, [])

  const syncVocab = async () => {
    setSyncingVocab(true)
    try {
      setVocab(await window.api.search.syncVocab())
    } finally {
      setSyncingVocab(false)
    }
  }

  const saveKey = async () => {
    const v = keyInput.trim()
    if (!v) return
    try {
      await window.api.secrets.set('steamApiKey', v)
      setKeySet(true)
      setKeyInput('')
      setMsg('Key saved (encrypted on this PC).')
    } catch (e) {
      setMsg(`Could not save: ${String(e)}`)
    }
  }

  const clearKey = async () => {
    await window.api.secrets.clear('steamApiKey')
    setKeySet(false)
    setMsg('Key removed.')
  }

  const setPref = async (key: string, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }))
    await window.api.settings.set(key, value)
  }

  const dropMetadata = async () => {
    if (!confirmDrop) {
      setConfirmDrop(true)
      return
    }
    setConfirmDrop(false)
    setDropMsg('Dropping…')
    const n = await window.api.library.dropMetadata()
    setDropMsg(`Dropped metadata for ${n.toLocaleString()} games. Run a sync to re-fetch.`)
  }

  return {
    detect,
    loading,
    keySet,
    keyInput,
    setKeyInput,
    msg,
    confirmDrop,
    setConfirmDrop,
    dropMsg,
    prefs,
    vocab,
    syncingVocab,
    syncVocab,
    saveKey,
    clearKey,
    setPref,
    dropMetadata,
  }
}

export { useSettings }

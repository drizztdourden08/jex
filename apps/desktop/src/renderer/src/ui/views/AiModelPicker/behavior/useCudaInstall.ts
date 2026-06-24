import { useCallback, useEffect, useState } from 'react'
import type { CudaStatus } from '@shared/ai'

/**
 * CUDA install state for the picker (Custom Hook). Reports whether an NVIDIA GPU
 * is present without usable CUDA, and drives the one-click Toolkit install while
 * surfacing the current phase (for a spinner). winget's % is meaningless here, so
 * we show what it's doing rather than a progress bar. CUDA takes effect after an
 * app restart, so a successful install ends in a "restart to enable" state.
 */
const useCudaInstall = () => {
  const [status, setStatus] = useState<CudaStatus | null>(null)
  const [installing, setInstalling] = useState(false)
  const [message, setMessage] = useState('')
  const [installed, setInstalled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.api.ai.cudaStatus().then(setStatus).catch(() => {})
    return window.api.ai.onCudaProgress(setMessage)
  }, [])

  const install = useCallback(async () => {
    setError(null)
    setInstalled(false)
    setInstalling(true)
    setMessage('Starting the installer…')
    try {
      await window.api.ai.installCuda()
      setInstalled(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setInstalling(false)
      setMessage('')
    }
  }, [])

  return { status, installing, message, installed, error, install }
}

export { useCudaInstall }

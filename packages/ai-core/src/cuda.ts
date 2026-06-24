import { spawn } from 'node:child_process'
import { backendInfo } from './model'
import type { CudaStatus } from '@jex/shared/ai'

/**
 * Optional CUDA acceleration for NVIDIA GPUs. node-llama-cpp ships the CUDA
 * binding, but it needs NVIDIA's CUDA *runtime* (the Toolkit) — a system install,
 * not an npm package. When an NVIDIA GPU is present but CUDA isn't usable, the UI
 * offers a one-click install via winget; once installed (and the app restarted),
 * `getLlama({gpu:'auto'})` prefers CUDA automatically — faster than Vulkan and it
 * only sees the NVIDIA card (no iGPU mix-up).
 */
const cudaStatus = async (): Promise<CudaStatus> => {
  const be = await backendInfo().catch(() => null)
  const nvidiaGpu = (be?.deviceName?.toUpperCase().includes('NVIDIA') ?? false) || be?.vramGb != null
  return { nvidiaGpu, cudaReady: be?.backend === 'cuda', installable: nvidiaGpu && be?.backend !== 'cuda' }
}

// winget's % is meaningless here (it covers only the small network installer, not
// the long silent toolkit install), so we report the PHASE instead. Phases only
// advance, so the status never jumps backwards on noisy chunked output.
const PHASES = [
  { re: /download/i, msg: 'Downloading the CUDA Toolkit installer…' },
  { re: /verif|hash/i, msg: 'Verifying download…' },
  { re: /install/i, msg: 'Installing the CUDA Toolkit — this can take several minutes…' },
]

/**
 * Install the CUDA Toolkit via winget, reporting the current phase (for a spinner).
 * winget elevates the installer itself (a Windows UAC prompt appears). Resolves
 * when winget exits 0; CUDA takes effect after the app is restarted.
 */
const installCuda = (onStatus: (status: string) => void): Promise<void> =>
  new Promise((resolve, reject) => {
    onStatus('Starting the installer…')
    let phase = -1
    const child = spawn(
      'winget',
      [
        'install',
        '--id',
        'Nvidia.CUDA',
        '-e',
        '--accept-package-agreements',
        '--accept-source-agreements',
        '--disable-interactivity',
      ],
      { windowsHide: true },
    )
    const onData = (buf: Buffer) => {
      const text = buf.toString()
      for (let i = PHASES.length - 1; i > phase; i--) {
        if (PHASES[i].re.test(text)) {
          phase = i
          onStatus(PHASES[i].msg)
          break
        }
      }
    }
    child.stdout?.on('data', onData)
    child.stderr?.on('data', onData)
    child.on('error', reject)
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`CUDA install exited with code ${code}.`)),
    )
  })

export { cudaStatus, installCuda }

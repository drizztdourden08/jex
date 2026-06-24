// The NVIDIA CUDA Toolkit is a system install (not something we download as a plugin).
// We detect it by its install dir, and install it via winget — which elevates itself
// (a UAC prompt). CUDA takes effect after an app restart. Lives in the host so it can
// run during setup, before the engine plugin exists.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

const CUDA_BASE = 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA'

const isCudaToolkitInstalled = (): boolean => process.platform === 'win32' && existsSync(CUDA_BASE)

// winget's % covers only the small network installer, not the long silent toolkit
// install, so we report the PHASE instead (phases only advance — no backwards jumps).
const PHASES = [
  { re: /download/i, msg: 'Downloading the NVIDIA CUDA Toolkit…' },
  { re: /verif|hash/i, msg: 'Verifying the CUDA Toolkit download…' },
  { re: /install/i, msg: 'Installing the CUDA Toolkit — this can take several minutes…' },
]

const installCudaToolkit = (onStatus: (status: string) => void): Promise<void> =>
  new Promise((resolve, reject) => {
    onStatus('Starting the NVIDIA CUDA Toolkit installer…')
    let phase = -1
    const child = spawn(
      'winget',
      ['install', '--id', 'Nvidia.CUDA', '-e', '--accept-package-agreements', '--accept-source-agreements', '--disable-interactivity'],
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
      code === 0
        ? resolve()
        : reject(new Error(`CUDA Toolkit install exited with code ${code}.`)),
    )
  })

export { isCudaToolkitInstalled, installCudaToolkit }

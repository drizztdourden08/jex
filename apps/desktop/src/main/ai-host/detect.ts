// Lightweight pre-install GPU probe. GPU detection proper lives in the engine plugin
// (node-llama-cpp), which isn't installed yet during setup — so here we just ask
// nvidia-smi for the NVIDIA card's name + VRAM (to show them and decide whether to
// surface the CUDA opt-in). Both null when there's no NVIDIA card / nvidia-smi.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const detectNvidia = async (): Promise<{ name: string | null; vramMb: number | null }> => {
  if (process.platform !== 'win32') return { name: null, vramMb: null }
  try {
    const { stdout } = await execFileAsync(
      'nvidia-smi',
      ['--query-gpu=name,memory.total', '--format=csv,noheader,nounits'],
      { timeout: 4000, windowsHide: true },
    )
    const line = stdout.split('\n')[0]?.trim() ?? ''
    if (!line) return { name: null, vramMb: null }
    const [name, mem] = line.split(',').map((s) => s.trim())
    const vramMb = Number.parseInt(mem ?? '', 10)
    return { name: name || null, vramMb: Number.isFinite(vramMb) ? vramMb : null }
  } catch {
    return { name: null, vramMb: null }
  }
}

export { detectNvidia }

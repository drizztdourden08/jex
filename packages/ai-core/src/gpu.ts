import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Real GPU VRAM detection.
 *
 * node-llama-cpp's Vulkan backend enumerates EVERY adapter and sums their memory,
 * so on a hybrid system (discrete NVIDIA + an AMD/Intel iGPU) it reports a total
 * far larger than the discrete card actually has — which makes its VRAM-fitting
 * over-offload and then fail to allocate the KV cache. `nvidia-smi` reports the
 * true dedicated VRAM of the NVIDIA card, so we use it to constrain the budget.
 *
 * Returns null when nvidia-smi isn't present (no NVIDIA GPU, or driver tools not
 * installed) — callers then fall back to the library's own (less reliable) number.
 */
const execFileAsync = promisify(execFile)

const CUDA_BASE = 'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA'

/**
 * Make the CUDA runtime DLLs discoverable from THIS process even when its PATH is
 * stale. Windows doesn't refresh the environment of processes that were already
 * running when the Toolkit was installed, so a freshly-installed CUDA stays
 * invisible (the binding can't load cudart/cublas) until the machine reboots —
 * unless we prepend the newest CUDA bin dirs to our own PATH here. Then a plain app
 * restart is enough for `getLlama({gpu:'auto'})` to pick CUDA. No-op off Windows or
 * when CUDA isn't installed.
 */
const ensureCudaOnPath = (): void => {
  if (process.platform !== 'win32' || !existsSync(CUDA_BASE)) return
  const versions = readdirSync(CUDA_BASE)
    .filter((v) => /^v\d/.test(v))
    .sort()
    .reverse()
  const dirs: string[] = []
  for (const v of versions) {
    // CUDA 13 moved the runtime DLLs to bin\x64; older layouts keep them in bin.
    for (const sub of ['bin\\x64', 'bin']) {
      const dir = join(CUDA_BASE, v, sub)
      if (existsSync(dir)) dirs.push(dir)
    }
    if (dirs.length > 0) break // newest installed version only
  }
  const current = process.env.PATH ?? ''
  const missing = dirs.filter((d) => !current.includes(d))
  if (missing.length > 0) process.env.PATH = `${missing.join(';')};${current}`
}

const detectNvidiaVramMb = async (): Promise<number | null> => {
  try {
    const { stdout } = await execFileAsync(
      'nvidia-smi',
      ['--query-gpu=memory.total', '--format=csv,noheader,nounits'],
      { timeout: 4000, windowsHide: true },
    )
    const mb = Number.parseInt(stdout.split('\n')[0]?.trim() ?? '', 10)
    return Number.isFinite(mb) && mb > 0 ? mb : null
  } catch {
    return null
  }
}

export { detectNvidiaVramMb, ensureCudaOnPath }

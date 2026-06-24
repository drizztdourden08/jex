import type { Llama } from 'node-llama-cpp'
import type { AiBackendInfo } from '@jex/shared/ai'
import { detectNvidiaVramMb, ensureCudaOnPath } from '../gpu'
import { getLlamaRef, setLlamaRef, getBackend, setBackend, getRealVramBytes, setRealVramBytes } from './state'

/** Initialize llama (downloads/picks the best prebuilt backend) and cache it. */
const ensureLlama = async (): Promise<Llama> => {
  const cached = getLlamaRef()
  if (cached) return cached
  // Surface a freshly-installed CUDA to this process (stale-PATH workaround) so
  // 'auto' can pick it instead of Vulkan — CUDA is faster and only sees the NVIDIA
  // card (no iGPU mix-up, correct VRAM).
  ensureCudaOnPath()
  const { getLlama } = await import('node-llama-cpp')
  // Detect the discrete GPU's REAL VRAM first (nvidia-smi). The Vulkan backend sums
  // memory across all adapters (discrete + iGPU), so its own total over-reports on
  // hybrid systems and its VRAM-fitting then over-offloads → KV-cache OOM. We pass
  // `vramPadding` to subtract the phantom (non-discrete) memory so auto-fit budgets
  // only the real card and offloads partially (rest to CPU) for oversized models.
  const nvMb = await detectNvidiaVramMb()
  const realVramBytes = nvMb != null ? nvMb * 1024 * 1024 : null
  setRealVramBytes(realVramBytes)
  const realVram = realVramBytes
  // `gpu: 'auto'` picks CUDA/Vulkan/Metal if a prebuilt binary fits, else CPU.
  const llama = await getLlama({
    gpu: 'auto',
    ...(realVram != null
      ? {
          vramPadding: (total: number) =>
            Math.max(0, total - realVram) + Math.min(Math.round(realVram * 0.08), 1.2 * 1024 ** 3),
        }
      : {}),
  })
  setLlamaRef(llama)
  setBackend(llama.gpu === false ? 'cpu' : llama.gpu)
  return llama
}

/** The compute backend, primary device, and real VRAM — probing if needed. */
const backendInfo = async (): Promise<AiBackendInfo> => {
  const llama = await ensureLlama()
  const backend = getBackend() ?? 'cpu'
  const gpu = backend !== 'cpu'
  const deviceName = gpu ? (await llama.getGpuDeviceNames().catch(() => []))[0] : undefined
  const realVramBytes = getRealVramBytes()
  const vramGb = realVramBytes != null ? realVramBytes / 1024 ** 3 : undefined
  return { backend, gpu, deviceName, vramGb }
}

export { ensureLlama, backendInfo }

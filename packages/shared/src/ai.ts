import type { FilterSpec } from './filter'

type AiState = 'absent' | 'downloading' | 'ready' | 'error'

interface AiModelStatus {
  state: AiState
  modelName?: string
  /** Id of the model currently selected as active (see AiModelOption). */
  activeModelId?: string
  error?: string
}

interface AiDownloadProgress {
  /** Which model this progress is for (downloads can run concurrently). */
  modelId: string
  totalSize: number
  downloadedSize: number
}

/** Emitted once when a download settles, so the UI can clear progress + refresh. */
interface AiDownloadDone {
  modelId: string
  ok: boolean
  error?: string
}

/** The compute backend inference runs on. CPU is the slow fallback. */
interface AiBackendInfo {
  /** 'cuda' | 'vulkan' | 'metal' | 'cpu' */
  backend: string
  gpu: boolean
  /** Primary GPU device name, when known (e.g. "NVIDIA GeForce RTX 5070 Ti"). */
  deviceName?: string
  /** Real dedicated VRAM in GB, when detectable (nvidia-smi). Drives fit warnings
   *  and the per-GPU recommended model. Undefined when it can't be determined. */
  vramGb?: number
}

/** Whether the downloadable AI engine plugin is installed, and what the host would
 *  install for this machine — drives the first-run setup flow. */
interface AiEngineStatus {
  /** A plugin is installed and loaded (the AI is usable). */
  installed: boolean
  /** CPU arch ('x64' | 'arm64'). */
  arch: string
  /** Human CPU model (os.cpus), e.g. "AMD Ryzen 9 5900X" — shown in setup. */
  cpu: string
  /** Total system RAM in GB (rounded). */
  ramGb: number
  /** OS label, e.g. "Windows 11 Pro". */
  os: string
  /** Base plugin id this machine installs (CPU + Vulkan). */
  base: string
  /** Optional CUDA add-on plugin id (x64 only; null on arm64). */
  cuda: string | null
  /** Detected NVIDIA GPU name (nvidia-smi), or null when there's none. */
  gpu: string | null
  /** Detected NVIDIA VRAM in GB (rounded), or null. */
  vramGb: number | null
  /** Convenience: an NVIDIA GPU was detected (gpu != null) — surface the CUDA opt-in. */
  nvidiaGpu: boolean
}

/** One installable engine-plugin row for the setup checklist (transparency: exactly
 *  what gets downloaded + installed). Sizes are approximate (compressed). */
interface EnginePluginInfo {
  id: string
  /** Display name, e.g. "CPU + Vulkan". */
  name: string
  /** What's inside, e.g. "llama.cpp runtime + Vulkan backend". */
  packages: string
  /** Already installed/present — show a green check, no checkbox. */
  installed: boolean
  /** Real compressed download size in bytes (from the manifest), or null when unknown
   *  (manifest unreachable, or a manual prerequisite we don't download). */
  sizeBytes: number | null
  /** Short notes column. */
  notes: string
  /** Pre-checked + can't be deselected (the engine needs it). */
  recommended: boolean
  /** Optional add-on (e.g. CUDA), default unchecked. */
  addOn: boolean
  /** A prerequisite the user installs themselves (e.g. the CUDA Toolkit) — no checkbox,
   *  not downloaded by us. */
  manual?: boolean
}

/** CUDA acceleration availability for the AI model picker. */
interface CudaStatus {
  /** An NVIDIA GPU is present. */
  nvidiaGpu: boolean
  /** CUDA is usable now (the active backend is CUDA). */
  cudaReady: boolean
  /** Worth offering the install button (NVIDIA present, CUDA not yet active). */
  installable: boolean
}

/** How reliably a model handles tool/function calling. */
type ToolSupport = 'native' | 'generic'

/** Model architecture — dense or mixture-of-experts. */
type ModelArch = 'dense' | 'moe'

/**
 * A selectable local model in the picker. The catalog lives in main
 * (`src/main/ai/models.ts`); this is the renderer-facing view with live
 * install/active flags. The descriptor fields (family/arch/params/context) drive
 * the side-by-side comparison columns in the Settings picker.
 */
interface AiModelOption {
  id: string
  label: string
  /** Model family, e.g. "Qwen3.5" / "Qwen3.6". */
  family: string
  /** dense | moe. */
  arch: ModelArch
  /** Human param descriptor, e.g. "9B" or "35B · 3B active". */
  params: string
  /** Context window opened for this model (tokens). */
  contextSize: number
  /** Approx download size in GB (for the picker). */
  sizeGb: number
  /** Approx RAM/VRAM needed in GB (for the picker). */
  ramGb: number
  toolSupport: ToolSupport
  recommended?: boolean
  note?: string
  /** True if the GGUF is already downloaded to AppData. */
  installed: boolean
  /** True if this is the currently selected model. */
  active: boolean
}

interface AiVocab {
  genres?: string[]
  categories?: string[]
}

interface QueryResult {
  spec: FilterSpec
  raw: string
  /** True if the model declined / produced no parseable query. */
  empty?: boolean
}

export type {
  AiState,
  AiModelStatus,
  AiDownloadProgress,
  AiDownloadDone,
  AiBackendInfo,
  AiEngineStatus,
  EnginePluginInfo,
  CudaStatus,
  ToolSupport,
  ModelArch,
  AiModelOption,
  AiVocab,
  QueryResult,
}

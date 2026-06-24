// Display catalog for the setup checklist — what each plugin is and what's inside.
// Sizes + installed-state are NOT here: enginePlugins() attaches the real size from the
// manifest (local plugins/dist in dev, the latest release in prod) and the installed
// flag. Returns only the rows relevant to this machine.
import type { EnginePluginInfo } from '@shared/ai'
import { basePluginId, cudaPluginId } from './resolve'

type CatalogEntry = Omit<EnginePluginInfo, 'id' | 'sizeBytes' | 'installed'>

const CUDA_TOOLKIT_ID = 'nvidia-cuda-toolkit'

const CATALOG: Record<string, CatalogEntry> = {
  'ai-win-x64': {
    name: 'CPU + Vulkan',
    packages: 'llama.cpp runtime + Vulkan GPU backend',
    notes: 'Runs on any modern GPU — no extra setup',
    recommended: true,
    addOn: false,
  },
  'ai-win-arm64': {
    name: 'CPU + Vulkan (ARM)',
    packages: 'llama.cpp runtime + Vulkan GPU backend',
    notes: 'The build for this ARM PC',
    recommended: true,
    addOn: false,
  },
  'ai-win-x64-cuda': {
    name: 'CUDA acceleration',
    packages: 'NVIDIA CUDA backend (cuBLAS)',
    notes: 'Faster on NVIDIA. Tick the CUDA Toolkit too; restart after installing.',
    recommended: false,
    addOn: true,
  },
  [CUDA_TOOLKIT_ID]: {
    name: 'NVIDIA CUDA Toolkit',
    packages: 'CUDA runtime — installed from NVIDIA via winget',
    notes: 'Launches the NVIDIA installer (UAC prompt). Restart the app afterwards.',
    recommended: false,
    addOn: false,
    manual: true,
  },
}

const row = (id: string): EnginePluginInfo => ({ id, sizeBytes: null, installed: false, ...CATALOG[id] })

// The checklist rows for this machine: the arch's base (always) + the CUDA add-on and
// its Toolkit prerequisite when an NVIDIA GPU is present.
const enginePlugins = (nvidiaGpu: boolean): EnginePluginInfo[] => {
  const rows = [row(basePluginId())]
  const cuda = cudaPluginId()
  if (nvidiaGpu && cuda) {
    rows.push(row(cuda))
    rows.push(row(CUDA_TOOLKIT_ID))
  }
  return rows
}

// A real, downloadable plugin we know about (in the manifest) — vs a manual prerequisite
// (the CUDA Toolkit) or an unknown id from a skewed renderer. Used to route the install.
const isInstallablePlugin = (id: string): boolean => CATALOG[id] != null && !CATALOG[id].manual
const isManualId = (id: string): boolean => CATALOG[id]?.manual === true

export { enginePlugins, CUDA_TOOLKIT_ID, isInstallablePlugin, isManualId }

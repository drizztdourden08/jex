// Map the current machine to its plugin ids. The base plugin (CPU + Vulkan) is picked
// by CPU arch; CUDA is an add-on offered only on x64 (and only when an NVIDIA GPU is
// detected). Ids match plugins.config.mjs and the published manifest.
const basePluginId = (): string => (process.arch === 'arm64' ? 'ai-win-arm64' : 'ai-win-x64')

// x64 only — CUDA is layered on the x64 base.
const cudaPluginId = (): string | undefined => (process.arch === 'arm64' ? undefined : 'ai-win-x64-cuda')

// The JS-only engine (arch 'any'): agent + tools + remote models, no native runtime.
const ENGINE_PLUGIN_ID = 'ai-engine'

export { basePluginId, cudaPluginId, ENGINE_PLUGIN_ID }

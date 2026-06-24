// The plugin matrix. Each plugin bundles the SAME engine entry (@jex/ai-core's
// plugin-entry) and differs only in which @node-llama-cpp prebuilt backend(s) it
// carries in its own node_modules. The CPU plugins include Vulkan, so a GPU is used
// out of the box; CUDA is an opt-in add-on layered on the x64 base (Vulkan stays as
// the fallback). The host resolves which to install from the machine's arch + the
// user's backend choice (see the setup UX / manifest, P3).
const PLUGINS = [
  {
    id: 'ai-win-x64',
    arch: 'win-x64',
    backends: ['cpu', 'vulkan'],
    variants: ['win-x64-vulkan'],
  },
  {
    id: 'ai-win-arm64',
    arch: 'win-arm64',
    backends: ['cpu'],
    variants: ['win-arm64'],
  },
  {
    id: 'ai-win-x64-cuda',
    arch: 'win-x64',
    backends: ['cuda'],
    variants: ['win-x64-cuda', 'win-x64-cuda-ext'],
    addOn: true,
    requires: 'ai-win-x64',
  },
]

export { PLUGINS }

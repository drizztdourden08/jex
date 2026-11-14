const BACKEND_LABEL: Record<string, string> = {
  cuda: 'NVIDIA GPU (CUDA)',
  vulkan: 'GPU (Vulkan)',
  metal: 'Apple GPU (Metal)',
  cpu: 'CPU only',
}

const LOCAL_HELP =
  'Run fully on your PC: no account, no key, nothing leaves your machine. These are Qwen reasoning models; bigger ones are smarter and better with the app’s tools but need more disk and RAM. Each is a one-time download.'

export { BACKEND_LABEL, LOCAL_HELP }

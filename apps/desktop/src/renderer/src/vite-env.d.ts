/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEFAULT_CORS_PROXY?: string
  readonly VITE_DEFAULT_ANTHROPIC_MODEL?: string
  readonly VITE_DEFAULT_OPENAI_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

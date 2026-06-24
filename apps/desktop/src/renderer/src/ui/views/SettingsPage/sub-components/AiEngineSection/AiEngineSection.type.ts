import type { AiEngineStatus, EnginePluginInfo } from '@shared/ai'

interface AiEngineSectionProps {
  status: AiEngineStatus | null
  plugins: EnginePluginInfo[]
  selected: Set<string>
  toggle: (id: string) => void
  installing: boolean
  progress: string | null
  error: string | null
  install: () => void
}

export type { AiEngineSectionProps }

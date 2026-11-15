import type { EngineDiagnostics } from '@shared/ai'

interface TroubleshootGroupProps {
  diag: EngineDiagnostics | null
  busy: boolean
  note: string | null
  check: () => void
  reinstall: () => void
  openLog: () => void
}

export type { TroubleshootGroupProps }

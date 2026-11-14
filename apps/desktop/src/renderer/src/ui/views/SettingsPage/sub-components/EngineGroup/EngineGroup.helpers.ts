import type { AiEngineStatus } from '@shared/ai'

const fmtSize = (bytes: number | null): string => {
  if (bytes == null) return '—'
  const mb = bytes / 1024 / 1024
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`
}

// The detected machine on one line: CPU · GPU (VRAM) · RAM · OS (arch).
const describeMachine = (s: AiEngineStatus): string => {
  const gpu = s.gpu ? `${s.gpu}${s.vramGb ? ` (${s.vramGb} GB)` : ''}` : 'No NVIDIA GPU'
  return `${s.cpu} · ${gpu} · ${s.ramGb} GB RAM · ${s.os} (${s.arch})`
}

export { fmtSize, describeMachine }

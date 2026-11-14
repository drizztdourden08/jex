import type { LibraryStats } from '@shared/library'

const relTime = (ms: number): string => {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

const countsLine = (total: number, installed: number, owned: number): string => {
  if (total <= 0) return ''
  return `${total} games · ${installed} installed${owned > 0 ? ` · ${owned} owned` : ''}`
}

const statsLine = (stats: LibraryStats | null): string => {
  if (!stats || stats.total <= 0) return ''
  const parts = [`${stats.enriched} with full metadata`]
  if (stats.pending > 0) parts.push(`${stats.pending} pending`)
  if (stats.noStorePage > 0) parts.push(`${stats.noStorePage} no store page`)
  if (stats.lastEnrich) parts.push(`last synced ${relTime(stats.lastEnrich)}`)
  return parts.join(' · ')
}

export { countsLine, statsLine }

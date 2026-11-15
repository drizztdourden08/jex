// Per-plugin install record (userData/ai-plugins/<id>/.jex-installed.json), written after
// a verified install. Same file the dev refresh-engine script writes. Lets startup tell
// whether the installed plugin still matches the published manifest entry.
import { join } from 'node:path'
import { readFileSync, writeFileSync } from 'node:fs'
import type { PluginManifest } from '@jex/ai-contract'
import { installedDir } from './source'

type InstalledRecord = { id: string; sha256: string; version?: string }

const recordPath = (id: string): string => join(installedDir(id), '.jex-installed.json')

const writeRecord = (record: InstalledRecord): void => {
  writeFileSync(recordPath(record.id), JSON.stringify(record))
}

const readRecordSha = (id: string): string | null => {
  try {
    return (JSON.parse(readFileSync(recordPath(id), 'utf8')) as InstalledRecord).sha256 ?? null
  } catch {
    return null
  }
}

// True when the manifest lists the plugin and the install has no record or another hash.
const isOutdated = (id: string, manifest: PluginManifest): boolean => {
  const entry = manifest.plugins.find((p) => p.id === id)
  return !!entry && readRecordSha(id) !== entry.sha256
}

export { writeRecord, readRecordSha, isOutdated }
export type { InstalledRecord }

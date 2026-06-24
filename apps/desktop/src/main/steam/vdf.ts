import { existsSync, readFileSync } from 'node:fs'
import { parse } from '@node-steam/vdf'

/** Read + parse a Valve KeyValues (.vdf/.acf) file. Returns null on any failure. */
const readVdf = <T = Record<string, unknown>>(path: string): T | null => {
  if (!existsSync(path)) return null
  try {
    return parse(readFileSync(path, 'utf-8')) as T
  } catch {
    return null
  }
}

export { readVdf }

import { join } from 'node:path'
import { get } from '../../db/database'

type Row = { installDir: string | null; libraryFolder: string | null }

/** The game's install folder, from the mirror's ACF-derived data (appid only, never a caller path). */
const installFolderOf = (appid: number): string | null => {
  if (!Number.isInteger(appid) || appid <= 0) return null
  const r = get<Row>('SELECT installDir, libraryFolder FROM games WHERE appid=?', [appid])
  if (!r?.installDir || !r.libraryFolder) return null
  return join(r.libraryFolder, 'steamapps', 'common', r.installDir)
}

export { installFolderOf }

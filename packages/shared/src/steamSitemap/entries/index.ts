import type { SitemapEntry } from '../types'
import { STORE_BROWSE } from './storeBrowse'
import { STORE_CATALOG } from './storeCatalog'
import { STORE_WAYS } from './storeWays'
import { STORE_COMMERCE } from './storeCommerce'
import { ACCOUNT } from './account'
import { FAMILY } from './family'
import { HELP } from './help'
import { COMMUNITY } from './community'
import { FRIENDS } from './friends'
import { SOCIAL } from './social'
import { CONTENT } from './content'
import { GAMES } from './games'

/** The full, deduped Steam sitemap (every entry id is unique). */
const SITEMAP: SitemapEntry[] = [
  ...STORE_BROWSE,
  ...STORE_CATALOG,
  ...STORE_WAYS,
  ...STORE_COMMERCE,
  ...ACCOUNT,
  ...FAMILY,
  ...HELP,
  ...COMMUNITY,
  ...FRIENDS,
  ...SOCIAL,
  ...CONTENT,
  ...GAMES,
]

/** Fast lookup by id (used by the open-by-id tool). */
const SITEMAP_BY_ID = new Map<string, SitemapEntry>(SITEMAP.map((e) => [e.id, e]))

export { SITEMAP, SITEMAP_BY_ID }

/**
 * Types for the Steam sitemap — a curated, searchable map of Steam web
 * destinations (store, community, account, help) the AI agent can look up by
 * intent and open in the embedded store. Pure & isomorphic: no electron/node/DOM,
 * so both main (the tools) and renderer can import it.
 */

/** Broad grouping of a destination, used for scoring and display. */
type SitemapSection =
  | 'store'
  | 'discovery'
  | 'charts'
  | 'sales'
  | 'hardware'
  | 'wallet'
  | 'news'
  | 'account'
  | 'security'
  | 'family'
  | 'help'
  | 'legal'
  | 'privacy'
  | 'community'
  | 'profile'
  | 'friends'
  | 'groups'
  | 'workshop'
  | 'market'
  | 'inventory'
  | 'content'
  | 'reviews'

/**
 * The parameter a dynamic URL template needs filled:
 * - `appid`: a numeric game id (filled from open_steam_page's `appid` arg)
 * - `slug`:  a /category/<slug> id, e.g. "rpg_action", "multiplayer_coop"
 * - `tag`:   a human tag name for /tags/en/<tag>/, e.g. "Roguelike" (URL-encoded)
 * `slug`/`tag` are filled from open_steam_page's `value` arg.
 */
type SitemapParam = 'appid' | 'slug' | 'tag'

/** One Steam destination in the sitemap. */
interface SitemapEntry {
  /** Stable, unique camelCase key (e.g. "requestRefund"). */
  id: string
  /** Human label. */
  title: string
  /** Canonical URL, or a template containing the param token (e.g. "<appid>"). */
  url: string
  section: SitemapSection
  /** What it is + WHEN to send the user here. */
  description: string
  /** User phrasings — the highest-weighted search signal. */
  keywords: string[]
  /** Action tags: browse | buy | configure | redeem | recover | trade | … */
  functionalities: string[]
  /** True when the page shows personalized / logged-in content. */
  needsAuth: boolean
  /** True when `url` is a template needing `param` filled before opening. */
  dynamic?: boolean
  /** Which param fills the template when `dynamic`. */
  param?: SitemapParam
}

/** A ranked search hit — omits the bulky arrays to keep the model's context small. */
interface SitemapSearchResult {
  id: string
  title: string
  url: string
  section: SitemapSection
  description: string
  needsAuth: boolean
  dynamic?: boolean
  param?: SitemapParam
  score: number
}

export type { SitemapSection, SitemapParam, SitemapEntry, SitemapSearchResult }

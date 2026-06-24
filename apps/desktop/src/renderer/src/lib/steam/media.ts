import type { Game } from '@shared/library'

const CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps'

/**
 * Image/video URL helpers.
 *
 * `localArtUrl` points at the main-process `localart://` protocol, which serves
 * Steam's locally-cached art with NO network. Components use it first and fall
 * back to the CDN (`capsuleUrl`/`heroCdnUrl`) on error — so installed games show
 * instantly offline, and the rest fetch art from Steam's CDN.
 */

type ArtKind = 'header' | 'capsule' | 'hero' | 'logo'

const localArtUrl = (appid: number, kind: ArtKind = 'header'): string => {
  return `localart://game/${appid}/${kind}`
}

/** 460×215 header from the CDN — matches the card aspect ratio. */
const capsuleUrl = (g: Game): string => {
  return g.media?.headerImage ?? `${CDN}/${g.appid}/header.jpg`
}

const heroCdnUrl = (appid: number): string => {
  return `${CDN}/${appid}/library_600x900.jpg`
}

/** 460×215 header straight from the CDN (for catalog hits not in the mirror). */
const headerCdnUrl = (appid: number): string => {
  return `${CDN}/${appid}/header.jpg`
}

interface Trailer {
  name: string
  thumbnail: string
  hls?: string // HLS manifest — played via hls.js in the renderer
}

/** Normalized trailers from enriched media. Steam serves HLS/DASH; we use HLS. */
const trailers = (g: Game): Trailer[] => {
  return (g.media?.movies ?? []).map((m) => ({
    name: m.name,
    thumbnail: m.thumbnail,
    hls: m.hls,
  }))
}

export { localArtUrl, capsuleUrl, heroCdnUrl, headerCdnUrl, trailers }
export type { ArtKind, Trailer }

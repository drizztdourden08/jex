import { nativeImage } from 'electron'
import type { LlmImagePart } from '@jex/ai-contract'

// Images the AI may look at: Steam's own CDN only, so a tool can never make the app
// fetch an arbitrary URL. Downscaled and re-encoded as JPEG to bound the token cost.
const STEAM_CDN = /(^|\.)(steamstatic\.com|steampowered\.com|steamcdn-a\.akamaihd\.net)$/i
const MAX_BYTES = 10 * 1024 * 1024
const TIMEOUT_MS = 15_000
const JPEG_QUALITY = 80
const MAX_SIDE_CAP = 2048

const isSteamCdn = (url: string): boolean => {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' && STEAM_CDN.test(u.hostname)
  } catch {
    return false
  }
}

const download = async (url: string): Promise<Buffer | null> => {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) return null
  if (Number(res.headers.get('content-length') ?? 0) > MAX_BYTES) return null
  const buf = Buffer.from(await res.arrayBuffer())
  return buf.length > MAX_BYTES ? null : buf
}

/** Fetch a Steam CDN image, fit its longest side to maxSide, return JPEG base64. Never throws. */
const fetchImage = async (url: string, maxSide: number): Promise<LlmImagePart | null> => {
  if (!isSteamCdn(url)) return null
  try {
    const buf = await download(url)
    if (!buf) return null
    let img = nativeImage.createFromBuffer(buf)
    if (img.isEmpty()) return null
    const side = Math.max(64, Math.min(MAX_SIDE_CAP, Math.round(maxSide) || 1024))
    const { width, height } = img.getSize()
    if (Math.max(width, height) > side) {
      img = width >= height ? img.resize({ width: side, quality: 'good' }) : img.resize({ height: side, quality: 'good' })
    }
    return { mime: 'image/jpeg', base64: img.toJPEG(JPEG_QUALITY).toString('base64') }
  } catch {
    return null
  }
}

export { fetchImage }

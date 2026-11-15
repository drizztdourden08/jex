import type { StoreCaptureResult } from '@/store/storeNav'
import type { SteamWebview } from '../StorePage.type'

const JPEG_QUALITY = 0.8

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('decode failed'))
    img.src = src
  })

/** Capture the webview viewport, shrink so the longest side <= maxSide, encode as JPEG base64. */
const captureWebview = async (wv: SteamWebview, maxSide: number): Promise<StoreCaptureResult> => {
  try {
    const native = await wv.capturePage()
    const img = await loadImage(native.toDataURL())
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.width * scale))
    canvas.height = Math.max(1, Math.round(img.height * scale))
    const g = canvas.getContext('2d')
    if (!g) return { error: 'Canvas unavailable.' }
    g.drawImage(img, 0, 0, canvas.width, canvas.height)
    const base64 = canvas.toDataURL('image/jpeg', JPEG_QUALITY).split(',')[1]
    return { base64, mime: 'image/jpeg', url: wv.getURL(), title: wv.getTitle() }
  } catch (e) {
    return { error: `Could not capture the store page: ${e instanceof Error ? e.message : String(e)}` }
  }
}

export { captureWebview }

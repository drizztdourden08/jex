import type { LlmImagePart } from '@jex/ai-contract'
import { registerTool } from '../registry'
import { withImages } from '../media'

/** Longest side sent to the model; images cost tokens. */
const MAX_SIDE = 1024

type Capture = { base64?: string; mime?: LlmImagePart['mime']; url?: string; title?: string; viewport?: { width: number; height: number }; image?: { width: number; height: number }; error?: string }

const registerStoreScreenshotTool = (): void => {
  registerTool({
    name: 'screenshot_store_page',
    description:
      'Take a screenshot of what the embedded Steam store browser currently shows (the visible viewport) so you can LOOK at the page: layout, images, banners, what is on screen. Only works for vision-capable models; otherwise use read_store_page. The store page must already be open (open_steam_search / open_steam_page first).',
    category: 'store',
    sensitivity: 'safe',
    surface: 'ui',
    params: { type: 'object', properties: {} },
    run: async (_args, ctx) => {
      if (!ctx.vision) {
        return { canView: false, note: "This local model can't view images; use read_store_page instead." }
      }
      const shot = (await ctx.ui('captureStorePage', { maxSide: MAX_SIDE })) as Capture
      if (shot.error || !shot.base64) {
        return { error: shot.error ?? 'Could not capture the store page.' }
      }
      const scale = shot.viewport && shot.image ? shot.viewport.width / shot.image.width : undefined
      const coords =
        shot.viewport && shot.image && scale
          ? ` The image is ${shot.image.width}x${shot.image.height} px; the page viewport is ${shot.viewport.width}x${shot.viewport.height} CSS px (1 image px = ${scale.toFixed(3)} CSS px). To click or hover something you see at image pixel (px,py), pass x=round(px*${scale.toFixed(3)}), y=round(py*${scale.toFixed(3)}) to store_click / store_hover.`
          : ''
      const note = `Attached: a screenshot of the visible part of the store page. Use scroll_store_page to see other parts.${coords}`
      return withImages(
        { url: shot.url, title: shot.title, viewport: shot.viewport, scale, note },
        [{ mime: shot.mime ?? 'image/jpeg', base64: shot.base64 }],
      )
    },
  })
}

export { registerStoreScreenshotTool }

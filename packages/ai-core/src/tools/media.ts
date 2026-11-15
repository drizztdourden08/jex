import type { LlmImagePart } from '@jex/ai-contract'

// A tool that shows pictures to the model returns withImages(value, images). The
// executor splits it: the value becomes the text result (and the UI event), the
// images ride along on the provider tool result. Images never reach the renderer.

const MEDIA_KIND = 'jex:tool-media'

interface ToolMediaResult {
  kind: typeof MEDIA_KIND
  value: unknown
  images: LlmImagePart[]
}

const withImages = (value: unknown, images: LlmImagePart[]): ToolMediaResult => ({
  kind: MEDIA_KIND,
  value,
  images,
})

const isMediaResult = (v: unknown): v is ToolMediaResult =>
  typeof v === 'object' && v !== null && (v as { kind?: unknown }).kind === MEDIA_KIND

const splitImages = (out: unknown): { value: unknown; images: LlmImagePart[] } =>
  isMediaResult(out) ? { value: out.value, images: out.images } : { value: out, images: [] }

export { withImages, splitImages }
export type { ToolMediaResult }

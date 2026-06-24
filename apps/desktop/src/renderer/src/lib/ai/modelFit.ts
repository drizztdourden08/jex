import type { AiModelOption } from '@shared/ai'

/**
 * GPU-fit heuristics for the model picker. A model runs comfortably on the GPU
 * when its weights plus a little KV-cache headroom fit in the card's real VRAM;
 * bigger models still run, but spill to CPU and are slower. Used to pick the
 * recommended model for the detected GPU and to warn before downloading an
 * oversized one. Pure — no side effects.
 */
const KV_HEADROOM_GB = 2.5

const fitsVram = ({ sizeGb }: AiModelOption, vramGb?: number): boolean =>
  vramGb == null || sizeGb + KV_HEADROOM_GB <= vramGb

/**
 * The recommended model id for this GPU: the largest model that fits comfortably,
 * else the catalog's static pick (VRAM unknown), else the smallest model.
 */
const recommendedFor = (models: AiModelOption[], vramGb?: number): string | null => {
  if (models.length === 0) return null
  if (vramGb == null) return models.find((m) => m.recommended)?.id ?? models[0].id
  const fitting = models.filter((m) => fitsVram(m, vramGb))
  if (fitting.length > 0) return fitting.reduce((a, b) => (b.sizeGb > a.sizeGb ? b : a)).id
  return models.reduce((a, b) => (b.sizeGb < a.sizeGb ? b : a)).id
}

export { fitsVram, recommendedFor, KV_HEADROOM_GB }

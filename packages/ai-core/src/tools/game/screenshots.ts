import type { LlmImagePart } from '@jex/ai-contract'
import type { Game } from '@jex/shared/library/index'
import { host } from '../../host'
import { withImages } from '../media'
import type { ToolContext } from '../registry'
import { resolveGame } from './resolve'

const DEFAULT_SHOTS = 3
const MAX_SHOTS = 4
/** Longest side sent to the model; images cost tokens. */
const MAX_SIDE = 1024

type Shot = { thumb: string; full: string }

// 1-based indices from the model, else `count` shots spread evenly over the set.
const pickIndices = (total: number, indices: unknown, count: unknown): number[] => {
  if (Array.isArray(indices) && indices.length > 0) {
    const wanted = indices.map((i) => Math.floor(Number(i)) - 1).filter((i) => i >= 0 && i < total)
    return [...new Set(wanted)].slice(0, MAX_SHOTS)
  }
  const n = Math.min(total, Math.max(1, Math.min(MAX_SHOTS, Math.floor(Number(count)) || DEFAULT_SHOTS)))
  return [...new Set(Array.from({ length: n }, (_, i) => Math.floor((i * total) / n)))]
}

const fetchShot = async (shot: Shot): Promise<LlmImagePart | null> => {
  const media = host().media
  if (!media) return null
  const full = await media.fetchImage(shot.full, MAX_SIDE).catch(() => null)
  return full ?? media.fetchImage(shot.thumb, MAX_SIDE).catch(() => null)
}

const summary = (g: Game, total: number): Record<string, unknown> => ({
  appid: g.appid,
  name: g.name,
  inLibrary: g.owned || g.installed,
  totalScreenshots: total,
  trailers: g.media?.movies.length ?? 0,
})

/** The view_game_screenshots tool body: images for vision models, a plain text answer otherwise. */
const viewScreenshots = async (args: Record<string, unknown>, ctx: ToolContext): Promise<unknown> => {
  const resolved = await resolveGame(args.query)
  if (!resolved.ok) return resolved.result
  const { game } = resolved
  const shots = game.media?.screenshots ?? []
  const base = summary(game, shots.length)
  if (shots.length === 0) return { ...base, note: 'No screenshots are stored for this game.' }
  if (!ctx.vision) {
    return {
      ...base,
      canView: false,
      note: "This local model can't view images. Steam screenshots have no captions; use get_game_details for the description, or open_game so the user can see them.",
    }
  }
  if (!host().media) return { ...base, canView: false, note: 'This version of Jex cannot fetch images; update the app.' }
  const picked = pickIndices(shots.length, args.indices, args.count)
  const fetched = await Promise.all(picked.map((i) => fetchShot(shots[i])))
  const shown: number[] = []
  const images: LlmImagePart[] = []
  fetched.forEach((img, k) => {
    if (!img) return
    shown.push(picked[k] + 1)
    images.push(img)
  })
  if (images.length === 0) return { ...base, note: 'Could not download the screenshots right now.' }
  const note = `Attached screenshots ${shown.join(', ')} of ${shots.length}, in that order. Pass indices (1-based) to see others; at most ${MAX_SHOTS} per call.`
  return withImages({ ...base, shown, note }, images)
}

export { viewScreenshots }

/**
 * Behavioral state, driving the optional animation:
 * - `static`   no motion — use as a logo / app mark.
 * - `idle`     awake & gently bobbing — "I'm listening" (the chat intro greeting).
 * - `working`  lively bob, quicker blinks, drifting pixels — the AI is busy.
 * - `sleeping` eyes shut, slow breathing, drifting Zzz — nothing to do.
 */
type MascotState = 'static' | 'idle' | 'working' | 'sleeping'

type MascotProps = {
  /** Rendered width & height in px (the artwork is a square viewBox). */
  size?: number | string
  /** Behavior/animation; defaults to `static` so it reads as a still logo. */
  state?: MascotState
  /** Accessible label; also rendered as the SVG <title>. */
  title?: string
  className?: string
}

export type { MascotProps, MascotState }

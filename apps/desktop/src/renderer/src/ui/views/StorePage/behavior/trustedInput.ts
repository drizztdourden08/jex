import type { SteamWebview } from '../StorePage.type'

const STEP_MS = 30

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const point = (x: number, y: number) => ({ x: Math.round(x), y: Math.round(y) })

/** Trusted mouse move (isTrusted events) to a guest CSS-pixel point: opens hover menus. */
const hoverAt = async (wv: SteamWebview, x: number, y: number): Promise<void> => {
  wv.sendInputEvent({ type: 'mouseMove', ...point(x, y) })
  await sleep(STEP_MS)
}

/** Trusted left click at a guest CSS-pixel point: move, press, release. */
const clickAt = async (wv: SteamWebview, x: number, y: number): Promise<void> => {
  const p = point(x, y)
  await hoverAt(wv, x, y)
  wv.sendInputEvent({ type: 'mouseDown', ...p, button: 'left', clickCount: 1 })
  await sleep(STEP_MS)
  wv.sendInputEvent({ type: 'mouseUp', ...p, button: 'left', clickCount: 1 })
}

export { sleep, hoverAt, clickAt }

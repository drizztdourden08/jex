import type { StoreActOp, StoreActResult } from '@/store/storeNav'
import type { SteamWebview } from '../StorePage.type'
import { clickAt, hoverAt, sleep } from './trustedInput'

const STATE_READ_MS = 150
const HOVER_SETTLE_MS = 250
const MAX_TARGETS = 30

type Guest = (op: StoreActOp, args: Record<string, unknown>) => Promise<StoreActResult>
type Aim = { x: number; y: number; hit: boolean }
type ToggleState = { on: boolean; via: string }

const readState = async (guest: Guest): Promise<ToggleState | null> => {
  await sleep(STATE_READ_MS)
  try {
    return ((await guest('probe', {})).state as ToggleState | null) ?? null
  } catch {
    return null // the click navigated away
  }
}

/** Click the aimed element: trusted at the hit-tested point, else the synthetic fallback. */
const fire = async (wv: SteamWebview, guest: Guest, aim: Aim): Promise<StoreActResult | null> => {
  if (aim.hit) {
    await clickAt(wv, aim.x, aim.y)
    return null
  }
  const s = await guest('synth', {})
  return s.error ? s : null
}

const stateField = (before: ToggleState | null, after: ToggleState | null) =>
  before || after ? { state: { before, after } } : {}

const runClick = async (wv: SteamWebview, guest: Guest, args: Record<string, unknown>): Promise<StoreActResult> => {
  const r = await guest('aim', { ...args, hover: false })
  if (r.error) return r
  const { aim, stateBefore, ...rest } = r as { aim: Aim; stateBefore: ToggleState | null } & StoreActResult
  const failed = await fire(wv, guest, aim)
  if (failed) return failed
  return { ...rest, trusted: aim.hit, ...stateField(stateBefore, await readState(guest)) }
}

/** Hover never clicks: a trusted mouseMove only (menus that open on hover). */
const runHover = async (wv: SteamWebview, guest: Guest, args: Record<string, unknown>): Promise<StoreActResult> => {
  const r = await guest('aim', { ...args, hover: true })
  if (r.error) return r
  const aim = r.aim as Aim
  await hoverAt(wv, aim.x, aim.y)
  await sleep(HOVER_SETTLE_MS)
  return { ...r, aim: undefined, stateBefore: undefined }
}

const describeState = (on: boolean) => (on ? 'checked' : 'unchecked')

const selectOne = async (wv: SteamWebview, guest: Guest, t: Record<string, unknown>): Promise<StoreActResult> => {
  const r = await guest('select', t)
  if (r.error || !r.toggle) return r
  const before = (r.state as ToggleState | null) ?? null
  const control = r.control
  const want = typeof t.checked === 'boolean' ? t.checked : undefined
  if (want === undefined) {
    const hint = before
      ? before.on
        ? 'It is currently checked. Pass checked:false to uncheck or checked:true to check.'
        : 'It is currently unchecked. Pass checked:true to check or checked:false to leave it unchecked.'
      : 'The current state could not be read. Pass checked:true or checked:false, then verify with read_store_page.'
    return { error: `\`checked\` is required for a checkbox or toggle. ${hint}`, control, state: before }
  }
  if (before && before.on === want) {
    return { control, checked: want, changed: false, note: `Already ${describeState(want)}; nothing was clicked.`, state: { before, after: before } }
  }
  const failed = await fire(wv, guest, r.aim as Aim)
  if (failed) return failed
  const after = await readState(guest)
  const changed = before && after ? before.on !== after.on : undefined
  const note = !after
    ? 'Clicked, but the new state could not be read; verify with read_store_page.'
    : after.on !== want
      ? `Still ${describeState(after.on)} after the click. Try store_click, or the page may need another step first.`
      : undefined
  return { control, requested: want, checked: after?.on, changed, state: { before, after }, ...(note ? { note } : {}) }
}

const runSelect = async (wv: SteamWebview, guest: Guest, args: Record<string, unknown>): Promise<StoreActResult> => {
  if (!Array.isArray(args.targets)) return selectOne(wv, guest, args)
  const targets = args.targets.slice(0, MAX_TARGETS) as Record<string, unknown>[]
  const results: StoreActResult[] = []
  for (const t of targets) {
    const one = await selectOne(wv, guest, t)
    results.push({ target: t.label ?? t.selector, ...one })
  }
  const changed = results.filter((x) => x.changed === true).length
  const failed = results.filter((x) => x.error).length
  const skipped = args.targets.length > MAX_TARGETS ? { note: `Only the first ${MAX_TARGETS} targets were processed.` } : {}
  return { results, changed, failed, ...skipped }
}

export { runClick, runHover, runSelect }
export type { Guest }

import type { BrowserWindow } from 'electron'

/**
 * Windows drops/repaints the DWM backdrop (acrylic) when the window changes
 * state (maximize/restore, fullscreen incl. HTML5 element fullscreen). Re-assert
 * the material on every such transition so the glass look is stable.
 */
const EVENTS = [
  'maximize',
  'unmaximize',
  'restore',
  'enter-full-screen',
  'leave-full-screen',
  'enter-html-full-screen',
  'leave-html-full-screen',
] as const

const keepGlass = (win: BrowserWindow): void => {
  if (process.platform !== 'win32') return
  const apply = (): void => {
    if (win.isDestroyed()) return
    try {
      win.setBackgroundMaterial('acrylic')
    } catch {
      /* older Electron/Windows */
    }
  }
  const onChange = (): void => {
    apply()
    // The DWM applies the change after the state animation; re-assert once more.
    setTimeout(apply, 120)
  }
  for (const ev of EVENTS) win.on(ev as 'maximize', onChange)
}

export { keepGlass }

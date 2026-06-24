// Rasterize assets/icon.svg → assets/icon.png using Electron's bundled Chromium.
// We have no ImageMagick/rsvg/sharp here, but Chromium renders the SVG (gradients,
// glow & shadow filters) faithfully. Drawing it onto a <canvas> preserves the
// transparent background — capturePage would flatten it — so the taskbar/exe icon
// is the bare mascot with no backing plate.
// Run: `npx electron scripts/render-icon.mjs`.
import { app, BrowserWindow } from 'electron'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SIZE = 1024

const main = async () => {
  await app.whenReady()
  const svg = readFileSync(join(root, 'assets', 'icon.svg'), 'utf8')
  const win = new BrowserWindow({ width: SIZE, height: SIZE, show: false })
  await win.loadURL('data:text/html,<body></body>')

  const dataUrl = await win.webContents.executeJavaScript(`new Promise((resolve, reject) => {
    const svg = ${JSON.stringify(svg)}
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = ${SIZE}; c.height = ${SIZE}
      const ctx = c.getContext('2d')
      ctx.clearRect(0, 0, ${SIZE}, ${SIZE})
      ctx.drawImage(img, 0, 0, ${SIZE}, ${SIZE})
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('svg failed to load as image'))
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  })`)

  writeFileSync(join(root, 'assets', 'icon.png'), Buffer.from(dataUrl.split(',')[1], 'base64'))
  console.log(`[render-icon] wrote assets/icon.png (${SIZE}x${SIZE}, transparent)`)
  app.quit()
}

void main()

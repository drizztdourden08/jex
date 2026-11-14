import { ipcMain } from 'electron'
import { settings } from '../settings'
import { clearSecret, hasSecret, secretAvailable, setSecret } from '../secrets'

// The renderer may only touch these secrets through the generic channels. Provider
// keys go through ai:remote:* (verified first) and are never readable back.
const RENDERER_SECRETS: readonly string[] = ['steamApiKey']
const isAllowed = (key: string): boolean => RENDERER_SECRETS.includes(key)

/** Non-secret settings (electron-store) + encrypted secrets (OS safeStorage). */
const registerSettingsHandlers = (): void => {
  // ── Settings (non-secret) ───────────────────────────────────────────────
  ipcMain.handle('settings:getAll', () => settings.store)
  ipcMain.handle('settings:get', (_e, key: string) => settings.get(key))
  ipcMain.handle('settings:set', (_e, key: string, value: unknown) => {
    settings.set(key, value as never)
  })

  // ── Secrets (encrypted at rest via OS safeStorage; no read-back channel) ─
  ipcMain.handle('secret:available', () => secretAvailable())
  ipcMain.handle('secret:set', (_e, key: string, value: string) => {
    if (!isAllowed(key)) throw new Error('secret not writable')
    setSecret(key, value)
  })
  ipcMain.handle('secret:has', (_e, key: string) => isAllowed(key) && hasSecret(key))
  ipcMain.handle('secret:clear', (_e, key: string) => {
    if (!isAllowed(key)) throw new Error('secret not writable')
    clearSecret(key)
  })
}

export { registerSettingsHandlers }

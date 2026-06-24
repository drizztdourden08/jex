import { ipcMain } from 'electron'
import { settings } from '../settings'
import { clearSecret, getSecret, hasSecret, secretAvailable, setSecret } from '../secrets'

/** Non-secret settings (electron-store) + encrypted secrets (OS safeStorage). */
const registerSettingsHandlers = (): void => {
  // ── Settings (non-secret) ───────────────────────────────────────────────
  ipcMain.handle('settings:getAll', () => settings.store)
  ipcMain.handle('settings:get', (_e, key: string) => settings.get(key))
  ipcMain.handle('settings:set', (_e, key: string, value: unknown) => {
    settings.set(key, value as never)
  })

  // ── Secrets (encrypted at rest via OS safeStorage) ──────────────────────
  ipcMain.handle('secret:available', () => secretAvailable())
  ipcMain.handle('secret:set', (_e, key: string, value: string) => setSecret(key, value))
  ipcMain.handle('secret:has', (_e, key: string) => hasSecret(key))
  ipcMain.handle('secret:get', (_e, key: string) => getSecret(key))
  ipcMain.handle('secret:clear', (_e, key: string) => clearSecret(key))
}

export { registerSettingsHandlers }

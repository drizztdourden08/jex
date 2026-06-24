import { safeStorage } from 'electron'
import Store from 'electron-store'

/**
 * Encrypted secret storage (Steam key, future AI credentials). Values are
 * encrypted with the OS keychain via Electron safeStorage and stored as base64
 * in userData/secrets.json. Centralized here so both the IPC handlers and the
 * sync layer read keys the same way.
 */
const store = new Store<{ [k: string]: string }>({ name: 'secrets' })

const secretAvailable = (): boolean => {
  return safeStorage.isEncryptionAvailable()
}

const setSecret = (key: string, value: string): void => {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('OS secure storage is unavailable on this system.')
  }
  store.set(key, safeStorage.encryptString(value).toString('base64'))
}

const hasSecret = (key: string): boolean => {
  return store.has(key)
}

const getSecret = (key: string): string | null => {
  const enc = store.get(key)
  if (!enc) return null
  try {
    return safeStorage.decryptString(Buffer.from(enc, 'base64'))
  } catch {
    return null
  }
}

const clearSecret = (key: string): void => {
  store.delete(key)
}

export { secretAvailable, setSecret, hasSecret, getSecret, clearSecret }

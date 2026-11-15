import { safeStorage } from 'electron'
import Store from 'electron-store'

/**
 * Encrypted secret storage (Steam key, future AI credentials). Values are
 * encrypted with the OS keychain via Electron safeStorage and stored as base64
 * in userData/secrets.json. Centralized here so both the IPC handlers and the
 * sync layer read keys the same way.
 */
const store = new Store<{ [k: string]: string }>({ name: 'secrets' })

const secretAvailable = (): Promise<boolean> => safeStorage.isAsyncEncryptionAvailable()

const encryptToStore = async (key: string, value: string): Promise<void> => {
  store.set(key, (await safeStorage.encryptStringAsync(value)).toString('base64'))
}

const setSecret = async (key: string, value: string): Promise<void> => {
  if (!(await safeStorage.isAsyncEncryptionAvailable())) {
    throw new Error('OS secure storage is unavailable on this system.')
  }
  await encryptToStore(key, value)
}

const hasSecret = (key: string): boolean => {
  return store.has(key)
}

// Async decrypt reads values written by the old sync encryptString (per the Electron docs).
// When the OS key was rotated (shouldReEncrypt), decrypt again for the fresh value and re-store it.
const getSecret = async (key: string): Promise<string | null> => {
  const enc = store.get(key)
  if (!enc) return null
  try {
    const data = Buffer.from(enc, 'base64')
    let out = await safeStorage.decryptStringAsync(data)
    if (out.shouldReEncrypt) {
      out = await safeStorage.decryptStringAsync(data)
      await encryptToStore(key, out.result)
    }
    return out.result
  } catch {
    return null
  }
}

const clearSecret = (key: string): void => {
  store.delete(key)
}

export { secretAvailable, setSecret, hasSecret, getSecret, clearSecret }

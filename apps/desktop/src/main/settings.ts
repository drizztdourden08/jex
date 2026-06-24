import Store from 'electron-store'

/**
 * Non-secret settings → userData/config.json (created on first run). A single
 * shared instance so the IPC layer and the AI tool registry read/write the same
 * store. Secrets never live here — see ./secrets.
 */
const settings = new Store({ name: 'config' })

export { settings }

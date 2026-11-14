// Electron wraps a rejected ipcMain.handle as
// "Error invoking remote method 'domain:action': Error: <message>". Only <message> is for people.
const IPC_PREFIX = /^Error invoking remote method '[^']*':\s*(?:[A-Za-z]*Error:\s*)?/

const ipcErrorText = (e: unknown): string => {
  const raw = e instanceof Error ? e.message : String(e)
  return raw.replace(IPC_PREFIX, '').trim() || raw
}

export { ipcErrorText }

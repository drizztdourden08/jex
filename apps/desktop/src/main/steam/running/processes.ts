import { execFile } from 'node:child_process'

type Proc = { pid: number; path: string }

const PS_SCRIPT =
  'Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath } | ' +
  'Select-Object ProcessId,ExecutablePath | ConvertTo-Json -Compress'
const PS_TIMEOUT_MS = 8000

type Row = { ProcessId?: number; ExecutablePath?: string }

/** Every process with a known executable path (one CIM query). */
const listProcesses = (): Promise<Proc[]> =>
  new Promise((resolve) => {
    execFile(
      'powershell',
      ['-NoProfile', '-NonInteractive', '-Command', PS_SCRIPT],
      { timeout: PS_TIMEOUT_MS, windowsHide: true, maxBuffer: 16 * 1024 * 1024 },
      (err, stdout) => {
        if (err) return resolve([])
        try {
          const parsed = JSON.parse(stdout) as unknown
          const rows = (Array.isArray(parsed) ? parsed : [parsed]) as Row[]
          resolve(
            rows
              .filter((r) => typeof r.ProcessId === 'number' && typeof r.ExecutablePath === 'string')
              .map((r) => ({ pid: r.ProcessId as number, path: r.ExecutablePath as string })),
          )
        } catch {
          resolve([])
        }
      },
    )
  })

/** Processes whose executable lives inside `folder` (case-insensitive, strict prefix). */
const processesInFolder = async (folder: string): Promise<Proc[]> => {
  const prefix = folder.replace(/[\\/]+$/, '').toLowerCase() + '\\'
  const all = await listProcesses()
  return all.filter((p) => p.path.toLowerCase().startsWith(prefix))
}

export { processesInFolder }
export type { Proc }

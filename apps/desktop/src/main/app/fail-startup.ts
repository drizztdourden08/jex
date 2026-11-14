import { app, dialog } from 'electron'

/**
 * Last-resort startup guard. If anything before the window exists throws, say so and
 * exit — otherwise the process lingers with no window (visible only in Task Manager)
 * and blocks nothing but the user's patience.
 */
const failStartup = (err: unknown): void => {
  const msg = err instanceof Error ? (err.stack ?? err.message) : String(err)
  console.error('[main] startup failed:', msg)
  if (process.env.JEX_HIDDEN !== '1') dialog.showErrorBox('Jex could not start', msg)
  app.exit(1)
}

export { failStartup }

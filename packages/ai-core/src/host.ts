// The host-services seam. ai-core never imports the app's privileged modules
// (db, library, steam, settings, secrets) directly — it reads them through the
// HostServices the desktop host injects once at startup via setHost(). This is the
// dependency-inversion boundary that lets the whole engine ship as a standalone,
// downloadable plugin (see @jex/ai-contract).

import type { HostServices } from '@jex/ai-contract'

let current: HostServices | null = null

const setHost = (services: HostServices): void => {
  current = services
}

const host = (): HostServices => {
  if (current == null) {
    throw new Error('AI host not initialized — call setHost() before using the engine.')
  }
  return current
}

export { setHost, host }

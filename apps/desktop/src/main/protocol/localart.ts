import { protocol } from 'electron'
import { readFile } from 'node:fs/promises'
import { rememberedSteamPath } from '../library/scan'
import { findArtFile } from '../steam/art'

/**
 * The `localart://` custom scheme serves locally-cached Steam art to the renderer
 * with no network access. The renderer requests `localart://game/<appid>[/<kind>]`.
 *
 * `registerLocalArtScheme()` must run BEFORE app is ready (it declares the scheme as
 * privileged); `registerArtProtocol()` installs the request handler after ready.
 */

const registerLocalArtScheme = (): void => {
  protocol.registerSchemesAsPrivileged([
    { scheme: 'localart', privileges: { standard: true, secure: true, supportFetchAPI: true } },
  ])
}

const registerArtProtocol = (): void => {
  protocol.handle('localart', async (request) => {
    try {
      const parts = new URL(request.url).pathname.split('/').filter(Boolean)
      const appid = Number(parts[0])
      const kind = parts[1] ?? 'header'
      const steamPath = rememberedSteamPath()
      if (!steamPath || !Number.isFinite(appid)) return new Response(null, { status: 404 })
      const file = findArtFile(steamPath, appid, kind)
      if (!file) return new Response(null, { status: 404 })
      const buf = await readFile(file)
      const type = file.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
      return new Response(new Uint8Array(buf), { headers: { 'content-type': type } })
    } catch {
      return new Response(null, { status: 404 })
    }
  })
}

export { registerLocalArtScheme, registerArtProtocol }

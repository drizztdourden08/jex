import { net, session } from 'electron'

/**
 * Add a game to the user's Steam wishlist.
 *
 * Steam has no public *write* API for the wishlist, so we reuse the session of the
 * embedded Store tab (the `persist:steamstore` partition, where the user is logged
 * in) to POST the same `api/addtowishlist` call the store page itself makes. We go
 * through Electron's `net` with `useSessionCookies` so the request carries that
 * session's auth cookies; the `sessionid` cookie is echoed in the body as Steam
 * requires. If the user isn't signed in there, we report `needsLogin` so the UI
 * can send them to the Store tab to sign in (and click ＋) instead.
 */

// Must match StorePage's STORE_PARTITION (the logged-in store webview session).
const STORE_PARTITION = 'persist:steamstore'
const ADD_URL = 'https://store.steampowered.com/api/addtowishlist'

interface WishlistAddResult {
  ok: boolean
  needsLogin?: boolean
  error?: string
}

const addToWishlist = async (appid: number): Promise<WishlistAddResult> => {
  const ses = session.fromPartition(STORE_PARTITION)
  let sessionid: string | undefined
  let loggedIn = false
  try {
    const cookies = await ses.cookies.get({ url: 'https://store.steampowered.com' })
    sessionid = cookies.find((c) => c.name === 'sessionid')?.value
    loggedIn = cookies.some((c) => c.name === 'steamLoginSecure')
  } catch {
    return { ok: false, needsLogin: true }
  }
  if (!loggedIn || !sessionid) return { ok: false, needsLogin: true }

  return new Promise<WishlistAddResult>((resolve) => {
    const req = net.request({ method: 'POST', url: ADD_URL, session: ses, useSessionCookies: true })
    req.setHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    req.setHeader('Origin', 'https://store.steampowered.com')
    req.setHeader('Referer', `https://store.steampowered.com/app/${appid}/`)
    req.setHeader('X-Requested-With', 'XMLHttpRequest')
    let body = ''
    req.on('response', (res) => {
      res.on('data', (chunk) => (body += chunk.toString()))
      res.on('end', () => {
        if (res.statusCode === 401 || res.statusCode === 403) {
          resolve({ ok: false, needsLogin: true })
          return
        }
        try {
          const json = JSON.parse(body) as { success?: boolean }
          resolve({ ok: json.success === true })
        } catch {
          resolve({ ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300 })
        }
      })
    })
    req.on('error', (e) => resolve({ ok: false, error: String(e) }))
    req.write(`sessionid=${encodeURIComponent(sessionid!)}&appid=${appid}`)
    req.end()
  })
}

export { addToWishlist }
export type { WishlistAddResult }

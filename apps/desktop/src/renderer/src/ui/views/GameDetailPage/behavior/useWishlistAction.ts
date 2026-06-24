import { useState } from 'react'
import type { Game } from '@shared/library'

type UseWishlistActionParams = {
  game: Game | null
  setGame: (game: Game) => void
}

const useWishlistAction = ({ game, setGame }: UseWishlistActionParams) => {
  const [wlBusy, setWlBusy] = useState(false)
  const [wlMsg, setWlMsg] = useState<string | null>(null)

  const addWishlist = async () => {
    if (!game) return
    setWlBusy(true)
    setWlMsg(null)
    const res = await window.api.wishlist.add(game.appid).catch(() => ({ ok: false }))
    setWlBusy(false)
    if (res.ok) setGame({ ...game, wishlisted: true })
    else if ('needsLogin' in res && res.needsLogin)
      setWlMsg('Sign in to Steam in the Store tab first, then add it again.')
    else setWlMsg('Could not add to wishlist — try the store page.')
  }

  return { wlBusy, wlMsg, addWishlist }
}

export { useWishlistAction }
export type { UseWishlistActionParams }

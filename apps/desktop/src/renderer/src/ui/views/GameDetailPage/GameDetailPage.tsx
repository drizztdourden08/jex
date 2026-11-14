import './GameDetailPage.css'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useStoreNav } from '@/store/storeNav'
import { useGameDetail } from '@/hooks/useGameDetail'
import { useAutoplaySetting } from '@/hooks/useAutoplaySetting'
import { Box } from '@ds/primitives/layout/Box'
import { GameDetailBody } from '@ui/compounds/GameDetailBody'
import { backTarget, statusFor } from './behavior/detail-utils'
import { useWishlistAction } from './behavior/useWishlistAction'
import { DetailHeader } from './sub-components/DetailHeader'
import { DetailSkeleton } from './sub-components/DetailSkeleton'

const GameDetailPage = () => {
  const { appid } = useParams()
  const id = Number(appid)
  const navState = useLocation().state as { from?: string; name?: string } | null
  const from = navState?.from
  const back = backTarget(from)
  const navigate = useNavigate()
  const { game, setGame, loading, extrasLoading, sanitized, reqs } = useGameDetail({
    id,
    name: navState?.name,
  })
  const { wlBusy, wlMsg, addWishlist } = useWishlistAction({ game, setGame })
  const autoplay = useAutoplaySetting()

  if (loading && !game) return <DetailSkeleton back={back} />
  if (!game)
    return (
      <Box as="p">
        Game not found. <Link to={back.to}>Back to {back.label.toLowerCase()}</Link>
      </Box>
    )

  const sizeGb = game.sizeOnDisk ? (game.sizeOnDisk / 1e9).toFixed(1) : null
  const open = (url: string) => {
    window.api.app.openExternal(url).catch(() => {})
  }
  // Steam links (store page, discussions) open in the embedded Store tab, which is
  // logged in — only truly external links go to the OS browser.
  const openInStore = (url: string) => {
    navigate('/store')
    useStoreNav.getState().controls?.loadURL(url)
  }

  return (
    <Box className="detail">
      {/* Kept outside GameDetailBody: the body is a size container, which would
          become this fixed backdrop's containing block. */}
      {game.media?.background && (
        <Box
          className="detail-backdrop"
          style={{ backgroundImage: `url("${game.media.background.replace(/["\\]/g, '')}")` }}
        />
      )}

      <Box className="detail-topbar">
        <Link to={back.to} className="muted">
          ← {back.label}
        </Link>
        {extrasLoading && <Box as="span" className="muted detail-refreshing">Loading details…</Box>}
      </Box>

      <DetailHeader
        game={game}
        statusText={statusFor(game, sizeGb)}
        wlBusy={wlBusy}
        wlMsg={wlMsg}
        onOpen={open}
        onOpenInStore={openInStore}
        onAddWishlist={addWishlist}
      />

      <GameDetailBody
        game={game}
        extrasLoading={extrasLoading}
        sanitized={sanitized}
        reqs={reqs}
        autoplay={autoplay}
        onOpen={open}
      />
    </Box>
  )
}

export { GameDetailPage }

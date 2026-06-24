import './GameDetailPage.css'
import type { MouseEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useStoreNav } from '@/store/storeNav'
import { trailers } from '@/lib/steam/media'
import { Box } from '@ds/primitives/layout/Box'
import { Image } from '@ds/primitives/media/Image'
import { MediaCarousel } from '@ui/compounds/MediaCarousel'
import { backTarget, posterSources, statusFor } from './behavior/detail-utils'
import { useGameDetail } from './behavior/useGameDetail'
import { useWishlistAction } from './behavior/useWishlistAction'
import { useAutoplaySetting } from './behavior/useAutoplaySetting'
import { DetailHeader } from './sub-components/DetailHeader'
import { DetailHeadline } from './sub-components/DetailHeadline'
import { DetailDescription } from './sub-components/DetailDescription'
import { MetaSidebar } from './sub-components/MetaSidebar'
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

  const vids = trailers(game)
  const shots = game.media?.screenshots ?? []
  const sizeGb = game.sizeOnDisk ? (game.sizeOnDisk / 1e9).toFixed(1) : null
  const open = (url: string) => window.api.app.openExternal(url)
  // Steam links (store page, discussions) open in the embedded Store tab, which is
  // logged in — only truly external links go to the OS browser.
  const openInStore = (url: string) => {
    navigate('/store')
    useStoreNav.getState().controls?.loadURL(url)
  }

  const posterSrcs = posterSources(game)

  // Description HTML may contain <a href>; open those in the browser instead of
  // navigating the renderer away from the SPA shell.
  const onDescClick = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest('a')
    const href = a?.getAttribute('href')
    if (href && /^https?:/i.test(href)) {
      e.preventDefault()
      open(href)
    }
  }

  const statusText = statusFor(game, sizeGb)

  return (
    <Box className="detail">
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
        statusText={statusText}
        wlBusy={wlBusy}
        wlMsg={wlMsg}
        onOpen={open}
        onOpenInStore={openInStore}
        onAddWishlist={addWishlist}
      />

      {/* Row 1 — poster + media */}
      <Box className="detail-row1">
        <Image
          className="detail-poster"
          src={posterSrcs[0]}
          alt=""
          onError={(e) => {
            const t = e.currentTarget as HTMLImageElement
            const next = Number(t.dataset.i ?? '0') + 1
            if (next < posterSrcs.length) {
              t.dataset.i = String(next)
              t.src = posterSrcs[next]
            }
          }}
        />
        <Box className="detail-media">
          {/* key per game: the route reuses this component across :appid changes,
              so without it MediaCarousel's selection/userPicked would leak (and a
              new game's trailer would autoplay). */}
          <MediaCarousel key={game.appid} videos={vids} shots={shots} autoplay={autoplay} />
        </Box>
      </Box>

      {/* Headline deciding-factors — above the description, full width */}
      <DetailHeadline game={game} extrasLoading={extrasLoading} onOpen={open} />

      {/* System requirements — full width, above the description */}
      {reqs && (
        <Box as="details" className="detail-reqs">
          <Box as="summary">System requirements</Box>
          <Box className="reqs-cols">
            {reqs.min && (
              <Box className="steam-html" dangerouslySetInnerHTML={{ __html: reqs.min }} />
            )}
            {reqs.rec && (
              <Box className="steam-html" dangerouslySetInnerHTML={{ __html: reqs.rec }} />
            )}
          </Box>
        </Box>
      )}

      {/* Row 2 — description + metadata sidebar */}
      <Box className="detail-row2">
        <DetailDescription game={game} sanitized={sanitized} onDescClick={onDescClick} />
        <MetaSidebar game={game} extrasLoading={extrasLoading} />
      </Box>
    </Box>
  )
}

export { GameDetailPage }

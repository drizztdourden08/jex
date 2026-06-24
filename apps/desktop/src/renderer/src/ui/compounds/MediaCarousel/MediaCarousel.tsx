import './MediaCarousel.css'
import { useEffect, useRef, useState } from 'react'
import type { Trailer } from '@/lib/steam/media'
import { Box } from '@ds/primitives/layout/Box'
import { Image } from '@ds/primitives/media/Image'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { VideoPlayer } from '@ds/composites/VideoPlayer'

interface Shot {
  thumb: string
  full: string
}

interface MediaCarouselProps {
  videos: Trailer[]
  shots: Shot[]
  /** First video autoplays when true (the user's Settings preference, supplied by
   *  the View). Clicking a video thumbnail always starts it regardless. */
  autoplay?: boolean
}

type Item =
  | { kind: 'video'; name: string; thumbnail: string; hls: string }
  | { kind: 'shot'; thumbnail: string; full: string }

/** Row-1 media viewer: a main stage (trailer or screenshot) plus a thumbnail
 *  strip. Videos come first. Screenshots open in a click-to-dismiss lightbox.
 *  The first video never autoplays unless `autoplay` is set; clicking a video
 *  thumbnail always starts it. Presentational — data (incl. autoplay) via props. */
const MediaCarousel = ({ videos, shots, autoplay = false }: MediaCarouselProps) => {
  const items: Item[] = [
    ...videos
      .filter((v) => v.hls)
      .map((v) => ({ kind: 'video' as const, name: v.name, thumbnail: v.thumbnail, hls: v.hls! })),
    ...shots.map((s) => ({ kind: 'shot' as const, thumbnail: s.thumb, full: s.full })),
  ]
  const [sel, setSel] = useState(0)
  const [userPicked, setUserPicked] = useState(false) // a click selected the current video
  const [lightbox, setLightbox] = useState<string | null>(null)
  const thumbsRef = useRef<HTMLDivElement>(null)

  // Vertical mouse wheel scrolls the thumbnail strip horizontally. Native non-passive
  // listener (React's onWheel is passive, so it can't preventDefault); only hijacks when
  // the strip actually overflows, otherwise the page keeps scrolling normally.
  useEffect(() => {
    const el = thumbsRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0 || el.scrollWidth <= el.clientWidth) return
      e.preventDefault()
      el.scrollLeft += e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [items.length])

  // Clamp selection if the item list shrinks (e.g. a refetch returns fewer movies).
  useEffect(() => {
    if (sel >= items.length) setSel(0)
  }, [items.length, sel])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setLightbox(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  if (items.length === 0) return <Box className="media-stage media-empty muted">No media yet</Box>

  const current = items[Math.min(sel, items.length - 1)]

  const pick = (i: number, item: Item) => {
    setSel(i)
    setUserPicked(item.kind === 'video')
  }

  return (
    <Box className="media-carousel">
      {current.kind === 'video' ? (
        <VideoPlayer
          key={current.hls}
          src={current.hls}
          /* No poster — hls.js + preload renders the video's REAL first frame as the still. */
          autoPlay={userPicked || autoplay}
        />
      ) : (
        <Box className="media-stage">
          <IconButton
            type="button"
            plain
            size="fit"
            className="media-shot-btn"
            onClick={() => setLightbox(current.full)}
            label="View screenshot full size"
          >
            <Image src={current.full} alt="" />
          </IconButton>
        </Box>
      )}

      {items.length > 1 && (
        <Box ref={thumbsRef} className="media-thumbs">
          {items.map((it, i) => (
            <IconButton
              type="button"
              plain
              size="fit"
              key={i}
              className={`media-thumb${i === sel ? ' active' : ''}`}
              onClick={() => pick(i, it)}
              label={it.kind === 'video' ? `Play ${it.name}` : `Screenshot ${i + 1}`}
            >
              <Image src={it.thumbnail} alt="" loading="lazy" />
              {it.kind === 'video' && <Box as="span" className="media-thumb-play">▶</Box>}
            </IconButton>
          ))}
        </Box>
      )}

      {lightbox && (
        <Box className="lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <Image src={lightbox} alt="" onClick={(e) => e.stopPropagation()} />
          <IconButton
            type="button"
            plain
            size="fit"
            className="lightbox-close"
            label="Close"
            autoFocus
            onClick={() => setLightbox(null)}
          >
            ✕
          </IconButton>
        </Box>
      )}
    </Box>
  )
}

export { MediaCarousel }

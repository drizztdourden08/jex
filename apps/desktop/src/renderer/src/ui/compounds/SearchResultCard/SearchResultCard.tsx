import { memo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { SearchResult } from '@shared/search'
import type { Game } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'
import { Image } from '@ds/primitives/media/Image'
import { headerCdnUrl, localArtUrl } from '@/lib/steam/media'
import { ArtFallback } from '@ui/compounds/ArtFallback'
import './SearchResultCard.css'

/** Sentiment tone for a review percentage, matching the detail-page bars. */
const reviewTone = (percent?: number): string => {
  if (percent == null) return ''
  return percent >= 70 ? 'good' : percent >= 40 ? 'mid' : 'bad'
}

const price = (r: SearchResult): string => {
  if (r.priceText) return r.priceText
  if (r.priceCents === 0) return 'Free'
  return ''
}

/** A whole-catalog search hit. Links into the shared detail view (which hydrates
 *  + caches the full game on open). `owned` is the matching mirror row, if any,
 *  used only to badge "In library / Wishlisted". */
const SearchResultCard = memo(function SearchResultCard({
  result,
  owned,
}: {
  result: SearchResult
  owned?: Game
}) {
  const from = useLocation().pathname
  const tone = reviewTone(result.review?.percent)
  const p = price(result)
  // Art source chain, highest quality first, each falling back on 404:
  //  1. locally-cached art (if owned),
  //  2. legacy CDN header.jpg (460×215) — sharp, exists for most games,
  //  3. the row's hi-res capsule (616×353) derived from its capsule URL,
  //  4. the row's small capsule (231×87) — newer games only have this,
  //  5. styled placeholder.
  // (Newer titles' header.jpg 404s at the cloudflare path — that was the regression
  // where everything fell to the tiny capsule; the sharp sources now come first.)
  const bigCapsule = result.capsule?.replace('capsule_231x87', 'capsule_616x353')
  const srcs = [
    owned?.hasLocalArt ? localArtUrl(result.appid) : null,
    headerCdnUrl(result.appid),
    bigCapsule !== result.capsule ? bigCapsule : null,
    result.capsule,
  ].filter(Boolean) as string[]
  const [srcIdx, setSrcIdx] = useState(0)
  const exhausted = srcIdx >= srcs.length
  const badge = owned?.installed
    ? 'Installed'
    : owned?.owned
      ? 'In library'
      : owned?.wishlisted
        ? 'Wishlisted'
        : null

  return (
    <Link to={`/game/${result.appid}`} state={{ from, name: result.name }} className="card">
      <Box className="card-art">
        {exhausted ? (
          <ArtFallback />
        ) : (
          <Image src={srcs[srcIdx]} alt="" loading="lazy" onError={() => setSrcIdx((i) => i + 1)} />
        )}
        {result.discountPct ? (
          <Box className="search-badge search-discount">-{result.discountPct}%</Box>
        ) : null}
        {badge && <Box className="search-badge search-owned">{badge}</Box>}
      </Box>
      <Box className="body">
        <Box className="title">{result.name}</Box>
        <Box className="row muted" style={{ gap: 8, fontSize: 12, flexWrap: 'wrap' }}>
          {result.review?.percent != null && (
            <Box as="span" className={`search-review ${tone}`}>{result.review.percent}%</Box>
          )}
          {result.released && <Box as="span">{result.released}</Box>}
          {p && <Box as="span" style={{ marginLeft: 'auto' }}>{p}</Box>}
        </Box>
      </Box>
    </Link>
  )
})

export { SearchResultCard }

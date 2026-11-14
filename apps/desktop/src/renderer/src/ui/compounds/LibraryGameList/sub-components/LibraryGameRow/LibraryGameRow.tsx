import { memo, useState } from 'react'
import type { SyntheticEvent } from 'react'
import { Box } from '@ds/primitives/layout/Box'
import { Image } from '@ds/primitives/media/Image'
import { capsuleUrl, localArtUrl } from '@/lib/steam/media'
import type { LibraryGameRowProps } from '../../LibraryGameList.type'

/** One list row. Art falls back local header → CDN capsule → blank tile. Memoized:
 *  scrolling re-renders the window, not every row's image. */
const LibraryGameRow = memo(({ game }: LibraryGameRowProps) => {
  const [failed, setFailed] = useState(false)
  const handleError = (e: SyntheticEvent<HTMLImageElement>) => {
    const t = e.currentTarget
    if (t.dataset.fb) {
      setFailed(true)
      return
    }
    t.dataset.fb = '1'
    t.src = capsuleUrl(game)
  }

  return (
    <Box className="lib-row">
      {failed ? (
        <Box className="lib-row-art lib-row-art-blank" aria-hidden />
      ) : (
        <Image className="lib-row-art" src={localArtUrl(game.appid)} alt="" loading="lazy" onError={handleError} />
      )}
      <Box as="span" className="lib-row-name" title={game.name}>
        {game.name}
      </Box>
      {game.installed && <Box as="span" className="dot inst lib-row-inst" title="Installed" />}
    </Box>
  )
})
LibraryGameRow.displayName = 'LibraryGameRow'

export { LibraryGameRow }

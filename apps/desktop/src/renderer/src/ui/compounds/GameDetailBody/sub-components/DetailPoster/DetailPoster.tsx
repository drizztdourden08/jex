import type { Game } from '@shared/library'
import { Image } from '@ds/primitives/media/Image'
import { posterSources } from '../../GameDetailBody.helpers'

type DetailPosterProps = {
  game: Game
}

/** Tall cover art walking the fallback chain on error. Render it keyed by appid: the
 *  chain position lives on the DOM node, which must not carry over to another game. */
const DetailPoster = ({ game }: DetailPosterProps) => {
  const srcs = posterSources(game)
  return (
    <Image
      className="detail-poster"
      src={srcs[0]}
      alt=""
      onError={(e) => {
        const t = e.currentTarget as HTMLImageElement
        const next = Number(t.dataset.i ?? '0') + 1
        if (next < srcs.length) {
          t.dataset.i = String(next)
          t.src = srcs[next]
        }
      }}
    />
  )
}

export { DetailPoster }
export type { DetailPosterProps }

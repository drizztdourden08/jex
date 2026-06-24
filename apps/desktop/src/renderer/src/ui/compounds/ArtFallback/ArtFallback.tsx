import { Box } from '@ds/primitives/layout/Box'
import { Mascot } from '@ds/primitives/util/Mascot'

/** Cover-art fallback shown when a game's art can't load: a dark-slate panel with a
 *  faint (~20%), greyscale, centered mascot. Occupies the cover's aspect box so the
 *  card keeps its shape. Shared by GameCard, SearchResultCard, and PickCard. */
const ArtFallback = () => (
  <Box className="card-art-fallback" aria-hidden>
    <Mascot className="card-art-fallback-mascot" size={72} state="static" />
  </Box>
)

export { ArtFallback }

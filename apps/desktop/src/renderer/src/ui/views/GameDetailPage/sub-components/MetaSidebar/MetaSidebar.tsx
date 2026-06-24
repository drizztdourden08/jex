import type { Game } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'
import { Tag } from '@ds/primitives/feedback/Tag'
import { FeatureIcon, activeFeatures } from '@ui/compounds/FeatureIcon'
import { hrs } from '../../behavior/detail-utils'
import { Block } from './sub-components/Block'

type MetaSidebarProps = {
  game: Game
  extrasLoading: boolean
}

const MetaSidebar = ({ game, extrasLoading }: MetaSidebarProps) => {
  const feats = activeFeatures(game.features)
  return (
    <Box as="aside" className="meta-sidebar">
      {feats.length > 0 && (
        <Block title="Features">
          <Box className="feature-chips">
            {feats.map((f) => (
              <Tag key={f.key} label={f.label} icon={<FeatureIcon name={f.icon} />} />
            ))}
          </Box>
        </Block>
      )}

      {(game.developers.length > 0 || game.publishers.length > 0) && (
        <Block title="Credits">
          {game.developers.length > 0 && (
            <Box className="kv">
              <Box as="span" className="muted">Developer</Box>
              <Box as="span">{game.developers.join(', ')}</Box>
            </Box>
          )}
          {game.publishers.length > 0 && (
            <Box className="kv">
              <Box as="span" className="muted">Publisher</Box>
              <Box as="span">{game.publishers.join(', ')}</Box>
            </Box>
          )}
          {game.releaseDate && (
            <Box className="kv">
              <Box as="span" className="muted">Released</Box>
              <Box as="span">{game.releaseDate}</Box>
            </Box>
          )}
        </Block>
      )}

      {game.genres.length > 0 && (
        <Block title="Genres">
          <Box className="feature-chips">
            {game.genres.map((x) => (
              <Tag key={x} label={x} />
            ))}
          </Box>
        </Block>
      )}

      <Block title="Platforms">
        <Box className="row" style={{ gap: 6 }}>
          {game.platforms.windows && <Box as="span" className="pill">Windows</Box>}
          {game.platforms.mac && <Box as="span" className="pill">macOS</Box>}
          {game.platforms.linux && <Box as="span" className="pill">Linux</Box>}
        </Box>
      </Block>

      {(hrs(game.hltb?.main) || hrs(game.medianPlaytime)) && (
        <Block title="Time to play">
          {hrs(game.hltb?.main) && (
            <Box className="kv">
              <Box as="span" className="muted">Main story</Box>
              <Box as="span">{hrs(game.hltb!.main)}</Box>
            </Box>
          )}
          {hrs(game.hltb?.complete) && (
            <Box className="kv">
              <Box as="span" className="muted">Completionist</Box>
              <Box as="span">{hrs(game.hltb!.complete)}</Box>
            </Box>
          )}
          {hrs(game.medianPlaytime) && (
            <Box className="kv">
              <Box as="span" className="muted">Median played</Box>
              <Box as="span">{hrs(game.medianPlaytime)}</Box>
            </Box>
          )}
        </Block>
      )}

      {game.languages && game.languages.length > 0 && (
        <Block title="Languages">
          <Box className="muted langs">{game.languages.join(', ')}</Box>
        </Block>
      )}

      {(game.ownersEstimate || game.dlcCount || game.ageRating) && (
        <Block title="More">
          {game.ownersEstimate && (
            <Box className="kv">
              <Box as="span" className="muted">Owners (est.)</Box>
              <Box as="span">{game.ownersEstimate}</Box>
            </Box>
          )}
          {game.dlcCount ? (
            <Box className="kv">
              <Box as="span" className="muted">DLC</Box>
              <Box as="span">{game.dlcCount}</Box>
            </Box>
          ) : null}
          {game.ageRating && (
            <Box className="kv">
              <Box as="span" className="muted">Age rating</Box>
              <Box as="span">{game.ageRating}</Box>
            </Box>
          )}
        </Block>
      )}

      {game.tags.length > 0 ? (
        <Block title="Tags">
          <Box className="feature-chips">
            {game.tags.slice(0, 12).map((x) => (
              <Tag key={x} label={x} />
            ))}
          </Box>
        </Block>
      ) : extrasLoading ? (
        <Block title="Tags">
          <Box className="skeleton-chips">
            {[44, 60, 36, 52, 48].map((w, i) => (
              <Box as="span" key={i} className="skeleton skeleton-pill" style={{ width: w }} />
            ))}
          </Box>
        </Block>
      ) : null}
    </Box>
  )
}

export { MetaSidebar }
export type { MetaSidebarProps }

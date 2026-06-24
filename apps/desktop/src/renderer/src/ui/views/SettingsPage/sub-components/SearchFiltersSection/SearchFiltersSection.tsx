import type { SearchVocab } from '@shared/search'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { relDays } from './SearchFiltersSection.helpers'

type SearchFiltersSectionProps = {
  vocab: SearchVocab | null
  syncingVocab: boolean
  syncVocab: () => void
}

const SearchFiltersSection = ({ vocab, syncingVocab, syncVocab }: SearchFiltersSectionProps) => {
  return (
    <Box className="panel">
      <Box as="h3">Search filters</Box>
      <Box as="p" className="muted">
        The Search tab filters the whole Steam catalog by Steam's full tag list
        (genres, themes, features). Sync it once into this app; re-sync occasionally
        to pick up new tags. Your own library's tags are folded in automatically.
      </Box>
      <Box className="row">
        <Button onClick={syncVocab} disabled={syncingVocab}>
          {syncingVocab ? 'Syncing…' : vocab ? 'Re-sync filters' : 'Sync search filters'}
        </Button>
        <Box as="span" className="muted">
          {vocab
            ? `${vocab.tags.length.toLocaleString()} tags · synced ${relDays(vocab.syncedAt)}`
            : 'Not synced yet.'}
        </Box>
      </Box>
    </Box>
  )
}

export { SearchFiltersSection }
export type { SearchFiltersSectionProps }

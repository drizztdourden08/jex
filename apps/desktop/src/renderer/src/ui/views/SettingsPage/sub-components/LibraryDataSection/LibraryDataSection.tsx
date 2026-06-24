import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'

type LibraryDataSectionProps = {
  confirmDrop: boolean
  setConfirmDrop: (v: boolean) => void
  dropMsg: string | null
  dropMetadata: () => void
}

const LibraryDataSection = ({
  confirmDrop,
  setConfirmDrop,
  dropMsg,
  dropMetadata,
}: LibraryDataSectionProps) => {
  return (
    <Box className="panel">
      <Box as="h3">Library data</Box>
      <Box as="p" className="muted">
        Drop all fetched metadata — descriptions, media, reviews, scores, features and
        tags — and re-queue every game for enrichment. Your installed/owned list and
        playtime are kept; a sync re-fetches the rest (subject to Steam's rate limit).
      </Box>
      <Box className="row">
        <Button
          variant={confirmDrop ? 'danger' : 'secondary'}
          onClick={dropMetadata}
        >
          {confirmDrop ? 'Click again to confirm' : 'Drop all metadata'}
        </Button>
        {confirmDrop && (
          <Button variant="secondary" onClick={() => setConfirmDrop(false)}>
            Cancel
          </Button>
        )}
      </Box>
      {dropMsg && (
        <Box as="p" className="muted" style={{ marginTop: 8 }}>
          {dropMsg}
        </Box>
      )}
    </Box>
  )
}

export { LibraryDataSection }
export type { LibraryDataSectionProps }

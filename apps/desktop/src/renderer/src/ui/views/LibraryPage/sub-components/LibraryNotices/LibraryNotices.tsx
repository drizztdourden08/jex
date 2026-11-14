import type { ScanResult } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'

type LibraryNoticesProps = {
  keySet: boolean
  scanInfo: ScanResult | null
}

/** Setup hints above the library. Metadata stats sit in the header; sync progress
 *  and its outcome live in the title-bar activity popover. */
const LibraryNotices = ({ keySet, scanInfo }: LibraryNoticesProps) => (
  <>
    {!keySet && (
      <Box className="panel lib-notice">
        Showing installed games. Add a Steam Web API key in Settings to pull your full
        owned library (incl. not-installed) and metadata.
      </Box>
    )}

    {scanInfo && !scanInfo.detected.steamPath && (
      <Box className="panel lib-notice">Couldn't find a Steam install on this PC.</Box>
    )}
  </>
)

export { LibraryNotices }
export type { LibraryNoticesProps }

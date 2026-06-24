import type { DetectResult } from '@shared/library'
import { Box } from '@ds/primitives/layout/Box'

type SteamDetectionSectionProps = {
  detect: DetectResult | null
  loading: boolean
}

const SteamDetectionSection = ({ detect, loading }: SteamDetectionSectionProps) => {
  return (
    <Box className="panel">
      <Box as="h3">Steam detection</Box>
      {loading ? (
        <Box as="p" className="muted">Detecting…</Box>
      ) : !detect?.steamPath ? (
        <Box as="p" className="muted">No Steam install found on this PC.</Box>
      ) : (
        <>
          <Box className="field">
            <Box as="label">Steam install</Box>
            <Box>{detect.steamPath}</Box>
          </Box>
          <Box className="field">
            <Box as="label">Signed-in account</Box>
            <Box>
              {detect.currentUser
                ? `${detect.currentUser.personaName} (${detect.currentUser.steamId})`
                : 'none detected'}
            </Box>
          </Box>
          <Box className="field" style={{ marginBottom: 0 }}>
            <Box as="label">Library folders ({detect.libraryFolders.length})</Box>
            <Box className="muted">{detect.libraryFolders.map((f) => f.path).join(' · ')}</Box>
          </Box>
        </>
      )}
    </Box>
  )
}

export { SteamDetectionSection }
export type { SteamDetectionSectionProps }

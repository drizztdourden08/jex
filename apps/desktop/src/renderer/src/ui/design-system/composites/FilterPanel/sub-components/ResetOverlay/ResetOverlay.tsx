import { Box } from '@ds/primitives/layout/Box'

const ResetOverlay = ({ onClick, compact }: { onClick: () => void; compact?: boolean }) => {
  return (
    <Box className={`filter-reset-overlay${compact ? ' compact' : ''}`} onClick={onClick} role="button" tabIndex={0}>
      {compact ? (
        <Box as="span">Click to reset</Box>
      ) : (
        <Box className="filter-reset-msg">
          <Box as="strong">An advanced filter is still active.</Box>
          <Box as="span">Click here to reset — or pick “Advanced” again to keep editing.</Box>
        </Box>
      )}
    </Box>
  )
}

export { ResetOverlay }

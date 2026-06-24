import type { CudaStatus } from '@shared/ai'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'

/**
 * Callout offering one-click CUDA acceleration, shown only when an NVIDIA GPU is
 * present but CUDA isn't active yet. Bare and presentational. During install it
 * shows a spinner + the current phase (winget gives no meaningful %); on success
 * it asks the user to restart, since CUDA is picked up on the next launch.
 */
const CudaCallout = ({ status, installing, message, installed, error, onInstall }: CudaCalloutProps) => {
  if (!status?.installable) return null

  return (
    <Box className="cuda-callout">
      <Box className="cuda-callout-text">
        <Box as="strong">Enable CUDA acceleration</Box>
        <Box as="p" className="muted">
          Your NVIDIA GPU runs the AI faster on CUDA (and avoids the integrated GPU). This installs
          NVIDIA's CUDA Toolkit — a ~3 GB system install with a Windows admin prompt.
        </Box>
        {error && <Box as="p" className="model-error">{error}</Box>}
        {installed && !error && (
          <Box as="p" className="cuda-done">✓ Installed — restart the app to enable CUDA.</Box>
        )}
      </Box>
      {installing ? (
        <Box as="span" className="cuda-progress">
          <Box as="span" className="cuda-spinner" aria-hidden />
          <Box as="span" className="muted">{message || 'Installing…'}</Box>
        </Box>
      ) : (
        !installed && (
          <Button className="cuda-install-btn" onClick={onInstall}>
            Install CUDA
          </Button>
        )
      )}
    </Box>
  )
}

interface CudaCalloutProps {
  status: CudaStatus | null
  installing: boolean
  message: string
  installed: boolean
  error: string | null
  onInstall: () => void
}

export { CudaCallout }
export type { CudaCalloutProps }

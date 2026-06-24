import { useState } from 'react'
import { TitleBar } from '@ui/views/TitleBar'
import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'

const POINTS = [
  'Reads your local Steam install — library folders, installed games, and cached cover art. No account or login required.',
  'Optionally uses a Steam Web API key you provide to fetch your full owned library (incl. not-installed games) and metadata. It is sent only to Steam.',
  'Includes a built-in AI for natural-language search. The model runs entirely on your PC — a one-time ~2 GB download on first use, no account, no key.',
  'Uses a few GB of disk and RAM while running. Everything (the library mirror, settings, and any keys) is stored locally under your app-data folder — nothing is uploaded anywhere.',
]

const FirstRun = ({ onAccept }: { onAccept: () => void }) => {
  const [busy, setBusy] = useState(false)

  const accept = async () => {
    setBusy(true)
    await window.api.settings.set('acceptedTerms', true)
    onAccept()
  }

  return (
    <Box className="root-shell">
      <TitleBar />
      <Box
        className="content"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box className="panel" style={{ maxWidth: 620 }}>
          <Box as="h1" style={{ marginTop: 0 }}>Welcome to Jex</Box>
          <Box as="p" className="muted">Before you start, here's exactly what this app does and accesses:</Box>
          <Box as="ul" style={{ lineHeight: 1.7, paddingLeft: 20 }}>
            {POINTS.map((p) => (
              <Box as="li" key={p} style={{ marginBottom: 8 }}>
                {p}
              </Box>
            ))}
          </Box>
          <Button onClick={accept} disabled={busy} style={{ marginTop: 8 }}>
            {busy ? 'Starting…' : 'I understand — continue'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export { FirstRun }

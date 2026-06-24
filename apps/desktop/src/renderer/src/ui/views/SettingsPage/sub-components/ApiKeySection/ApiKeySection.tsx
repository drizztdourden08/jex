import { Box } from '@ds/primitives/layout/Box'
import { Button } from '@ds/primitives/actions/Button'
import { TextInput } from '@ds/primitives/form/TextInput'

type ApiKeySectionProps = {
  keySet: boolean
  keyInput: string
  setKeyInput: (v: string) => void
  msg: string | null
  saveKey: () => void
  clearKey: () => void
}

const ApiKeySection = ({
  keySet,
  keyInput,
  setKeyInput,
  msg,
  saveKey,
  clearKey,
}: ApiKeySectionProps) => {
  return (
    <Box className="panel">
      <Box as="h3">Steam Web API key</Box>
      <Box as="p" className="muted">
        Fetches your full owned library (incl. not-installed games) + metadata. Stored
        encrypted on this PC and sent only to Steam. Get one at{' '}
        <Box as="a" href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noreferrer">
          steamcommunity.com/dev/apikey
        </Box>{' '}
        (free — the domain field can be <Box as="code">localhost</Box>).
      </Box>
      {keySet ? (
        <Box className="row">
          <Box as="span" className="muted">✓ A key is saved.</Box>
          <Button variant="secondary" onClick={clearKey}>
            Remove
          </Button>
        </Box>
      ) : (
        <Box className="row">
          <TextInput
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.currentTarget.value)}
            placeholder="Steam Web API key"
            style={{ flex: 1 }}
          />
          <Button onClick={saveKey} disabled={!keyInput.trim()}>
            Save
          </Button>
        </Box>
      )}
      {msg && (
        <Box as="p" className="muted" style={{ marginTop: 8 }}>
          {msg}
        </Box>
      )}
    </Box>
  )
}

export { ApiKeySection }
export type { ApiKeySectionProps }

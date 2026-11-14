import { Flex } from '@ds/primitives/layout/Flex'
import { Stack } from '@ds/primitives/layout/Stack'
import { Text } from '@ds/primitives/text/Text'
import { Button } from '@ds/primitives/actions/Button'
import { TextInput } from '@ds/primitives/form/TextInput'
import { PROVIDER_LABEL } from '../../RemoteKeysSection.constants'
import type { ProviderKeyResult, ProviderKeyRowProps } from './ProviderKeyRow.type'

const describe = (r: ProviderKeyResult): string => {
  if (r.check === 'ok') return 'Key verified.'
  if (r.check === 'unverified') return `Saved, but could not verify it${r.message ? `: ${r.message}` : '.'}`
  return `Rejected${r.message ? `: ${r.message}` : ' by the provider.'}`
}

// One provider: a masked key field with Save, or "saved" with Replace / Clear. The stored
// key is never displayed (the API only reports that one is present).
const ProviderKeyRow = ({
  provider,
  present,
  loaded,
  draft,
  replacing,
  result,
  busy,
  disabled,
  onDraft,
  onSave,
  onClear,
  onReplace,
  onCancelReplace,
}: ProviderKeyRowProps) => {
  const label = PROVIDER_LABEL[provider]
  const showField = loaded && (!present || replacing)
  return (
    <Stack gap={1}>
      <Flex gap={3} style={{ alignItems: 'center' }}>
        <Text as="span" tone="default" style={{ width: 150, flex: 'none' }}>
          {label}
        </Text>
        {showField ? (
          <>
            <TextInput
              type="password"
              autoComplete="off"
              value={draft}
              onChange={(e) => onDraft(provider, e.currentTarget.value)}
              placeholder="Paste API key"
              aria-label={`${label} API key`}
              style={{ flex: 1 }}
            />
            <Button onClick={() => onSave(provider)} disabled={disabled || !draft.trim()}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
            {present && (
              <Button variant="ghost" onClick={() => onCancelReplace(provider)} disabled={disabled}>
                Cancel
              </Button>
            )}
          </>
        ) : (
          <>
            <Text as="span" tone="muted" style={{ flex: 1 }}>
              {loaded ? '✓ Key saved' : 'Loading…'}
            </Text>
            {loaded && (
              <>
                <Button variant="secondary" onClick={() => onReplace(provider)} disabled={disabled}>
                  Replace
                </Button>
                <Button variant="secondary" onClick={() => onClear(provider)} disabled={disabled}>
                  {busy ? 'Clearing…' : 'Clear'}
                </Button>
              </>
            )}
          </>
        )}
      </Flex>
      {result && (
        <Text as="p" tone="muted" role="status">
          {describe(result)}
        </Text>
      )}
    </Stack>
  )
}

export { ProviderKeyRow }

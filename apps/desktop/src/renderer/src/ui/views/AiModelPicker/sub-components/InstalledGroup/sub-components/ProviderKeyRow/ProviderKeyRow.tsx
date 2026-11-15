import { Button } from '@ds/primitives/actions/Button'
import { TextInput } from '@ds/primitives/form/TextInput'
import { SettingRow } from '@ds/composites/SettingRow'
import { PROVIDER_LABEL } from '../../../../AiModelPicker.constants'
import type { ProviderKeyResult, ProviderKeyRowProps } from './ProviderKeyRow.type'

const describe = (r: ProviderKeyResult): string => {
  if (r.check === 'ok') return 'Cloud · key verified.'
  if (r.check === 'unverified') return `Saved, but could not verify it${r.message ? `: ${r.message}` : '.'}`
  return `Rejected${r.message ? `: ${r.message}` : ' by the provider.'}`
}

const stateText = (loaded: boolean, present: boolean): string => {
  if (!loaded) return 'Loading…'
  return present ? 'Cloud · ✓ API key saved' : 'Cloud · needs an API key to use these models'
}

// A provider section's header: the provider name, then a masked key field with Save, or
// "saved" with Replace / Remove. The stored key is never displayed (the API only reports
// that one is present).
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
    <SettingRow
      label={label}
      description={result ? describe(result) : stateText(loaded, present)}
      control={showField ? 'wide' : 'auto'}
    >
      {showField && (
        <>
          <TextInput
            type="password"
            autoComplete="off"
            value={draft}
            onChange={(e) => onDraft(provider, e.currentTarget.value)}
            placeholder="Paste API key"
            aria-label={`${label} API key`}
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
      )}
      {loaded && !showField && (
        <>
          <Button variant="secondary" onClick={() => onReplace(provider)} disabled={disabled}>
            Replace
          </Button>
          <Button variant="secondary" onClick={() => onClear(provider)} disabled={disabled}>
            {busy ? 'Removing…' : 'Remove key'}
          </Button>
        </>
      )}
    </SettingRow>
  )
}

export { ProviderKeyRow }

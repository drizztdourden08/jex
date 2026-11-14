import { Text } from '@ds/primitives/text/Text'
import { SettingsGroup } from '@ds/composites/SettingsGroup'
import { ProviderKeyRow } from './sub-components/ProviderKeyRow'
import { PROVIDERS } from './ProvidersGroup.constants'
import type { ProvidersGroupProps } from './ProvidersGroup.type'

// Remote (cloud) providers: one key row each. Keys are stored encrypted in the main
// process and never shown again once saved. Reasoning effort is picked per chat.
const ProvidersGroup = ({
  status,
  drafts,
  replacing,
  results,
  busy,
  error,
  engineInstalled,
  setDraft,
  startReplace,
  cancelReplace,
  save,
  clear,
}: ProvidersGroupProps) => (
  <SettingsGroup
    label="Remote providers"
    description="Use Claude or OpenAI instead of a local model. A key is stored encrypted on this PC and sent only to its provider; while a remote model is active, messages and tool results go to that provider."
  >
    {PROVIDERS.map((p) => (
      <ProviderKeyRow
        key={p}
        provider={p}
        present={status?.[p].present ?? false}
        loaded={status != null}
        draft={drafts[p] ?? ''}
        replacing={replacing[p] === true}
        result={results[p] ?? null}
        busy={busy === p}
        disabled={busy != null}
        onDraft={setDraft}
        onSave={save}
        onClear={clear}
        onReplace={startReplace}
        onCancelReplace={cancelReplace}
      />
    ))}
    {!engineInstalled && (
      <Text as="p" tone="muted">
        Remote models run through the AI engine: install it above.
      </Text>
    )}
    {error && (
      <Text as="p" tone="danger" role="alert">
        {error}
      </Text>
    )}
  </SettingsGroup>
)

export { ProvidersGroup }

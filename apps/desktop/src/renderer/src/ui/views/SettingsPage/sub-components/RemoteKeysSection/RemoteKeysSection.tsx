import { Box } from '@ds/primitives/layout/Box'
import { Stack } from '@ds/primitives/layout/Stack'
import { Flex } from '@ds/primitives/layout/Flex'
import { Text } from '@ds/primitives/text/Text'
import { SegmentedControl } from '@ds/primitives/form/SegmentedControl'
import { ProviderKeyRow } from './sub-components/ProviderKeyRow'
import { EFFORT_OPTIONS, PROVIDERS, isEffort } from './RemoteKeysSection.constants'
import type { RemoteKeysSectionProps } from './RemoteKeysSection.type'

// Remote (cloud) models: one key row per provider, plus the reasoning effort. Keys are
// stored encrypted in the main process and never shown again once saved.
const RemoteKeysSection = ({
  status,
  effort,
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
  setEffort,
}: RemoteKeysSectionProps) => (
  <Box className="panel">
    <Box as="h3">Remote AI models</Box>
    <Text as="p" tone="muted">
      Use Claude or OpenAI instead of a local model. Your key is stored encrypted on this PC and
      sent only to its own provider. Messages and tool results go to that provider while a remote
      model is active.
    </Text>
    <Stack gap={3}>
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
      <Flex gap={3} style={{ alignItems: 'center' }}>
        <Text as="span" tone="default" style={{ width: 150, flex: 'none' }}>
          Reasoning effort
        </Text>
        <SegmentedControl
          options={EFFORT_OPTIONS}
          value={effort}
          onChange={(v) => {
            if (isEffort(v)) void setEffort(v)
          }}
        />
      </Flex>
      {!engineInstalled && (
        <Text as="p" tone="muted">
          Remote models run through the AI engine — install it in the AI engine section below.
        </Text>
      )}
      {error && (
        <Text as="p" tone="muted" role="alert">
          {error}
        </Text>
      )}
    </Stack>
  </Box>
)

export { RemoteKeysSection }

import { Box } from '@ds/primitives/layout/Box'
import { Text } from '@ds/primitives/text/Text'
import { Button } from '@ds/primitives/actions/Button'
import { SettingsGroup } from '@ds/composites/SettingsGroup'
import { SettingRow } from '@ds/composites/SettingRow'
import { InstalledModelList } from './sub-components/InstalledModelList'
import { RemoteModelList } from './sub-components/RemoteModelList'
import { ProviderKeyRow } from './sub-components/ProviderKeyRow'
import { INSTALLED_HELP } from '../../AiModelPicker.constants'
import type { InstalledGroupProps } from './InstalledGroup.type'
import './InstalledGroup.css'

// The installed models as one table split by provider: a Local section (no key), then one
// section per cloud provider whose header row holds that provider's API key. Bare: data
// and actions via props.
const InstalledGroup = ({
  localModels,
  downloading,
  inactiveCount,
  onSelectLocal,
  onRemoveLocal,
  onCleanLocal,
  sections,
  activeRef,
  busyRef,
  onUseRemote,
  onRemoveRemote,
  keys,
  error,
}: InstalledGroupProps) => (
  <SettingsGroup label="Your models" description={INSTALLED_HELP}>
    <Box className="model-section">
      <SettingRow label="Local" description="Runs on this PC · no key needed">
        {inactiveCount > 0 && (
          <Button variant="ghost" className="ghost model-clean-btn" onClick={onCleanLocal}>
            Clean up ({inactiveCount} unused)
          </Button>
        )}
      </SettingRow>
      <InstalledModelList
        models={localModels}
        downloading={downloading}
        onSelect={onSelectLocal}
        onRemove={onRemoveLocal}
      />
    </Box>
    {sections.map(({ provider, models }) => (
      <Box key={provider} className="model-section">
        <ProviderKeyRow
          provider={provider}
          present={keys.status?.[provider].present ?? false}
          loaded={keys.status != null}
          draft={keys.drafts[provider] ?? ''}
          replacing={keys.replacing[provider] === true}
          result={keys.results[provider] ?? null}
          busy={keys.busy === provider}
          disabled={keys.busy != null}
          onDraft={keys.setDraft}
          onSave={(p) => void keys.save(p)}
          onClear={(p) => void keys.clear(p)}
          onReplace={keys.startReplace}
          onCancelReplace={keys.cancelReplace}
        />
        <RemoteModelList
          models={models}
          activeRef={activeRef}
          busyRef={busyRef}
          onUse={onUseRemote}
          onRemove={onRemoveRemote}
        />
      </Box>
    ))}
    {(error ?? keys.error) && (
      <Text as="p" tone="danger" role="alert">
        {error ?? keys.error}
      </Text>
    )}
  </SettingsGroup>
)

export { InstalledGroup }

import './SettingsPage.css'
import { Box } from '@ds/primitives/layout/Box'
import { SettingsSection } from '@ds/composites/SettingsSection'
import { AiModelPicker } from '@ui/views/AiModelPicker'
import { AiToolsPanel } from '@ui/views/AiToolsPanel'
import { useSettings } from './behavior/useSettings'
import { useAiEngine } from './behavior/useAiEngine'
import { useRemoteKeys } from './behavior/useRemoteKeys'
import { SteamGroup } from './sub-components/SteamGroup'
import { SyncGroup } from './sub-components/SyncGroup'
import { LibraryDataGroup } from './sub-components/LibraryDataGroup'
import { EngineGroup } from './sub-components/EngineGroup'
import { ProvidersGroup } from './sub-components/ProvidersGroup'
import { PlaybackGroup } from './sub-components/PlaybackGroup'

// Settings: three sections (Library, AI, General), each a SettingsSection of labelled
// groups built from the same row. Per-chat AI options (model, effort, permissions,
// context) live in the chat footer, not here.
const SettingsPage = () => {
  const {
    detect,
    loading,
    keySet,
    keyInput,
    setKeyInput,
    msg,
    confirmDrop,
    setConfirmDrop,
    dropMsg,
    prefs,
    vocab,
    syncingVocab,
    syncVocab,
    saveKey,
    clearKey,
    setPref,
    dropMetadata,
  } = useSettings()
  const aiEngine = useAiEngine()
  const remoteKeys = useRemoteKeys()
  const engineInstalled = aiEngine.status?.installed === true

  return (
    <Box className="settings-page">
      <Box as="h1" className="settings-page-title">
        Settings
      </Box>

      <SettingsSection title="Library" description="Your Steam install, the Web API key, and how the local mirror stays in sync.">
        <SteamGroup
          detect={detect}
          loading={loading}
          keySet={keySet}
          keyInput={keyInput}
          setKeyInput={setKeyInput}
          msg={msg}
          saveKey={saveKey}
          clearKey={clearKey}
        />
        <SyncGroup prefs={prefs} setPref={setPref} vocab={vocab} syncingVocab={syncingVocab} syncVocab={syncVocab} />
        <LibraryDataGroup
          confirmDrop={confirmDrop}
          setConfirmDrop={setConfirmDrop}
          dropMsg={dropMsg}
          dropMetadata={dropMetadata}
        />
      </SettingsSection>

      <SettingsSection
        title="AI assistant"
        description="The engine, remote providers, local models and what the assistant may do. Model and reasoning effort are picked per chat."
      >
        <EngineGroup {...aiEngine} />
        <ProvidersGroup {...remoteKeys} engineInstalled={engineInstalled} />
        {/* Models and tools only make sense once the engine plugin is installed. */}
        {engineInstalled && (
          <>
            <AiModelPicker />
            <AiToolsPanel />
          </>
        )}
      </SettingsSection>

      <SettingsSection title="General">
        <PlaybackGroup prefs={prefs} setPref={setPref} />
      </SettingsSection>
    </Box>
  )
}

export { SettingsPage }

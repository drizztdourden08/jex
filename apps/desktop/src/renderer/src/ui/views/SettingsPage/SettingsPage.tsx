import './SettingsPage.css'
import { Box } from '@ds/primitives/layout/Box'
import { Spinner } from '@ds/primitives/feedback/Spinner'
import { SettingsSection } from '@ds/composites/SettingsSection'
import { Tabs } from '@ds/composites/Tabs'
import { AiModelPicker } from '@ui/views/AiModelPicker'
import { AiToolsPanel } from '@ui/views/AiToolsPanel'
import { useSettings } from './behavior/useSettings'
import { useAiEngine } from './behavior/useAiEngine'
import { useEngineDiagnostics } from './behavior/useEngineDiagnostics'
import { useSettingsTab } from './behavior/useSettingsTab'
import { SteamGroup } from './sub-components/SteamGroup'
import { SyncGroup } from './sub-components/SyncGroup'
import { LibraryDataGroup } from './sub-components/LibraryDataGroup'
import { EngineGroup } from './sub-components/EngineGroup'
import { TroubleshootGroup } from './sub-components/TroubleshootGroup'
import { PlaybackGroup } from './sub-components/PlaybackGroup'

const TABS = [
  { id: 'library', label: 'Library' },
  { id: 'ai', label: 'AI assistant' },
  { id: 'general', label: 'General' },
]
const TAB_IDS = TABS.map((t) => t.id)

// Settings: three tabs (Library, AI, General), each a SettingsSection of labelled groups
// built from the same row. Per-chat AI options (model, effort, permissions, context) live
// in the chat footer, not here.
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
  const engineInstalled = aiEngine.status?.installed === true
  const diagnostics = useEngineDiagnostics(aiEngine.retry)
  const { tab, select } = useSettingsTab(TAB_IDS, 'library')

  return (
    <Box className="settings-page">
      <Box as="h1" className="settings-page-title">
        Settings
      </Box>
      <Tabs tabs={TABS} value={tab} onChange={select} aria-label="Settings sections" />

      {tab === 'library' && (
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
      )}

      {tab === 'ai' && (
        <SettingsSection
          title="AI assistant"
          description="The engine, your models (local and cloud, with their keys) and what the assistant may do. Model and reasoning effort are picked per chat."
        >
          <EngineGroup {...aiEngine} />
          <TroubleshootGroup {...diagnostics} />
          {/* Models (local and remote) and tools only make sense once the engine plugin is installed. */}
          {!aiEngine.status && !aiEngine.loadError && <Spinner />}
          {engineInstalled && (
            <>
              <AiModelPicker />
              <AiToolsPanel />
            </>
          )}
        </SettingsSection>
      )}

      {tab === 'general' && (
        <SettingsSection title="General">
          <PlaybackGroup prefs={prefs} setPref={setPref} />
        </SettingsSection>
      )}
    </Box>
  )
}

export { SettingsPage }

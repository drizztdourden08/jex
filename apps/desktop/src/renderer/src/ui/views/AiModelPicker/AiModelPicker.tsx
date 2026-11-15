import { useState } from 'react'
import { askConfirm } from '@/store/confirm'
import { useModelCatalog } from './behavior/useModelCatalog'
import { useCudaInstall } from './behavior/useCudaInstall'
import { useRemoteModels } from './behavior/useRemoteModels'
import { useRemoteKeys } from './behavior/useRemoteKeys'
import { useCatalog } from './behavior/useCatalog'
import { useProviderSections } from './behavior/useProviderSections'
import { ModelCompareSelect } from './sub-components/ModelCompareSelect'
import { InstalledGroup } from './sub-components/InstalledGroup'
import { CudaCallout } from './sub-components/CudaCallout'
import { Box } from '@ds/primitives/layout/Box'
import { Text } from '@ds/primitives/text/Text'
import { Button } from '@ds/primitives/actions/Button'
import { SettingsGroup } from '@ds/composites/SettingsGroup'
import { SettingRow } from '@ds/composites/SettingRow'
import { ipcErrorText } from '@/lib/ipc/ipcErrorText'
import { ACTION_LABEL, ADD_HELP, BACKEND_LABEL } from './AiModelPicker.constants'
import './AiModelPicker.css'

/**
 * Settings model picker (View), two groups of the AI settings section: one catalog to add
 * a model (local ones download, Claude / OpenAI ones are added), and the installed models
 * split by provider, each cloud provider's header holding its API key. Downloads keep
 * running after navigating away, since their state lives in the store.
 */
const AiModelPicker = () => {
  const local = useModelCatalog()
  const cuda = useCudaInstall()
  const remote = useRemoteModels()
  const keys = useRemoteKeys(remote.reload)
  const catalog = useCatalog({
    available: local.available,
    remoteModels: remote.models,
    added: remote.added,
    keys: keys.status,
    recommendedId: local.recommendedId,
  })
  const sections = useProviderSections(remote.added, remote.models, keys.status, remote.revealed)
  const [actionError, setActionError] = useState<string | null>(null)

  // Local actions can reject (engine missing, disk error); surface it. Switching model
  // reloads both sides so the one "Active" marker stays right.
  const guard = async (action: () => Promise<void>) => {
    setActionError(null)
    try {
      await action()
    } catch (e) {
      setActionError(ipcErrorText(e))
    }
  }
  const removeLocal = (id: string) =>
    guard(async () => {
      const model = local.installed.find((m) => m.id === id)
      if (model?.active) throw new Error('This model is in use. Switch to another model before deleting it.')
      const ok = await askConfirm({ title: `Delete ${model?.label ?? id}?`, message: 'This removes the model from disk and cannot be undone.', confirmLabel: 'Delete', tone: 'danger' })
      if (!ok) return
      await local.remove(id)
    })
  const selectLocal = (id: string) =>
    guard(async () => {
      await local.select(id)
      await remote.reload()
    })
  const switchRemote = async (ref: string) => {
    await remote.use(ref)
    await local.refresh()
  }

  const { chosen } = catalog
  const act = () => {
    if (!chosen) return
    if (chosen.kind === 'local') local.download(chosen.key)
    else if (chosen.kind === 'remote') void remote.add(chosen.key)
    else remote.reveal(chosen.provider)
  }

  const { backend, vramGb, errors } = local
  const chosenTooBig = chosen?.kind === 'local' && !local.fits(chosen.model) ? chosen.model : null
  const inactiveCount = local.installed.filter((m) => !m.active).length
  const compute = backend
    ? [
        BACKEND_LABEL[backend.backend] ?? backend.backend,
        backend.deviceName,
        vramGb != null ? `${Math.round(vramGb)} GB VRAM` : null,
        backend.gpu ? 'GPU-accelerated.' : 'No GPU detected: runs on the CPU and will be slow, prefer a smaller model.',
      ]
        .filter(Boolean)
        .join(' · ')
    : null

  return (
    <>
      <SettingsGroup label="Add a model" description={ADD_HELP}>
        {!remote.localRuntime && (
          <SettingRow
            label="Local runtime not installed"
            description="Install the native base in Engine above to run local models. Cloud models work without it."
          />
        )}
        {compute && <SettingRow label="Compute" description={compute} />}
        <CudaCallout
          status={cuda.status}
          installing={cuda.installing}
          message={cuda.message}
          installed={cuda.installed}
          error={cuda.error}
          onInstall={() => void cuda.install()}
        />
        {actionError && (
          <Text as="p" tone="danger" role="alert">
            {actionError}
          </Text>
        )}
        {Object.keys(errors).map((id) => (
          <Text as="p" key={id} tone="danger">
            {id}: {errors[id]}
          </Text>
        ))}
        <Box className="model-download-bar">
          <ModelCompareSelect
            entries={catalog.entries}
            value={catalog.chosenKey}
            onChange={catalog.setChosenKey}
            recommendedId={local.recommendedId}
            fits={local.fits}
          />
          <Button className="model-download-btn" onClick={act} disabled={!chosen || remote.busyRef != null}>
            {chosen ? ACTION_LABEL[chosen.kind] : 'Add'}
          </Button>
        </Box>
        {chosenTooBig && (
          <Box as="p" className="model-warn">
            ⚠ {chosenTooBig.label} (~{chosenTooBig.sizeGb} GB) is larger than your
            {vramGb != null ? ` ~${Math.round(vramGb)} GB` : ''} GPU VRAM. It still runs, partly on
            the CPU and noticeably slower.
          </Box>
        )}
      </SettingsGroup>

      <InstalledGroup
        localModels={local.installed}
        downloading={local.downloading}
        inactiveCount={inactiveCount}
        onSelectLocal={(id) => void selectLocal(id)}
        onRemoveLocal={(id) => void removeLocal(id)}
        onCleanLocal={() => void local.cleanInactive()}
        sections={sections}
        activeRef={remote.activeRef}
        busyRef={remote.busyRef}
        onUseRemote={(ref) => void switchRemote(ref)}
        onRemoveRemote={(ref) => void remote.remove(ref)}
        keys={keys}
        error={remote.error}
      />
    </>
  )
}

export { AiModelPicker }

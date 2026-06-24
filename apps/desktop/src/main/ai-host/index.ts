// AI host orchestrator. On startup, loads the base plugin if it's already installed;
// otherwise the engine stays unset and the renderer shows the setup flow. Exposes the
// status + install entry points the ai:* IPC handlers call. The UI dispatcher is built
// once and reused for every (re)load.
import type { UiDispatcher } from '@jex/ai-contract'
import type { AiEngineStatus, EnginePluginInfo } from '@shared/ai'
import { createUiDispatcher } from './ui-dispatch'
import { loadPluginFrom } from './loader'
import { installEngine as runInstall } from './install'
import { isInstalled, installedDir, fetchManifest } from './source'
import { cpus, totalmem, version } from 'node:os'
import { basePluginId, cudaPluginId } from './resolve'
import { enginePlugins as catalogPlugins, isInstallablePlugin, isManualId } from './catalog'
import { detectNvidia } from './detect'
import { isCudaToolkitInstalled, installCudaToolkit } from './cuda-toolkit'
import { getEngine } from './engine'

let sharedUi: UiDispatcher | null = null
const ui = (): UiDispatcher => (sharedUi ??= createUiDispatcher())

const initEngine = async (): Promise<void> => {
  const base = basePluginId()
  if (!isInstalled(base)) return
  try {
    await loadPluginFrom(installedDir(base), ui())
    console.log(`[ai-host] loaded engine: ${base}`)
  } catch (e) {
    console.error('[ai-host] failed to load installed engine:', e)
  }
}

const engineStatus = async (): Promise<AiEngineStatus> => {
  const { name: gpu, vramMb } = await detectNvidia()
  return {
    installed: getEngine() != null,
    base: basePluginId(),
    cuda: cudaPluginId() ?? null,
    arch: process.arch,
    cpu: cpus()[0]?.model?.trim() || process.arch,
    ramGb: Math.round(totalmem() / 1024 ** 3),
    os: version() || `${process.platform} ${process.arch}`,
    gpu,
    vramGb: vramMb != null ? Math.round(vramMb / 1024) : null,
    nvidiaGpu: gpu != null,
  }
}

// The installable plugins for this machine (base [+ CUDA if NVIDIA]) for the checklist,
// with REAL download sizes from the manifest (local plugins/dist in dev, latest release
// in prod). If the manifest can't be reached yet, sizes are left null (shown as "—").
const enginePlugins = async (): Promise<EnginePluginInfo[]> => {
  const { name } = await detectNvidia()
  const rows = catalogPlugins(name != null).map((r) => ({
    ...r,
    installed: r.manual ? isCudaToolkitInstalled() : isInstalled(r.id),
  }))
  try {
    const manifest = await fetchManifest()
    const sizes = new Map(manifest.plugins.map((p) => [p.id, p.size]))
    return rows.map((r) => ({ ...r, sizeBytes: r.manual ? null : sizes.get(r.id) ?? null }))
  } catch {
    return rows
  }
}

// Install the selected items concurrently: downloaded plugins via the verified-install
// flow, and (if the CUDA Toolkit was selected and isn't present) the NVIDIA installer
// via winget at the same time.
const installEngine = (ids: string[], onProgress?: (msg: string) => void): Promise<void> => {
  // Only real, known plugins go to the verified-install flow; the CUDA Toolkit (manual)
  // is launched via winget; unknown ids (a skewed renderer) are ignored, not crashed on.
  const pluginIds = ids.filter(isInstallablePlugin)
  const wantToolkit = ids.some(isManualId) && !isCudaToolkitInstalled()
  const tasks: Promise<void>[] = []
  if (pluginIds.length) tasks.push(runInstall(pluginIds, ui(), onProgress))
  if (wantToolkit) tasks.push(installCudaToolkit((m) => onProgress?.(m)))
  return Promise.all(tasks).then(() => undefined)
}

export { initEngine, engineStatus, enginePlugins, installEngine }

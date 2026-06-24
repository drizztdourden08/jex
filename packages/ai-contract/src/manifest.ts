// PluginManifest — published in each GitHub release alongside the plugin zips. The
// host fetches it over HTTPS from its own repo, picks the entries that match the
// machine (arch + opted-in backends), then for each: downloads the zip, verifies the
// Ed25519 signature over its sha256 against the app's embedded public key, and only
// then extracts + loads it. apiVersion / appVersionRange gate compatibility.

type PluginArch = 'win-x64' | 'win-arm64'

interface PluginEntry {
  // Stable id, e.g. 'ai-win-x64' | 'ai-win-arm64' | 'ai-win-x64-cuda'.
  id: string
  arch: PluginArch
  // Compute backends this plugin provides, e.g. ['cpu', 'vulkan'] or ['cuda'].
  backends: string[]
  // Release asset filename, e.g. 'ai-win-x64.zip'.
  file: string
  size: number
  // Lowercase hex SHA-256 of the zip.
  sha256: string
  // Base64 Ed25519 signature over the sha256 string, made with the release key.
  sig: string
  // CUDA layers on top of a base plugin rather than standing alone.
  addOn?: boolean
  // The base plugin id an add-on requires to be installed alongside it.
  requires?: string
}

interface PluginManifest {
  // Must satisfy the host's AiPlugin.apiVersion expectation.
  apiVersion: number
  // semver range of app versions these plugins are built for, e.g. '>=0.1.0 <0.2.0'.
  appVersionRange: string
  // ISO timestamp, stamped by CI at publish.
  generatedAt: string
  plugins: PluginEntry[]
}

export type { PluginManifest, PluginEntry, PluginArch }

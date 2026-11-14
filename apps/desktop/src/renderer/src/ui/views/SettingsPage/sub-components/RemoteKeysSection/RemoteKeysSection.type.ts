import type { RemoteKeysModel } from '../../behavior/useRemoteKeys'

interface RemoteKeysSectionProps extends RemoteKeysModel {
  /** The AI engine plugin is installed (remote models run through it). */
  engineInstalled: boolean
}

export type { RemoteKeysSectionProps }

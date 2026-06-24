import type { Game } from '@shared/library'

interface ActiveContext {
  /** Route group: 'wishlist' | 'library' | 'randomizer' | 'game' | 'store' | … */
  tab: string
  /** The appid whose detail page is open (gets top priority), if any. */
  appid?: number
}

interface Task {
  appid: number
  isWishlist: boolean
  /** Explicit priority override (detail fetches pin themselves to the front). */
  pin?: number
  waiters: ((g: Game | null) => void)[]
}

export type { ActiveContext, Task }

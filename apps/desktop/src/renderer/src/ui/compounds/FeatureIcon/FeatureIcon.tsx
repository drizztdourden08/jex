import type { GameFeatures } from '@shared/library'

/** Inline-SVG feature icons (no icon font — the CSP blocks external fonts). */
const ICONS: Record<string, JSX.Element> = {
  controller: (
    <>
      <rect x="2.5" y="7.5" width="19" height="9.5" rx="4.5" />
      <line x1="7" y1="11" x2="7" y2="14" />
      <line x1="5.5" y1="12.5" x2="8.5" y2="12.5" />
      <circle cx="16" cy="11.5" r="1" />
      <circle cx="18" cy="13.5" r="1" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <path d="M16 7.5a3 3 0 0 1 0 5.4" />
      <path d="M15.5 14.5c2.6.4 4.5 2.3 4.5 4.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M5.5 19.5c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" />
    </>
  ),
  cloud: (
    <path d="M7 18a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.5A3.5 3.5 0 0 1 17 18z" />
  ),
  cards: (
    <>
      <rect x="3.5" y="6" width="10" height="13" rx="2" transform="rotate(-8 8.5 12.5)" />
      <rect x="10.5" y="5" width="10" height="13" rx="2" transform="rotate(8 15.5 11.5)" />
    </>
  ),
  vr: (
    <>
      <rect x="2.5" y="8" width="19" height="9" rx="3.5" />
      <path d="M9.5 17c1-1.5 4-1.5 5 0" />
    </>
  ),
  remote: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M10 9l4 2.5-4 2.5z" fill="currentColor" stroke="none" />
      <line x1="8" y1="20" x2="16" y2="20" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
      <path d="M7 5.5H4.5V7A2.5 2.5 0 0 0 7 9.5M17 5.5h2.5V7A2.5 2.5 0 0 1 17 9.5" />
      <line x1="12" y1="13" x2="12" y2="16" />
      <path d="M8.5 20h7l-1-3.5h-5z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 2.5v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5z" />
      <path d="M9 11.5l2 2 4-4" />
    </>
  ),
}

const FeatureIcon = ({ name, size = 16 }: { name: string; size?: number }) => {
  const inner = ICONS[name]
  if (!inner) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {inner}
    </svg>
  )
}

interface FeatureDef {
  key: keyof GameFeatures
  icon: string
  label: string
  /** Show as a small badge over library-card art. */
  card?: boolean
}

/** Feature → icon + label, in display order. `card` marks the few shown on cards. */
const FEATURE_DEFS: FeatureDef[] = [
  { key: 'singleplayer', icon: 'user', label: 'Single-player' },
  { key: 'coop', icon: 'users', label: 'Co-op', card: true },
  { key: 'multiplayer', icon: 'users', label: 'Multiplayer', card: true },
  { key: 'controllerFull', icon: 'controller', label: 'Full controller', card: true },
  { key: 'controllerPartial', icon: 'controller', label: 'Partial controller' },
  { key: 'vr', icon: 'vr', label: 'VR', card: true },
  { key: 'cloud', icon: 'cloud', label: 'Cloud saves' },
  { key: 'achievements', icon: 'trophy', label: 'Achievements' },
  { key: 'tradingCards', icon: 'cards', label: 'Trading cards' },
  { key: 'remotePlayTogether', icon: 'remote', label: 'Remote Play Together' },
  { key: 'antiCheat', icon: 'shield', label: 'Anti-cheat' },
]

const activeFeatures = (f: GameFeatures | undefined, cardOnly = false): FeatureDef[] => {
  if (!f) return []
  return FEATURE_DEFS.filter((d) => f[d.key] && (!cardOnly || d.card))
}

export { FeatureIcon, FEATURE_DEFS, activeFeatures }

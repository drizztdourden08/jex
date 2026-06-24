type Props = {
  /** Instance-unique prefix so multiple mascots don't collide on these gradient/filter ids. */
  uid: string
}

/** Gradients, glow/shadow filters and the face clip used by {@link MascotBody}. */
const MascotDefs = ({ uid }: Props) => (
  <defs>
    <linearGradient id={`${uid}-shell`} x1="122" y1="118" x2="376" y2="368" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#1f2a44" />
      <stop offset="44%" stopColor="#0d1426" />
      <stop offset="100%" stopColor="#080c18" />
    </linearGradient>

    <linearGradient id={`${uid}-shellRim`} x1="155" y1="108" x2="355" y2="336" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stopColor="#7dd3fc" />
      <stop offset="45%" stopColor="#6366f1" />
      <stop offset="100%" stopColor="#a855f7" />
    </linearGradient>

    <linearGradient id={`${uid}-finGrad`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#65e4ff" />
      <stop offset="50%" stopColor="#5b7cff" />
      <stop offset="100%" stopColor="#9d4edd" />
    </linearGradient>

    <filter id={`${uid}-softGlow`} x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="7" result="blur" />
      <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.20  0 0 0 0 0.62  0 0 0 0 1.00  0 0 0 0.75 0" />
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id={`${uid}-shadow`} x="-70%" y="-70%" width="240%" height="240%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#000814" floodOpacity="0.58" />
    </filter>

    <clipPath id={`${uid}-faceClip`}>
      <rect x="164" y="172" width="184" height="114" rx="52" />
    </clipPath>
  </defs>
)

export { MascotDefs }

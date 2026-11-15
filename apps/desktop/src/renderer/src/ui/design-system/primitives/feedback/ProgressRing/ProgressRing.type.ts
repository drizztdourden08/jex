interface ProgressRingProps {
  /** Fraction filled, 0..1 (clamped). */
  value: number
  /** Outer diameter in px. */
  size?: number
  /** Accessible name; the ring is decorative when omitted. */
  label?: string
  className?: string
}

export type { ProgressRingProps }

import './ProgressRing.css'
import type { ProgressRingProps } from './ProgressRing.type'

const STROKE = 2.5

// Circular progress: a faint track plus an arc that starts at 12 o'clock.
const ProgressRing = ({ value, size = 16, label, className }: ProgressRingProps) => {
  const r = (size - STROKE) / 2
  const c = 2 * Math.PI * r
  const v = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0))
  return (
    <svg
      className={['ds-progress-ring', className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle className="ds-progress-ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={STROKE} />
      <circle
        className="ds-progress-ring-arc"
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={STROKE}
        strokeDasharray={`${c * v} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}

export { ProgressRing }

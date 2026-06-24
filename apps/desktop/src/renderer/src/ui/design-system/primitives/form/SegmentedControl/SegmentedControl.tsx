import { useLayoutEffect, useRef, useState } from 'react'
import type { SegOption } from './SegmentedControl.type'
import './SegmentedControl.css'

/** Segmented toggle with a sliding, glowing active indicator. `tone` colors the
 *  active chip (accent by default; green/red for booleans). */
const SegmentedControl = ({
  options,
  value,
  onChange,
  tone,
  size,
}: {
  options: SegOption[]
  value: string
  onChange: (v: string) => void
  tone?: (v: string) => 'accent' | 'green' | 'red'
  size?: 'sm'
}) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const [ind, setInd] = useState<{ left: number; width: number }>({ left: 0, width: 0 })
  const idx = Math.max(0, options.findIndex((o) => o.value === value))

  useLayoutEffect(() => {
    const el = refs.current[idx]
    if (el) setInd({ left: el.offsetLeft, width: el.offsetWidth })
  }, [idx, value, options.length])

  const activeTone = tone ? tone(value) : 'accent'
  return (
    <div className={`seg tone-${activeTone}${size === 'sm' ? ' seg-sm' : ''}`}>
      <span className="seg-ind" style={{ left: ind.left, width: ind.width }} aria-hidden />
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            refs.current[i] = el
          }}
          className={value === o.value ? 'on' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export { SegmentedControl }

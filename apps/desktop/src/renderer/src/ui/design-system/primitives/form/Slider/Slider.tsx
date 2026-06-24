import { useState } from 'react'
import { IconButton } from '@ds/primitives/actions/IconButton'
import { Select } from '@ds/primitives/form/Select'
import './Slider.css'

const UNIT_LABEL: Record<string, string> = { min: 'min', bytes: 'bytes', unix: '', '%': '%' }
const TIME_UNITS = [
  { value: 'min', label: 'min' },
  { value: 'hours', label: 'hours' },
]

const clamp = (n: number, min?: number, max?: number) =>
  Math.max(min ?? -Infinity, Math.min(max ?? Infinity, n))

/**
 * Standardized number editor: two identical large icon buttons (− / +) flank one unified
 * value│unit combo (a single bordered field split by a vertical bar, each side sized to
 * its own content), with a track-fill slider + end labels below. Fully driven by props so
 * every number field looks identical. For time fields the unit slot toggles min ⇄ hours
 * (display converts; the stored value stays minutes).
 */
const Slider = ({
  value,
  onChange,
  min,
  max,
  unit,
  time,
}: {
  value: number | undefined
  onChange: (n: number | undefined) => void
  min?: number
  max?: number
  unit?: string
  time?: boolean
}) => {
  const [hours, setHours] = useState(!!time)
  const scale = time && hours ? 60 : 1
  const toDisp = (v: number) => Math.round((v / scale) * 100) / 100
  const fromDisp = (d: number) => Math.round(d * scale)
  const disp = value == null ? undefined : toDisp(value)
  const set = (d: number | undefined) => onChange(d == null ? undefined : clamp(fromDisp(d), min, max))

  const dmin = min != null ? toDisp(min) : undefined
  const dmax = max != null ? toDisp(max) : undefined
  const step = time && hours ? 0.5 : 1
  const hasSlider = dmin != null && dmax != null && dmin < dmax
  const unitText = time ? (hours ? 'hours' : 'min') : unit ? UNIT_LABEL[unit] ?? unit : ''
  const fill = hasSlider && disp != null ? Math.max(0, Math.min(100, ((disp - dmin!) / (dmax! - dmin!)) * 100)) : 0

  // Width follows the INTEGER digit count (grows only at 10/100/1000…), plus a constant
  // reserve for the optional ".5" when the step is fractional — so toggling x ⇄ x.5 in
  // hours mode never resizes the field. (ch = one tabular digit.)
  const intDigits = disp == null ? 1 : String(Math.trunc(Math.abs(disp))).length
  const numWidth = `${intDigits + (step < 1 ? 1.6 : 0) + (disp != null && disp < 0 ? 1 : 0)}ch`

  return (
    <div className="nsl">
      <div className="nsl-row">
        <IconButton label="Decrease" size="lg" className="nsl-step" onClick={() => set((disp ?? 0) - step)}>
          −
        </IconButton>

        <div className="nsl-combo">
          <input
            className="nsl-num"
            type="number"
            style={{ width: numWidth }}
            value={disp ?? ''}
            placeholder="—"
            onChange={(e) => set(e.target.value === '' ? undefined : Number(e.target.value))}
          />
          {unitText && <span className="nsl-div" aria-hidden />}
          {unitText &&
            (time ? (
              <Select
                className="nsl-unit"
                triggerBare
                size="sm"
                value={hours ? 'hours' : 'min'}
                onChange={(v) => setHours(v === 'hours')}
                options={TIME_UNITS}
              />
            ) : (
              <span className="nsl-unit-static">{unitText}</span>
            ))}
        </div>

        <IconButton label="Increase" size="lg" className="nsl-step" onClick={() => set((disp ?? 0) + step)}>
          +
        </IconButton>
      </div>

      {hasSlider && (
        <div className="nsl-area">
          <div className="nsl-shell" style={{ ['--value' as string]: `${fill}%` }}>
            <input
              className="nsl-range"
              type="range"
              min={dmin}
              max={dmax}
              step={step}
              value={disp ?? dmin}
              onChange={(e) => set(Number(e.target.value))}
            />
          </div>
          <div className="nsl-scale">
            <span>{dmin}</span>
            <span>{dmax}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export { Slider }

import './RulerSlider.scss'

import { type ChangeEvent, type CSSProperties, useCallback, useId } from 'react'

// RulerSlider — horizontal port of the CSS ruler slider. Native range input
// (so the thumb pseudo-elements + ruler technique work), ruler above the
// track with marks that lift up over the thumb, white fill. Same discrete-stop
// / value-as-INDEX contract as AllowanceSlider: value = index into `stops`.

export interface RulerSliderStop {
  tokens: number
  label?: string
}

export interface RulerSliderProps {
  stops: readonly RulerSliderStop[]
  /** Selected stop INDEX (parent-controlled). */
  value: number
  onChange: (stopIndex: number) => void
  ariaLabel: string
  className?: string
}

const fmt = (n: number): string => n.toLocaleString('en-US')

export function RulerSlider({ stops, value, onChange, ariaLabel, className }: RulerSliderProps) {
  const max = Math.max(1, stops.length - 1)
  const composed = ['klyp-RulerSlider', className].filter(Boolean).join(' ')
  const listId = useId()

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value)),
    [onChange],
  )

  const activeStop = stops[value]
  const valueText = activeStop ? `${fmt(activeStop.tokens)} tokens` : undefined
  const pct = value / max

  return (
    <div
      className={composed}
      role="group"
      aria-label={ariaLabel}
      style={{ '--val': value, '--max': max, '--pct': pct } as CSSProperties}
    >
      {/* Ruler — one mark per stop; marks lift up over the thumb. */}
      <div className="klyp-RulerSlider__ruler" aria-hidden>
        {stops.map((stop, idx) => {
          const major = idx === 0 || idx === stops.length - 1
          return (
            <span
              key={stop.tokens}
              className="klyp-RulerSlider__mark"
              data-major={major ? 'true' : undefined}
              style={{ '--idx': idx } as CSSProperties}
            >
              {major && (
                <span className="klyp-RulerSlider__markLabel">
                  {stop.label ?? fmt(stop.tokens)}
                </span>
              )}
            </span>
          )
        })}
      </div>

      {/* Track — dark rail + white fill, native input overlaid for the thumb. */}
      <div className="klyp-RulerSlider__track">
        <span className="klyp-RulerSlider__rail" aria-hidden />
        <span className="klyp-RulerSlider__fill" aria-hidden />
        <input
          type="range"
          className="klyp-RulerSlider__input"
          list={listId}
          min={0}
          max={max}
          step={1}
          value={value}
          onChange={handleChange}
          aria-label={ariaLabel}
          aria-valuetext={valueText}
        />
        <datalist id={listId}>
          {stops.map((_, idx) => (
            <option key={idx} value={idx} />
          ))}
        </datalist>
      </div>
    </div>
  )
}

export default RulerSlider

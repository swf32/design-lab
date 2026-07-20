import './MeshSlider.scss'

import { ArrowRightOutline } from '@klyp/icons/outline'
import { type CSSProperties, useCallback } from 'react'
import { Slider, SliderThumb, SliderTrack } from 'react-aria-components'

import { MeshSurface } from '../MeshSurface/MeshSurface'

// =====================================================================
// MeshSlider — DEV-805 mesh variant of AllowanceSlider
// =====================================================================
//
// Same discrete-stop, value-as-INDEX contract as AllowanceSlider, but a
// chunky 32px pill track styled like a MeshButton: dark-grey rail, the FILL
// (left of the thumb) and the THUMB are golden goo-blob mesh (reused
// `<MeshSurface>`, incl. the iOS Safari fix), and the thumb carries a white
// animated arrow-right. Built on raw react-aria-components Slider so the fill
// + thumb can host the mesh DOM (the @klyp/ui Slider primitive's fill takes no
// children). Endpoint labels (min / max) are kept, like AllowanceSlider.

export interface MeshSliderStop {
  tokens: number
  label?: string
}

export interface MeshSliderProps {
  stops: readonly MeshSliderStop[]
  /** Selected stop INDEX (parent-controlled). */
  value: number
  onChange: (stopIndex: number) => void
  ariaLabel: string
  className?: string
}

const fmt = (n: number): string => n.toLocaleString('en-US')

export function MeshSlider({ stops, value, onChange, ariaLabel, className }: MeshSliderProps) {
  const max = stops.length - 1
  const composed = ['klyp-MeshSlider', className].filter(Boolean).join(' ')

  const handleChange = useCallback(
    (v: number | number[]) => onChange(typeof v === 'number' ? v : (v[0] ?? 0)),
    [onChange],
  )

  const activeStop = stops[value]
  const valueText = activeStop ? `${fmt(activeStop.tokens)} tokens` : undefined
  const minStop = stops[0]
  const maxStop = stops[max]

  return (
    <div className={composed}>
      <Slider
        aria-label={ariaLabel}
        minValue={0}
        maxValue={Math.max(1, max)}
        step={1}
        value={value}
        onChange={handleChange}
        className="klyp-MeshSlider__slider"
      >
        <SliderTrack className="klyp-MeshSlider__track">
          {({ state }) => {
            const pct = state.getThumbPercent(0)
            return (
              <>
                {/* Rounded clip window: dark rail + mesh fill (left of thumb). */}
                <span className="klyp-MeshSlider__window" aria-hidden>
                  <span className="klyp-MeshSlider__rail" />
                  {/* Fill reaches the thumb's CENTRE (thumb is edge-anchored,
                   *  width 32 → half = 16) so the mesh meets the thumb without
                   *  a gap and without overshooting past it. */}
                  <span
                    className="klyp-MeshSlider__fill"
                    style={{
                      width: `calc(${pct} * (100% - var(--space-32)) + var(--space-16))`,
                    }}
                  >
                    <MeshSurface blur="10px" />
                  </span>
                </span>
                <SliderThumb
                  className="klyp-MeshSlider__thumb"
                  aria-valuetext={valueText}
                  style={{ '--thumb-pct': pct } as CSSProperties}
                >
                  <ArrowRightOutline
                    className="klyp-MeshSlider__arrow"
                    width={16}
                    height={16}
                    aria-hidden
                  />
                </SliderThumb>
              </>
            )
          }}
        </SliderTrack>
      </Slider>
      <div className="klyp-MeshSlider__ticks">
        <button
          type="button"
          className="klyp-MeshSlider__tick"
          data-active={value === 0 ? 'true' : undefined}
          onClick={() => onChange(0)}
        >
          {minStop?.label ?? (minStop ? fmt(minStop.tokens) : '')}
        </button>
        <button
          type="button"
          className="klyp-MeshSlider__tick"
          data-active={value === max ? 'true' : undefined}
          onClick={() => onChange(max)}
        >
          {maxStop?.label ?? (maxStop ? fmt(maxStop.tokens) : '')}
        </button>
      </div>
    </div>
  )
}

export default MeshSlider

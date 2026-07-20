import './SegmentSlider.scss'

import { type CSSProperties, useCallback } from 'react'
import { Slider, SliderThumb, SliderTrack } from 'react-aria-components'

// =====================================================================
// SegmentSlider — DEV-805 segmented (cell) variant of AllowanceSlider
// =====================================================================
//
// Same discrete-stop, value-as-INDEX contract as AllowanceSlider / MeshSlider,
// but rendered as a row of N CELLS (one per stop) inside a 40px pill
// (radius --r-card = 12px). There is no smooth travel — the slider reads as
// literal segments: drag and the white "active" cell jumps cell-to-cell.
//
//   • Empty cells (right of the active one) — dark grey.
//   • Filled cells (left of the active one) — lighter grey.
//   • Active cell — white (brand-aware via the shared --color-slider-* tokens,
//     so unreals light theme inverts to accent-blue like the other sliders).
//   • Min / max labels live INSIDE the first / last cell (design lead 2026-06-25
//     reference: "2k" left, "40k" right), white on grey, dark on the white
//     active cell.
//
// Built on raw react-aria-components Slider (like MeshSlider) so the track
// owns drag + keyboard + a11y. The cells layer is purely visual
// (pointer-events:none); the RAC thumb is an invisible hit/keyboard target —
// the visible feedback is the active cell. Focus ring is forwarded onto the
// active cell via `:has()`.

export interface SegmentSliderStop {
  tokens: number
  label?: string
}

export interface SegmentSliderProps {
  stops: readonly SegmentSliderStop[]
  /** Selected stop INDEX (parent-controlled). */
  value: number
  onChange: (stopIndex: number) => void
  ariaLabel: string
  className?: string
  /** Label shown on the active (white) cell for a stop's value. Defaults to a
   *  compact form ("16k"). Override when the stop value isn't a token count —
   *  e.g. the $-first dialog passes its currency formatter so the thumb reads
   *  "$50" instead of "50". */
  formatValue?: (value: number) => string
}

const fmt = (n: number): string => n.toLocaleString('en-US')

/** Compact endpoint label — "2k", "40k", "1.5k" — kept short so it fits a single
 *  cell on narrow widths. < 1000 falls back to the plain number. */
const compact = (n: number): string => {
  if (n < 1000) return String(n)
  const k = n / 1000
  return `${Number.isInteger(k) ? k : k.toFixed(1)}k`
}

export function SegmentSlider({
  stops,
  value,
  onChange,
  ariaLabel,
  className,
  formatValue = compact,
}: SegmentSliderProps) {
  const max = stops.length - 1
  const composed = ['klyp-SegmentSlider', className].filter(Boolean).join(' ')

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
        className="klyp-SegmentSlider__slider"
      >
        <SliderTrack className="klyp-SegmentSlider__track">
          {({ state }) => {
            const v = state.getThumbValue(0)
            return (
              <>
                <span className="klyp-SegmentSlider__cells" aria-hidden>
                  {stops.map((stop, i) => (
                    <span
                      key={stop.tokens}
                      className="klyp-SegmentSlider__cell"
                      data-state={i === v ? 'active' : i < v ? 'filled' : 'empty'}
                    />
                  ))}
                </span>
                {/* Min / max endpoint labels, pinned to the edges (white on the
                 *  grey track). Hidden at the extreme where the thumb value sits
                 *  on top of them. Own layer above the (clipping) cells. */}
                {minStop && v !== 0 && (
                  <span
                    className="klyp-SegmentSlider__edge"
                    data-side="min"
                    style={{ '--cell-count': stops.length } as CSSProperties}
                    aria-hidden
                  >
                    {compact(minStop.tokens)}
                  </span>
                )}
                {maxStop && v !== max && (
                  <span
                    className="klyp-SegmentSlider__edge"
                    data-side="max"
                    style={{ '--cell-count': stops.length } as CSSProperties}
                    aria-hidden
                  >
                    {compact(maxStop.tokens)}
                  </span>
                )}
                {/* Current selection, centred over the active (white) cell on
                 *  its own layer — dark (fg-inverse), never clipped by the
                 *  narrow cell. */}
                <span
                  className="klyp-SegmentSlider__value"
                  style={
                    {
                      '--active': v,
                      '--cell-count': stops.length,
                    } as CSSProperties
                  }
                  aria-hidden
                >
                  {activeStop ? formatValue(activeStop.tokens) : null}
                </span>
                <SliderThumb className="klyp-SegmentSlider__thumb" aria-valuetext={valueText} />
              </>
            )
          }}
        </SliderTrack>
      </Slider>
    </div>
  )
}

export default SegmentSlider

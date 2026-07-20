import { Slider } from '@klyp/ui/Slider'
import { useCallback } from 'react'
import './AllowanceSlider.scss'

// =====================================================================
// AllowanceSlider — Klyp brand molecule (Phase 1, /pricing slider, 2026-05-20)
// =====================================================================
//
// Renders a horizontal slider with DISCRETE stops (2–22) and an optional
// tick row underneath. Used on the `/pricing` route in tier cards that
// bill against a variable token allowance (Studio on v1; Creator Plus had
// a slider until DEV-349 removed it) — moving the slider changes the
// price + tokens-per-month, both rendered by the parent card from the
// active stop.
//
// Tick display modes (`tickDisplay` prop, 2026-05-22, DEV-187):
//   • `'all'` (default) — one `<button>` per stop, suitable for ≤10 stops.
//     Each tick is clickable and shows its token count.
//   • `'endpoints'` — only the first + last `<button>`s render, suitable
//     for many stops (Studio's 22-stop ladder). Visually the slider feels
//     continuous; the thumb still snaps to integer indices.
//
// Design intent (design lead 2026-05-20, Higgsfield reference; 2026-05-22 update):
//   • Native-feeling slider with 2px track + 18px thumb (we inherit the
//     UI primitive's chrome but override sizing in AllowanceSlider.scss).
//   • Each visible tick is a real `<button>` — clicking it jumps the
//     slider to that stop. Active tick gets `font-weight: bold +
//     color-fg-primary`; inactive ticks stay muted (`--color-fg-muted`).
//   • The slider itself is value-as-INDEX (0..stops.length-1, step=1).
//     We do NOT map tokens onto the slider's continuous range — discrete
//     stops keep the math obvious for parent components computing the
//     resolved price from `stops[currentIndex]`.
//
// Accessibility:
//   • Underlying React Aria `<Slider>` exposes `role="slider"` with
//     valuemin / valuemax / valuenow. `aria-valuetext` is overridden via
//     `thumbAriaValueText` so SR reads the token count ("10,000 tokens")
//     instead of the raw 0..N-1 index ("1 of 22").
//   • Each tick `<button>` has `aria-pressed` reflecting active state +
//     a synthesised `aria-label` ("4,500 tokens") for SR consumption —
//     the visible text is just the number so SR users get the units.
//   • The parent `<Slider>`'s `aria-label` is required (the SR
//     announcement for the slider itself).

export interface AllowanceSliderStop {
  /** Numeric token count this stop represents. Used for tick label + parent
   *  callback. */
  tokens: number
  /** Optional shorter display label (e.g. `"7.5k"`). Defaults to a
   *  comma-grouped number (`"7,500"`) via `Intl.NumberFormat`. */
  label?: string
}

export interface AllowanceSliderProps {
  /** Discrete stops the slider snaps to. Min 2 stops; supports up to 22
   *  (Studio's 8k → 50k ladder at 2k intervals). */
  stops: readonly AllowanceSliderStop[]
  /** Currently selected stop index. Controlled by the parent — the slider
   *  does NOT own state. */
  value: number
  /** Called when the user moves the slider, drags it, or clicks a tick. */
  onChange: (stopIndex: number) => void
  /** A11y label for the slider, e.g. `"Studio token allowance"`. Required —
   *  RAC's `Slider` will warn if it can't find one. */
  ariaLabel: string
  /** Optional className appended to the wrapper. */
  className?: string
  /**
   * How the tick row below the slider is rendered (2026-05-22, DEV-187):
   *   • `'all'` (default) — one `<button>` per stop.
   *   • `'endpoints'` — only first + last `<button>`s; suitable for many
   *     stops (Studio 22-stop ladder), keeps the visual continuous.
   */
  tickDisplay?: 'all' | 'endpoints'
}

function formatTokens(n: number): string {
  return n.toLocaleString('en-US')
}

/**
 * `<AllowanceSlider>` — discrete-stop slider + tick row.
 *
 * Value contract: `value` is the INDEX into `stops`, not the token count.
 * Parents pick the active stop's `.tokens` themselves when computing
 * display price / allowance ("X tokens / month").
 */
export function AllowanceSlider({
  stops,
  value,
  onChange,
  ariaLabel,
  className,
  tickDisplay = 'all',
}: AllowanceSliderProps) {
  const max = stops.length - 1

  const composed = ['klyp-AllowanceSlider', className].filter(Boolean).join(' ')

  // RAC Slider hands back `number | number[]` depending on thumb count.
  // We always have one thumb, so collapse to a single index; the callback
  // identity is stable across renders (only `onChange` is a dep).
  const handleSliderChange = useCallback(
    (v: number | number[]) => {
      onChange(typeof v === 'number' ? v : (v[0] ?? 0))
    },
    [onChange],
  )

  // SR-friendly value text: announce the active stop's tokens, not the
  // 0..N-1 index. Without this override, RAC reads "1 of 22" — meaningless.
  const activeStop = stops[value]
  const thumbAriaValueText = activeStop ? `${formatTokens(activeStop.tokens)} tokens` : undefined

  // Resolve which ticks to render based on `tickDisplay`. Always at least
  // 2 entries (endpoints mode); `'all'` returns the full list verbatim.
  const visibleTicks =
    tickDisplay === 'endpoints' && stops.length > 1
      ? ([
          { stop: stops[0], index: 0 },
          { stop: stops[max], index: max },
        ] as const)
      : stops.map((stop, index) => ({ stop, index }))

  return (
    <div className={composed} data-tick-display={tickDisplay}>
      <Slider
        aria-label={ariaLabel}
        minValue={0}
        maxValue={max}
        step={1}
        value={value}
        onChange={handleSliderChange}
        thumbAriaValueText={thumbAriaValueText}
        className="klyp-AllowanceSlider__slider"
        thumbContent={
          // Chevron-left-right glyph — visual cue "drag me". viewBox 12×12
          // (1:1 ratio with rendered 12px size) so coordinate units = pixels.
          // Left chevron open edge at x=4, right chevron open edge at x=8 →
          // 4 unit / 4px gap between the apex-tips of the two chevrons (the design lead
          // 2026-05-20: «стрелки пусть 4 пкс гэп имеют»). Depth of each
          // chevron = 3 units from apex to open edge.
          <svg
            className="klyp-AllowanceSlider__thumbIcon"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 3 L1 6 L4 9" />
            <path d="M8 3 L11 6 L8 9" />
          </svg>
        }
      />
      <div className="klyp-AllowanceSlider__ticks" role="group" aria-label={`${ariaLabel} stops`}>
        {visibleTicks.map(({ stop, index }) => {
          // Defensive — `visibleTicks` always pulls from `stops`, but TS
          // doesn't narrow that. Skip the tick when stop is missing
          // (shouldn't happen at runtime).
          if (!stop) return null
          // Compute formatted number once — used both for visible label
          // fallback and SR aria-label below.
          const formatted = formatTokens(stop.tokens)
          const label = stop.label ?? formatted
          const isActive = index === value
          return (
            <button
              key={stop.tokens}
              type="button"
              className="klyp-AllowanceSlider__tick"
              data-active={isActive ? 'true' : undefined}
              aria-pressed={isActive}
              aria-label={`${formatted} tokens`}
              onClick={() => onChange(index)}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default AllowanceSlider

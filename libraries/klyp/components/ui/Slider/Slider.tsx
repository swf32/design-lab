import './Slider.scss'

import type { CSSProperties, ReactNode } from 'react'
import {
  Slider as RACSlider,
  SliderOutput as RACSliderOutput,
  type SliderProps as RACSliderProps,
  SliderThumb as RACSliderThumb,
  SliderTrack as RACSliderTrack,
} from 'react-aria-components'

// =====================================================================
// Slider — Klyp canonical primitive (Phase 2 of React Aria migration)
// =====================================================================
//
// Architecture: see ../../../../MIGRATION-REACT-ARIA-2026-04-30.md §5/§6/§16
//
// Single component handles both single-value and range mode — RAC's
// Slider auto-detects from `value` / `defaultValue` (number vs number[]).
// We render thumbs from `state.values` inside SliderTrack and paint a
// custom fill div positioned via `state.getThumbPercent()`.
//
// Backward-compat: legacy Base UI props `min` / `max` are accepted and
// aliased to RAC's `minValue` / `maxValue`. Will be removed in Phase 5.

export interface SliderProps<T extends number | number[] = number | number[]>
  extends Omit<RACSliderProps<T>, 'children'> {
  /** Backward-compat alias for `minValue` (Base UI naming). */
  min?: number
  /** Backward-compat alias for `maxValue` (Base UI naming). */
  max?: number
  /** Optional accessible label rendered as a visually-hidden output. */
  label?: ReactNode
  /**
   * Optional JSX rendered inside each thumb — used for visual affordance
   * (e.g. a chevron-left-right glyph in `AllowanceSlider` to cue "drag me").
   * `ReactNode` shared across thumbs, or a render fn that receives the
   * thumb index for per-thumb customization.
   *
   * RAC `SliderThumb` accepts children; we forward without altering the
   * accessibility tree — thumb stays focusable + screen-reader-labeled
   * via `aria-valuetext` regardless of content.
   */
  thumbContent?: ReactNode | ((opts: { index: number }) => ReactNode)
  /**
   * Optional `aria-valuetext` override per thumb. Used when the slider's
   * numeric value isn't meaningful to screen readers (e.g. AllowanceSlider
   * uses value-as-index where the raw `0..21` would announce as "1 of 22"
   * — passing `thumbAriaValueText` with formatted tokens makes the SR read
   * "10,000 tokens" instead). String shared across thumbs, or a render fn
   * that receives the thumb index.
   */
  thumbAriaValueText?: string | ((opts: { index: number }) => string)
}

export function Slider<T extends number | number[]>({
  className,
  min,
  max,
  minValue,
  maxValue,
  label: _label,
  thumbContent,
  thumbAriaValueText,
  ...props
}: SliderProps<T>) {
  const resolvedMin = minValue ?? min ?? 0
  const resolvedMax = maxValue ?? max ?? 100

  return (
    <RACSlider<T>
      {...(props as RACSliderProps<T>)}
      minValue={resolvedMin}
      maxValue={resolvedMax}
      className={typeof className === 'string' ? `klyp-Slider ${className}` : 'klyp-Slider'}
    >
      <RACSliderTrack className="klyp-Slider__track">
        {({ state }: { state: any }) => {
          const count = state.values.length
          // For single-value slider: fill from start to thumb.
          // For range slider (2+ thumbs): fill between min and max thumb.
          const startPct = count > 1 ? state.getThumbPercent(0) * 100 : 0
          const endPct =
            count > 1 ? state.getThumbPercent(count - 1) * 100 : state.getThumbPercent(0) * 100

          return (
            <>
              <div className="klyp-Slider__rail" />
              <div
                className="klyp-Slider__fill"
                style={{
                  left: `${startPct}%`,
                  width: `${Math.max(0, endPct - startPct)}%`,
                }}
              />
              {state.values.map((_value: number, i: number) => {
                // Expose the thumb's normalised position (0..1) as a CSS
                // custom property `--thumb-pct` so consumers can implement
                // inset-mapping (thumb edge — not centre — flush with the
                // track at extremes). Used by AllowanceSlider for its
                // `margin-left: calc((0.5 - var(--thumb-pct)) * <thumb-width>)`
                // shift. Inline style — present on every render so CSS
                // calc() sees a number even when consumer doesn't use it.
                const pct: number = state.getThumbPercent(i)
                const ariaValueText =
                  typeof thumbAriaValueText === 'function'
                    ? thumbAriaValueText({ index: i })
                    : thumbAriaValueText
                return (
                  <RACSliderThumb
                    key={i}
                    index={i}
                    className="klyp-Slider__thumb"
                    aria-valuetext={ariaValueText}
                    style={{ '--thumb-pct': pct } as CSSProperties}
                  >
                    {/* Inner wrapper for visual styles. RAC sets inline
                     *  `transform: translate(-50%, -50%)` on the root SliderThumb;
                     *  any CSS `transform: scale(...)` on the root would override
                     *  that translate and break the centering. Visual transforms
                     *  (hover/drag scale, hover shadow expand) live on
                     *  `__thumbInner` so RAC's positioning transform stays. */}
                    <span className="klyp-Slider__thumbInner" aria-hidden="true">
                      {thumbContent
                        ? typeof thumbContent === 'function'
                          ? thumbContent({ index: i })
                          : thumbContent
                        : null}
                    </span>
                  </RACSliderThumb>
                )
              })}
            </>
          )
        }}
      </RACSliderTrack>
      {/* Accessible value output; visually hidden but exposed to AT. */}
      <RACSliderOutput className="klyp-Slider__output" />
    </RACSlider>
  )
}

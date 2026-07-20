import './Textarea.scss'

import {
  type ChangeEvent,
  type ComponentProps,
  type Ref,
  type RefObject,
  useEffect,
  useRef,
} from 'react'

// =====================================================================
// Textarea — Klyp canonical primitive (Phase 2 of React Aria migration)
// =====================================================================
//
// Renders a styled native <textarea> (drop-in for the native API). Focus /
// invalid / hover state is handled via native `:focus-visible` and
// `[aria-invalid='true']` in SCSS — same approach as the Input primitive.
// Invalid is the hand-set `aria-invalid` only (a bare <textarea> never receives
// RAC's `data-invalid`, so that selector would ship dead). Label / helper /
// error / char-counter are COMPOSITION (wrap in RAC `<TextField>` + `<Label>` —
// see stories), not props on the field.
//
// Auto-grow — two modes:
//   - Default (no `autoGrow`): the box grows with content via CSS
//     `field-sizing: content` (Chrome/Edge/Safari 26.2+; Firefox keeps the
//     per-size min-height floor). Zero JS.
//   - `autoGrow`: JS measures `scrollHeight` and sets an explicit height,
//     clamped to `minRows…maxRows` (scrolls past the cap). Works on EVERY
//     browser and gives a hard max-rows ceiling. This folds in the former
//     standalone `AutoTextarea` primitive (retired 2026-06-30) — pass
//     `autoGrow value onValueChange minRows maxRows` to get its behaviour.

export type TextareaSize = 'sm' | 'md' | 'lg'
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both'

export interface TextareaProps extends Omit<ComponentProps<'textarea'>, 'onChange'> {
  /**
   * Vertical scale of the field. Maps to a `[data-size]` attribute the SCSS
   * reads — drives padding + font + min-height floor. Default `md`.
   */
  size?: TextareaSize
  /**
   * Which edges the user can drag to resize. Maps to `[data-resize]`. Default
   * `none` — the field auto-grows (CSS `field-sizing` or `autoGrow`), so there's
   * no manual drag handle and the native `::-webkit-resizer` grip never clips
   * the rounded corner. Opt into `vertical` / `horizontal` / `both` for a
   * draggable handle (the native grip reappears — the explicit trade-off).
   */
  resize?: TextareaResize
  /**
   * JS auto-grow from `minRows` to `maxRows`, then scroll. Cross-browser (sets
   * an explicit height; doesn't rely on CSS `field-sizing`) and gives a hard
   * max-rows ceiling. Off by default — plain fields keep the CSS-only grow.
   */
  autoGrow?: boolean
  /** Auto-grow floor in rows. Only with `autoGrow`. Default 1. */
  minRows?: number
  /** Auto-grow ceiling in rows (scrolls past it). Only with `autoGrow`. Default 8. */
  maxRows?: number
  /** Native change handler — still fully supported alongside `onValueChange`. */
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
  /** Ergonomic string-change handler (delivers the value directly). */
  onValueChange?: (next: string) => void
  /** Forwarded ref to the underlying <textarea>. */
  textareaRef?: Ref<HTMLTextAreaElement>
}

/** JS auto-grow: height = clamp(lineHeight × minRows, scrollHeight, lineHeight × maxRows). */
function autoResize(el: HTMLTextAreaElement, minRows: number, maxRows: number) {
  el.style.height = 'auto'
  const lh = Number.parseFloat(getComputedStyle(el).lineHeight) || 22
  const min = lh * minRows
  const max = lh * maxRows
  const target = Math.min(Math.max(el.scrollHeight, min), max)
  el.style.height = `${target}px`
  // Scrollbar only when content exceeds the cap — below it, grows seamlessly.
  el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
}

export function Textarea({
  size = 'md',
  resize = 'none',
  autoGrow = false,
  minRows = 1,
  maxRows = 8,
  onChange,
  onValueChange,
  textareaRef,
  className,
  ...props
}: TextareaProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null)
  const ref = (textareaRef ?? internalRef) as RefObject<HTMLTextAreaElement>

  // Re-measure on value change (incl. programmatic resets like setValue('')) and
  // on minRows/maxRows changes. `props.value` is the trigger even though the body
  // reads ref.current — hence the biome-ignore for the "extra" dependency.
  // biome-ignore lint/correctness/useExhaustiveDependencies: props.value is the resize trigger
  useEffect(() => {
    if (autoGrow && ref.current) autoResize(ref.current, minRows, maxRows)
  }, [autoGrow, minRows, maxRows, props.value])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange?.(e.target.value)
    onChange?.(e)
    if (autoGrow && ref.current) autoResize(ref.current, minRows, maxRows)
  }

  return (
    <textarea
      data-slot="textarea"
      {...props}
      ref={ref}
      onChange={handleChange}
      data-size={size}
      data-resize={resize}
      data-autogrow={autoGrow ? '' : undefined}
      className={
        typeof className === 'string' && className.length > 0
          ? `klyp-Textarea ${className}`
          : 'klyp-Textarea'
      }
    />
  )
}

export default Textarea

import './ExpandingSearch.scss'

import { CloseCircleOutline, SearchOutline } from '@klyp/icons/outline'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'

import { useBrand } from '../_brand-context'

/**
 * `<ExpandingSearch>` — leftward-expanding search.
 *
 * CLOSED: 40×40 ghost chip (Iconsax `SearchOutline` centred inside a square).
 * OPEN: the root grows to fill its flex slot; the magnifier stays left, a
 * text input fills, and a close (X) button sits at the right edge.
 *
 * ── Mechanism (jank-free) ──────────────────────────────────────────────
 * The root is a flex ITEM that fills available width (`flex: 1 1 auto`) but
 * is CAPPED by `max-width`. Only `max-width` animates:
 *   CLOSED → `max-width: 2.5rem` (= 40px square)
 *   OPEN   → `max-width: 100%` (fills the flex slot)
 * `data-open` is set on the ROOT (not the capsule), so the SCSS toggles the
 * cap. Because the consumer's row is `justify-content: flex-end`, the freed
 * space appears to the LEFT of the search → the RIGHT edge stays pinned and
 * the LEFT edge travels (clean leftward motion). No `width` jump, no fixed
 * open width, no per-frame auto-margin reflow, and the magnifier never
 * changes its `justify-content`, so it cannot jump.
 *
 * ── Consumer contract (REQUIRED for the leftward motion to read) ────────
 *   - Place this in a `display: flex; flex-wrap: nowrap` row.
 *   - Sibling controls must be `flex: 0 0 auto` (fixed, never shrink).
 *   - The cluster holding [search + siblings] should be
 *     `justify-content: flex-end` so the collapsed search keeps the cluster
 *     right-aligned and the freed space sits to the LEFT of the search.
 *   - Give the search wrapper `flex: 1 1 auto; min-width: 0`.
 *
 * Motion model:
 *   - Root `max-width`: pure CSS `transition` (no Motion FLIP). Deterministic,
 *     doesn't measure layout each frame, can't push intrinsic-height deltas
 *     to the parent flex row.
 *   - Icon position is fixed by always-on capsule `padding-inline-start` +
 *     always-on `justify-content: flex-start` (see SCSS) — only `max-width`
 *     changes.
 *   - Input / close / triggerOverlay swap via AnimatePresence with
 *     opacity-only fades; no transform, no blur. Reduced-motion safety
 *     comes from the SCSS `@media (prefers-reduced-motion: reduce)` block
 *     that kills the root `max-width` transition (the only real motion);
 *     `<MotionConfig reducedMotion="user">` disables transform/layout only,
 *     so the opacity fades intentionally persist as the accessible
 *     substitute.
 *
 * The host owns the input value (controlled). Escape inside the input
 * clears the value AND closes the search; clicking the close button
 * does the same.
 */
export type ExpandingSearchProps = {
  /** Screen-reader label on both the trigger and the input. */
  ariaLabel: string
  /** Input placeholder when expanded. Default `'Search'`. */
  placeholder?: string
  /** Controlled value. */
  value: string
  /** Called on every keystroke + on clear/close. */
  onChange: (next: string) => void
  /** Extra className appended to the root wrapper. */
  className?: string
  /** Disable trigger + input. */
  isDisabled?: boolean
}

// Short cross-fade for the AnimatePresence swap inside the capsule.
// Opacity-only — no transform, no blur, no scale. `easeOut` matches
// the CSS `--easing-standard` curve so motion-react and CSS-transition
// pieces of the same component feel like one system.
const FADE = { duration: 0.12, ease: 'easeOut' as const }

export function ExpandingSearch({
  ariaLabel,
  placeholder,
  value,
  onChange,
  className,
  isDisabled,
}: ExpandingSearchProps) {
  const { brandId } = useBrand()
  const ES_DEFAULT_PLACEHOLDER = brandId === 'unreals' ? 'Поиск' : 'Search'
  const ES_CLOSE_LABEL = brandId === 'unreals' ? 'Закрыть поиск' : 'Close search'
  // Resolve the placeholder default inside the body — an in-body const can't
  // be referenced from a destructuring default param.
  const resolvedPlaceholder = placeholder ?? ES_DEFAULT_PLACEHOLDER

  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  // On collapse via X / Escape, return focus to the trigger button so
  // keyboard users aren't dumped at the document root (WIG focus mgmt).
  const restoreFocus = useRef(false)

  // Focus the input on next tick after open so the CSS width transition
  // starts and the browser catches focus as part of the same user gesture.
  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [open])

  // Return focus to the trigger after the capsule collapses (the trigger
  // only re-mounts once `open` is false, so we focus in an effect).
  useEffect(() => {
    if (open || !restoreFocus.current) return
    restoreFocus.current = false
    rootRef.current
      ?.querySelector<HTMLButtonElement>('.klyp-ExpandingSearch__triggerOverlay')
      ?.focus()
  }, [open])

  const handleOpen = () => {
    if (isDisabled) return
    setOpen(true)
  }
  const handleClose = () => {
    onChange('')
    restoreFocus.current = true
    setOpen(false)
  }
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      handleClose()
    }
  }

  const rootClass = ['klyp-ExpandingSearch', className].filter(Boolean).join(' ')

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} className={rootClass} data-open={open ? 'true' : undefined}>
        <div className="klyp-ExpandingSearch__capsule">
          <span className="klyp-ExpandingSearch__icon" aria-hidden>
            <SearchOutline />
          </span>

          {/* No `mode="wait"` — both elements are opacity-only, they can
              cross-fade in parallel during the capsule's CSS width
              transition without colliding visually. `wait` would leave
              the capsule empty for ~120ms mid-expand. */}
          <AnimatePresence initial={false}>
            {open ? (
              <motion.input
                key="input"
                ref={inputRef}
                type="search"
                aria-label={ariaLabel}
                placeholder={resolvedPlaceholder}
                value={value}
                disabled={isDisabled}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE}
                className="klyp-ExpandingSearch__input"
              />
            ) : (
              <motion.button
                key="trigger-overlay"
                type="button"
                aria-label={ariaLabel}
                aria-expanded={false}
                disabled={isDisabled}
                onClick={handleOpen}
                className="klyp-ExpandingSearch__triggerOverlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {open ? (
              <motion.button
                key="close"
                type="button"
                aria-label={ES_CLOSE_LABEL}
                disabled={isDisabled}
                onClick={handleClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={FADE}
                className="klyp-ExpandingSearch__close"
              >
                <CloseCircleOutline />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  )
}

export default ExpandingSearch

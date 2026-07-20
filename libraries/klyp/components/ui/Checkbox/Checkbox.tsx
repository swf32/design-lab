import './Checkbox.scss'

import { type ReactNode, useId } from 'react'
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components'

// =====================================================================
// Checkbox — Klyp canonical single-row primitive
// =====================================================================
//
// Wraps react-aria-components `Checkbox` to render a single checkable
// row with optional helper text. For multi-select grids/stacks use
// `<CheckboxGroup>` from `./CheckboxGroup` instead — this primitive is
// the standalone single-toggle counterpart (mirrors `<Switch>`).
//
//   <Checkbox>I agree to terms</Checkbox>
//   <Checkbox isIndeterminate>Partial</Checkbox>
//   <Checkbox description="Weekly digest, no spam">Subscribe</Checkbox>
//
// State styling via data-* attributes set by RAC automatically:
// [data-selected], [data-indeterminate], [data-disabled],
// [data-focus-visible], [data-hovered], [data-pressed], [data-invalid].

// === Public API types ===============================================
export type CheckboxSize = 'sm' | 'md'
export type CheckboxTone = 'neutral' | 'success'

export interface CheckboxProps extends Omit<AriaCheckboxProps, 'children' | 'className'> {
  /** Box dimensions. `sm` = 16×16, `md` = 18×18 (default). */
  size?: CheckboxSize
  /**
   * Checked-fill tone. `'neutral'` (default) uses the standard fg fill.
   * `'success'` fills the checked box with `--color-status-success` — opt-in
   * for explicit "task complete" semantics only (Klyp is single-accent, so
   * green is never the default). Ignored while `isInvalid` (error wins).
   */
  tone?: CheckboxTone
  /** Small helper text rendered below the label. */
  description?: ReactNode
  /**
   * Error text shown below the label when the field is invalid. Pairs the
   * red `[data-invalid]` border with a reason so the state isn't signalled
   * by colour alone (WCAG 1.4.1 / 3.3.1). Render together with `isInvalid`.
   */
  errorMessage?: ReactNode
  /** Label content rendered next to the box. */
  children?: ReactNode
  /** Optional extra className appended after `klyp-Checkbox`. */
  className?: string
}

// Once-guard for the DEV warning below — without it the warn fires on
// every re-render (and double-fires under StrictMode).
let warnedMissingLabel = false

// === Component ======================================================
export function Checkbox({
  size = 'md',
  tone = 'neutral',
  description,
  errorMessage,
  children,
  className,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: CheckboxProps) {
  const errorId = useId()
  // Associate the error text with the input so a screen reader announces the
  // reason, not just the label (WCAG 1.4.1 / 3.3.1). Merge with any caller
  // `aria-describedby` so we don't clobber theirs.
  const describedBy = errorMessage
    ? [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined
    : ariaDescribedBy
  // DEV-only a11y guard: a checkbox with neither a visible label (`children`)
  // nor an accessible name (`aria-label` / `aria-labelledby`) is invisible to
  // screen readers. Warn once in dev; no-op in production builds.
  if (import.meta.env.DEV && !warnedMissingLabel) {
    const hasAccessibleName = children != null || 'aria-label' in rest || 'aria-labelledby' in rest
    if (!hasAccessibleName) {
      warnedMissingLabel = true
      console.warn(
        '[klyp-ui] <Checkbox> has no visible label (children) and no ' +
          'aria-label/aria-labelledby — it will be unreadable to screen ' +
          'readers. Provide a label or an aria-label.',
      )
    }
  }
  return (
    <AriaCheckbox
      {...rest}
      aria-describedby={describedBy}
      className={
        typeof className === 'string' && className.length > 0
          ? `klyp-Checkbox ${className}`
          : 'klyp-Checkbox'
      }
      data-size={size}
      data-tone={tone}
    >
      <span className="klyp-Checkbox__box" aria-hidden="true">
        {/* Checkmark — shown when [data-selected] (not indeterminate). */}
        <svg
          className="klyp-Checkbox__check"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.5 8.5L6.5 11.5L12.5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Indeterminate dash — shown when [data-indeterminate]. */}
        <svg
          className="klyp-Checkbox__dash"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3.5 8H12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      {children || description || errorMessage ? (
        <span className="klyp-Checkbox__label">
          {children ? <span>{children}</span> : null}
          {description ? <span className="klyp-Checkbox__desc">{description}</span> : null}
          {errorMessage ? (
            <span id={errorId} className="klyp-Checkbox__error">
              {errorMessage}
            </span>
          ) : null}
        </span>
      ) : null}
    </AriaCheckbox>
  )
}

export default Checkbox

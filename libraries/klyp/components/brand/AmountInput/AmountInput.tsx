import type { ReactNode } from 'react'
import { type NumberFormatValues, NumericFormat } from 'react-number-format'

import './AmountInput.scss'

export type AmountInputSize = 'hero-xl' | 'hero-lg' | 'hero-md' | 'hero-sm'

export interface AmountInputProps {
  /** Controlled numeric value. `undefined` = empty field (placeholder shown). */
  value: number | undefined
  /** Fires with the parsed float (or `undefined` when the field is cleared). */
  onValueChange: (next: number | undefined) => void
  /** Suffix label rendered to the right (currency or token ticker, e.g. `USDT`). Non-editable. */
  ticker?: string
  /**
   * Optional UPPER bound. Keystrokes that would exceed it are rejected
   * (react-number-format `isAllowed`), so the field can never hold a value
   * above `max` — e.g. `max={44000}` makes typing `123456` impossible.
   * Independently, pass `onMax` to also render a `Max` pill that jumps to it.
   */
  max?: number
  /** Click handler for the `Max` pill — caller decides what value to commit.
   *  The pill renders only when BOTH `max` and `onMax` are provided. */
  onMax?: () => void
  /**
   * Optional LOWER bound. Enforced on blur (a per-keystroke min would block
   * typing intermediate values), clamping the field UP to `min` when the
   * user leaves it below.
   */
  min?: number
  /** Visual scale. `hero-lg` is the default for ceremonial review screens;
   *  `hero-xl` is the single-biggest figure on a surface (top-up amount). */
  size?: AmountInputSize
  /** Placeholder when value is `undefined`. Default `'0'`. */
  placeholder?: string
  /** Helper text below the input (e.g. `'Minimum 10 USDT'`). Muted by default. */
  helper?: ReactNode
  /** Marks the field as invalid (red field color + danger-toned helper). */
  invalid?: boolean
  /** Error message rendered under the helper line when `invalid` is true. */
  errorMessage?: ReactNode
  /** Disables typing + the Max pill. */
  disabled?: boolean
  /** Accessible label — pass either this or an `id` paired with an external `<label>`. */
  ariaLabel?: string
  /**
   * DOM id — caller-provided so an external `<label htmlFor>` can associate
   * with the input. Required at the type level to keep label-association
   * explicit; supply `ariaLabel` instead when no visible label exists.
   */
  id: string
}

/**
 * Hero numeric input — realtime thousands-grouping via `react-number-format`'s
 * `NumericFormat`. Caret preservation across edits/pastes is handled by the
 * library; the consumer just feeds in a number and receives a number back.
 *
 * Adaptive font-size: `data-length` reflects the formatted value's char count
 * (short ≤ 7, medium 8–11, long ≥ 12). SCSS clamps step down per bucket so
 * long numbers like `1,000,000.99` don't overflow the sheet.
 *
 * Optional Max pill — caller passes `max` + `onMax`; the consumer decides
 * what value to commit (balance, balance − fee, etc.). Keeps this primitive
 * domain-agnostic.
 *
 * Ticker suffix is a non-interactive `<span>` (NOT a dropdown). Currency /
 * token switching belongs in a separate picker upstream.
 */
export function AmountInput({
  value,
  onValueChange,
  ticker,
  max,
  onMax,
  min,
  size = 'hero-lg',
  placeholder = '0',
  helper,
  invalid,
  errorMessage,
  disabled,
  ariaLabel,
  id,
}: AmountInputProps) {
  const handleValueChange = (values: NumberFormatValues) => {
    // `floatValue` is `number | undefined` — undefined when the field is empty.
    onValueChange(values.floatValue)
  }

  const handleMax = () => {
    if (disabled || max == null) return
    onMax?.()
  }

  // Reject keystrokes above `max` (clears → always allowed).
  const isAllowed = (values: NumberFormatValues): boolean =>
    max == null || values.floatValue == null || values.floatValue <= max

  // Clamp UP to `min` on blur (per-keystroke would block typing).
  const handleBlur = () => {
    if (min != null && value != null && value < min) onValueChange(min)
  }

  const canMax = max != null && !disabled && onMax != null

  // Length bucket drives the SCSS step-down clamp. Counts the formatted
  // string including commas (a 12-char "1,234,567.89" reads wider than a
  // 10-char "1234567.89").
  const lengthBucket: 'short' | 'medium' | 'long' = (() => {
    const formattedLen = formatGroupedLength(value)
    if (formattedLen >= 12) return 'long'
    if (formattedLen >= 8) return 'medium'
    return 'short'
  })()

  const helperId = helper ? `${id}-helper` : undefined
  const errorId = invalid && errorMessage ? `${id}-error` : undefined
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined

  return (
    <div
      className="klyp-AmountInput"
      data-size={size}
      data-length={lengthBucket}
      data-invalid={invalid ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
    >
      <div className="klyp-AmountInput__row">
        <NumericFormat
          id={id}
          value={value ?? ''}
          onValueChange={handleValueChange}
          isAllowed={isAllowed}
          onBlur={handleBlur}
          thousandSeparator=","
          decimalScale={2}
          allowNegative={false}
          valueIsNumericString={false}
          inputMode="decimal"
          enterKeyHint="next"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="klyp-AmountInput__field"
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={invalid ? 'true' : 'false'}
          aria-describedby={describedBy}
        />
        <div className="klyp-AmountInput__suffix">
          {canMax && (
            <button
              type="button"
              className="klyp-AmountInput__max"
              onClick={handleMax}
              disabled={disabled}
              aria-label={`Use maximum: ${max}${ticker ? ` ${ticker}` : ''}`}
            >
              Max
            </button>
          )}
          {ticker && (
            <span aria-hidden className="klyp-AmountInput__ticker">
              {ticker}
            </span>
          )}
        </div>
      </div>
      {(helper || (invalid && errorMessage)) && (
        <div className="klyp-AmountInput__messages">
          {helper && (
            <p id={helperId} className="klyp-AmountInput__helper">
              {helper}
            </p>
          )}
          {invalid && errorMessage && (
            <p id={errorId} className="klyp-AmountInput__error" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Returns the length of the formatted value (with thousands separators).
 * Commas count because, in tabular-nums Geist, a comma is roughly the
 * same visual width as a digit.
 *
 * `1234567.89` → `1,234,567.89` → 12.
 */
function formatGroupedLength(raw: number | undefined): number {
  if (raw == null || Number.isNaN(raw)) return 1 // placeholder "0" — short bucket
  const str = String(raw)
  const [int] = str.split('.')
  const commaCount = Math.max(0, Math.floor((int.length - 1) / 3))
  return str.length + commaCount
}

export default AmountInput

import './OtpInput.scss'

import { type MutableRefObject, type Ref, useId, useRef } from 'react'

// =====================================================================
// OtpInput — Klyp canonical primitive
// =====================================================================
//
// Single hidden <input> + N visual cells (Stripe / Vercel / shadcn
// `input-otp` canon). Native paste, iOS one-time-code autofill, and
// password-manager fill all work because there's exactly one focusable
// element under the hood.
//
// Extracted from apps/web/src/features/email-otp/email-otp-flow.tsx
// — all behaviour preserved 1:1.

export interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  /** Fires when value.length === length */
  onComplete?: (value: string) => void
  /** Number of cells. Default: 6 */
  length?: number
  /** Red border + 10% red bg on cells */
  hasError?: boolean
  /** Green border + tinted bg */
  isSuccess?: boolean
  /** Freeze cells (e.g. during verifying / after success) */
  disabled?: boolean
  /** Controls inputMode + character filtering. Default: 'numeric' */
  pattern?: 'numeric' | 'alphanumeric'
  /** Forwarded to the hidden <input> — enables imperative focus from consumer */
  ref?: Ref<HTMLInputElement>
  id?: string
  name?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  hasError = false,
  isSuccess = false,
  disabled = false,
  pattern = 'numeric',
  ref,
  id,
  name,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
}: OtpInputProps) {
  // Generate a stable id for the hidden input so click-on-cells → focus works
  // even when the consumer does not pass an explicit id.
  const autoId = useId()
  const inputId = id ?? `klyp-OtpInput-${autoId}`

  // Internal ref so the cells container can forward click-focus to the input.
  // Also merges with any consumer-supplied ref (React 19 ref-as-prop).
  const internalRef = useRef<HTMLInputElement>(null)

  const setRef = (node: HTMLInputElement | null) => {
    internalRef.current = node
    if (typeof ref === 'function') {
      ref(node)
    } else if (ref) {
      ;(ref as MutableRefObject<HTMLInputElement | null>).current = node
    }
  }

  const handleCellsClick = () => {
    internalRef.current?.focus()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const sanitized =
      pattern === 'numeric'
        ? raw.replace(/\D/g, '').slice(0, length)
        : raw.replace(/[^a-zA-Z0-9]/g, '').slice(0, length)
    onChange(sanitized)
    if (sanitized.length === length) {
      onComplete?.(sanitized)
    }
  }

  // The active cell is the next-to-fill slot. Clamped so it never exceeds
  // length - 1. Hidden when disabled / error / success (those states take
  // precedence) and when the value is fully filled (otherwise the last
  // cell would carry both `data-filled` AND `data-active`, painting a
  // double-emphasis ring on a cell the user can no longer edit).
  const activeCellIndex = Math.min(value.length, length - 1)
  const isFullyFilled = value.length >= length

  return (
    <div
      className="klyp-OtpInput"
      data-disabled={disabled || undefined}
      style={{ '--klyp-otp-length': String(length) } as React.CSSProperties}
    >
      <div
        className="klyp-OtpInput__cells"
        onClick={handleCellsClick}
        data-invalid={hasError ? 'true' : undefined}
        data-success={isSuccess ? 'true' : undefined}
      >
        <input
          ref={setRef}
          id={inputId}
          name={name}
          type="text"
          inputMode={pattern === 'numeric' ? 'numeric' : 'text'}
          autoComplete="one-time-code"
          maxLength={length}
          pattern={pattern === 'numeric' ? `\\d{${length}}` : undefined}
          spellCheck={false}
          value={value}
          onChange={handleChange}
          className="klyp-OtpInput__hiddenInput"
          aria-label={ariaLabel}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={ariaDescribedby}
          disabled={disabled}
        />
        {Array.from({ length }, (_, i) => {
          const filled = i < value.length
          const isActive =
            !disabled && !hasError && !isSuccess && !isFullyFilled && i === activeCellIndex
          return (
            <div
              key={i}
              className="klyp-OtpInput__cell"
              data-filled={filled ? 'true' : undefined}
              data-active={isActive ? 'true' : undefined}
              data-invalid={hasError ? 'true' : undefined}
              data-success={isSuccess ? 'true' : undefined}
              aria-hidden="true"
            >
              {value[i] ?? ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OtpInput

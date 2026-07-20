import './HeroAmount.scss'

export interface HeroAmountProps {
  /** Numeric value to display, e.g. 1247.50 */
  value: number
  /** Currency glyph rendered before the integer. Default `$`. */
  currency?: string
  /** Typography scale — match the consumer's hierarchy tier. */
  size?: 'hero-xl' | 'hero-lg' | 'hero-md' | 'hero-sm'
  /** Optional ticker rendered after the cents (e.g. `USDT`). */
  trailingTicker?: string
  /** Horizontal alignment of the inline-flex row. */
  align?: 'start' | 'center' | 'end'
  /** Omit `.00` when the value has zero cents. */
  hideCentsWhenZero?: boolean
  /** Live-region politeness for changing amounts. Default `polite`. */
  ariaLive?: 'off' | 'polite' | 'assertive'
}

/**
 * Hero typography composite for fintech amount display.
 *
 * Three callsites in `features/referrals/*` previously inlined this pattern
 * (currency glyph + integer + cents) with three slightly different CSS
 * classes. This component lifts the pattern into `@klyp/brand` with a
 * `size` prop that selects between four typography tiers.
 *
 * `tabular-nums` is applied so digits don't shift width during animated
 * updates — Geist Variable supports the OpenType feature natively (no need
 * to switch to a monospace font).
 *
 * A11y: every visual span is `aria-hidden`; the spoken value lives in a
 * single visually-hidden `__srLabel` span ("minus $1,247.50 USDT"). An
 * `aria-label` would NOT work for updates — live regions read changed
 * CONTENT, not labels — while the sr-only span is announced both on
 * browse and on change (`role="status"` is implicitly `aria-atomic`).
 */
export function HeroAmount({
  value,
  currency = '$',
  size = 'hero-md',
  trailingTicker,
  align = 'start',
  hideCentsWhenZero,
  ariaLive = 'polite',
}: HeroAmountProps) {
  const absolute = Math.abs(value)
  const integer = Math.trunc(absolute)
  // `Math.round` after multiplying by 100 avoids floating-point drift
  // (e.g. 1247.50 → 49.999... → 50). `% 100` keeps the result in 0..99
  // even if `value` had absurd precision.
  const cents = Math.round((absolute - integer) * 100) % 100
  const formattedInteger = integer.toLocaleString('en-US')
  const formattedCents = cents.toString().padStart(2, '0')
  const showCents = !(hideCentsWhenZero && cents === 0)
  const sign = value < 0 ? '−' : ''

  // Single spoken string for screen readers. All visual spans are hidden
  // from AT; this is the only content SR see — so browse-mode reading and
  // live announcements both speak the full value (sign + currency +
  // amount + ticker) with no double-reading.
  const srLabel = [
    value < 0 ? 'minus' : '',
    currency,
    formattedInteger + (showCents ? '.' + formattedCents : ''),
    trailingTicker,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className="klyp-HeroAmount"
      data-size={size}
      data-align={align}
      role="status"
      aria-live={ariaLive}
    >
      <span className="klyp-HeroAmount__srLabel">{srLabel}</span>
      {sign && (
        <span className="klyp-HeroAmount__sign" aria-hidden>
          {sign}
        </span>
      )}
      {currency && (
        <span className="klyp-HeroAmount__currency" aria-hidden>
          {currency}
        </span>
      )}
      <span className="klyp-HeroAmount__integer" aria-hidden>
        {formattedInteger}
      </span>
      {showCents && (
        <span className="klyp-HeroAmount__cents" aria-hidden>
          .{formattedCents}
        </span>
      )}
      {trailingTicker && (
        <span className="klyp-HeroAmount__ticker" aria-hidden>
          {trailingTicker}
        </span>
      )}
    </div>
  )
}

export default HeroAmount

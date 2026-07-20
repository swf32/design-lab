import type { ReactNode } from 'react'

import { HeroAmount } from '../HeroAmount/HeroAmount'
import type { StatusDotTone } from '../StatusDot/StatusDot'

import './BalanceCard.scss'

// =====================================================================
// BalanceCard + BalanceTriad — Klyp brand molecule
// =====================================================================
//
// Fintech-style headline-amount card lifted from the referrals dashboard
// (`features/referrals/balance-triad.tsx`, 2026-05-15). Surfaces a
// monetary total with a status-dot eyebrow, large tabular amount, optional
// sub-text and CTA slot. `primary` opts into the warm-gold ring + plus-
// lighter hover glow for the visual hero card in a triad.
//
// `BalanceTriad` is a thin grid wrapper that lays out N cards (typically
// 3) in a responsive row that collapses to 2-up / 1-up without hard
// breakpoints — the same `auto-fit minmax(min(240px, 100%), 1fr)` rhythm
// used by the source feature module. Use it when you want the lifted
// fintech layout without re-implementing the grid.
//
// Tones reuse `StatusDot`'s `data-tone` map so the dot here stays
// visually in sync with `<StatusDot>` callsites elsewhere — but we don't
// import `StatusDot` directly (parallel-build cycle risk in the wave that
// ships both components). Dot styling is inlined in BalanceCard.scss.
//
// Amount typography is delegated to `<HeroAmount size="hero-lg">` (the
// `hero-lg` tier was explicitly defined for this callsite: 32px integer,
// 16px currency, 20px cents). Refactored 2026-05-17 to remove three raw
// `em` values (`0.55em` / `-0.45em` / `0.7em`) and the typography drift
// between BalanceCard and the canonical HeroAmount component.

export interface BalanceCardProps {
  /** Eyebrow label rendered next to the status dot. */
  label: string
  /** Status-dot tone before the label. Same map as `@klyp/brand/StatusDot`. */
  dotTone?: StatusDotTone
  /** Numeric amount; rendered as `<currency><integer>.<cents>`. */
  amount: number
  /** Currency glyph before the integer. Default `'$'`. */
  currency?: string
  /** Small text below the amount (caption / context). */
  sub?: ReactNode
  /** Hero variant — gold ring + plus-lighter hover glow. */
  primary?: boolean
  /** Optional CTA slot under the amount (e.g. Withdraw button). */
  action?: ReactNode
  /** Skeleton/loading state — drives `data-loading`. */
  loading?: boolean
}

export interface BalanceTriadProps {
  /** Cards to lay out — designed for three `<BalanceCard>` children. */
  children: ReactNode
}

export function BalanceCard({
  label,
  dotTone,
  amount,
  currency = '$',
  sub,
  primary,
  action,
  loading,
}: BalanceCardProps) {
  return (
    <article
      className="klyp-BalanceCard"
      data-tone={dotTone}
      data-primary={primary || undefined}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
    >
      {/* Hover blob — soft radial corner glow that fades in on hover.
       * Sits as a real child (not ::before/::after) because both pseudos
       * are used for the base ring + colored hover ring. Wrapped in a
       * rounded clip layer so the blurred glow can't leak past the card's
       * corners on iOS/Safari (see __blobClip in BalanceCard.scss). */}
      <span className="klyp-BalanceCard__blobClip" aria-hidden="true">
        <span className="klyp-BalanceCard__blob" />
      </span>

      <header className="klyp-BalanceCard__header">
        {dotTone && (
          <span className="klyp-BalanceCard__dot" data-tone={dotTone} aria-hidden="true" />
        )}
        <span className="klyp-BalanceCard__label">{label}</span>
      </header>

      {/* HeroAmount owns the `role="status" aria-live="polite"` live-region
       * + the integer/currency/cents typography split. The wrapping `div`
       * carries the `__amount` BEM slot so the SCSS hover-blob z-index lift
       * and `data-loading` opacity rule continue to target the same element.
       * While the skeleton pulses, the stale amount is hidden from AT
       * (aria-hidden) so the status region doesn't announce an outdated
       * value; `aria-busy` on the article flags the load to SR instead. */}
      <div className="klyp-BalanceCard__amount" aria-hidden={loading || undefined}>
        <HeroAmount value={amount} currency={currency} size="hero-lg" />
      </div>

      {sub && <div className="klyp-BalanceCard__sub">{sub}</div>}

      {action && <div className="klyp-BalanceCard__action">{action}</div>}
    </article>
  )
}

export function BalanceTriad({ children }: BalanceTriadProps) {
  return (
    <section className="klyp-BalanceTriad" aria-label="Earnings summary">
      {children}
    </section>
  )
}

export default BalanceCard

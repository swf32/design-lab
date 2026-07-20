import type { ReactNode } from 'react'

import './NetworkChip.scss'

export interface NetworkChipProps {
  /** Currency ticker — e.g. "USDT", "USDC". */
  ticker: string
  /** Chain / network — e.g. "TRC20", "Tron", "ERC20". */
  network: string
  /**
   * Optional logo node. Caller supplies the brand logo (e.g. `<CryptoLogo>`).
   * When absent, the chip renders text-only without the leading avatar slot.
   * The chip clamps whatever node is passed to a 14×14 box so callers can
   * pass any reasonable size without breaking chip metrics.
   */
  logo?: ReactNode
  /**
   * Compact mode — `sm` shortens chip metrics (smaller text & padding),
   * `md` is the default reading-friendly size.
   */
  size?: 'sm' | 'md'
  /**
   * Visual selected state — applies a neutral white-50% ring (NOT gold).
   * Gold accent is reserved for true CTAs / key state highlights, not
   * selection markers that may appear N-at-once on a screen.
   */
  selected?: boolean
}

/**
 * NetworkChip — compact identity badge surfacing currency ticker + chain
 * network at a glance. Renders a two-segment label (e.g. `USDT · Tron`)
 * with an optional caller-supplied brand logo on the leading edge.
 *
 * Used in:
 *   - Withdraw drawer Review screen — confirming chain before submit
 *     (`apps/web/src/features/referrals/withdraw/concept-a-editorial-vault/
 *     screens/review-screen.tsx`).
 *   - Wallet / address cards — to show which network an address belongs to.
 *   - Anywhere "this is USDT on TRC20" needs to be surfaced as a pill,
 *     not as a full WalletRow or NetworkInfoCard.
 *
 * For full chain info (logo + name + fee + ETA) use NetworkInfoCard.
 * For a clickable chain picker use PickerCard.
 *
 * The logo node is injected by the caller (typically `<CryptoLogo>` from
 * `@klyp/brand`) so this primitive stays unaware of the registry of brand
 * logos and can ship without a circular dependency.
 */
export function NetworkChip({ ticker, network, logo, size = 'md', selected }: NetworkChipProps) {
  return (
    <span
      className="klyp-NetworkChip"
      data-size={size}
      data-selected={selected || undefined}
      /* role="img" is required for the label to be honoured: a bare span
         is role=generic, where accessible naming is prohibited (ARIA 1.2)
         and AT ignore aria-label. img also makes children presentational,
         so SR announce the label once instead of three fragment spans. */
      role="img"
      aria-label={`${ticker} on ${network} network`}
    >
      {logo && (
        <span className="klyp-NetworkChip__logo" aria-hidden>
          {logo}
        </span>
      )}
      <span className="klyp-NetworkChip__text">
        <span className="klyp-NetworkChip__ticker">{ticker}</span>
        <span className="klyp-NetworkChip__sep" aria-hidden>
          ·
        </span>
        <span className="klyp-NetworkChip__network">{network}</span>
      </span>
    </span>
  )
}

export default NetworkChip

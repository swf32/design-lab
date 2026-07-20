import type { ReactNode } from 'react'

import './WalletRow.scss'

export interface WalletRowProps {
  /** Unique radio value — used by parent radiogroup to track selection. */
  id: string
  /** Primary label (top line) — wallet name or label. */
  name: string
  /** Currency ticker, e.g. `'USDT'`. */
  ticker: string
  /** Network, e.g. `'TRC20'`. */
  network: string
  /** Truncated address tail, e.g. `'TXyZ…k9Lm'`. */
  addressTail: string
  /**
   * Logo node — caller passes `<CryptoLogo … />` (or any visual node).
   * Rendered as the leading avatar. Inlined as a prop (not imported)
   * to avoid a parallel-build cycle between WalletRow and CryptoLogo.
   */
  logo?: ReactNode
  /** If `true`, shows a small "Default" pill next to the name. */
  isDefault?: boolean
  /** Controlled selection — caller drives via `onSelect`. */
  selected?: boolean
  /** Click handler — receives no args; caller maps to id externally. */
  onSelect?: () => void
  /** Vertical density. Default `'comfortable'`. */
  density?: 'compact' | 'comfortable'
  /** If `true`, row is non-interactive and visually dimmed. */
  disabled?: boolean
}

/**
 * Card-style radio row with currency+network logo, primary label,
 * 2-line meta, optional "Default" pill, and a native-style radio circle
 * on the right edge.
 *
 * A11y: rendered as `<button role="radio" aria-checked>`. Caller is
 * responsible for wrapping multiple rows in a `<div role="radiogroup">`
 * so screen readers announce "X of Y selected" correctly.
 */
export function WalletRow({
  id,
  name,
  ticker,
  network,
  addressTail,
  logo,
  isDefault,
  selected,
  onSelect,
  density = 'comfortable',
  disabled,
}: WalletRowProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected ? 'true' : 'false'}
      /* aria-label REPLACES name-from-content, so everything visible must
         be restated — including the "Default" pill, or SR users lose it. */
      aria-label={`${name}${isDefault ? ', default' : ''}, ${ticker} ${network}, address ending ${addressTail}`}
      className="klyp-WalletRow"
      data-id={id}
      data-selected={selected || undefined}
      data-density={density}
      data-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onSelect}
    >
      {logo && (
        <span className="klyp-WalletRow__logo" aria-hidden>
          {logo}
        </span>
      )}

      <span className="klyp-WalletRow__stack">
        <span className="klyp-WalletRow__top">
          <span className="klyp-WalletRow__name">{name}</span>
          {isDefault && <span className="klyp-WalletRow__defaultPill">Default</span>}
        </span>
        <span className="klyp-WalletRow__meta">
          {ticker} · {network} · {addressTail}
        </span>
      </span>

      <span className="klyp-WalletRow__radio" aria-hidden />
    </button>
  )
}

export default WalletRow

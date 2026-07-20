import type { ReactNode } from 'react'
import './AllowancePanel.scss'

/**
 * `<AllowancePanel>` — Higgsfield-style nested card holding a token-allowance
 * headline ("1,200 tokens / month"), optional concrete usage examples ("≈ 240
 * Nano Banana 2 images"), and an optional slider slot at the bottom.
 *
 * Designed as a slot-shaped surface — the slider itself is injected via the
 * `slider` prop (typically `<AllowanceSlider>` from `@klyp/brand`) so the
 * panel does not own slider chrome. `data-has-slider` is set automatically
 * when `slider` is provided so SCSS can adjust bottom padding for the focus
 * ring without the caller flipping a flag.
 *
 * Originally lived inside `<PricingTierCard>` as `__allowancePanel`. Extracted
 * 2026-05-23 to its own brand molecule so other surfaces (dashboard usage
 * widgets, embedded tier previews) can reuse the same chassis without
 * pulling in the full pricing card.
 *
 * Visual contract:
 *   • Padded glass surface (`--color-panel-glass-bg` + matching border +
 *     `--blur-16` backdrop-filter — backdrop-blur is required even at low
 *     alpha because parent surfaces may animate underneath). Brand-aware:
 *     klyp dark = white-3% glass, unreals light = black-5% tonal step so
 *     the chassis stays legible against the white parent surface.
 *   • `--r-card` corners (concentric with the parent tier card's
 *     `--r-panel` outer radius minus the card's padding).
 *   • Locked min-height (110px) so adjacent panels in a 4-card row align
 *     even when one has a slider and another doesn't.
 *   • Header: amount (font-size-16) + unit (font-size-13), baseline-aligned
 *     so the smaller "tokens / month" hugs the bottom of the larger "1,200"
 *     — reads as one group rather than two stacked tokens.
 *   • Examples list: muted plain `<li>` stack, no leading glyph, pinned
 *     to the panel bottom via `margin-top: auto` so the header stays
 *     anchored top-left.
 */
export interface AllowancePanelProps {
  /** Headline number, e.g. `"1,200"`, `"4,500"`. String — caller owns formatting. */
  amount: string
  /** Unit label sitting next to the amount, e.g. `"tokens / month"`. */
  unit: string
  /**
   * Optional concrete usage examples shown under the headline. Plain text
   * lines, no icon, muted colour. Typical content: `"≈ 240 Nano Banana 2
   * images"`, `"≈ 12 Seedance 2.0 videos"`. Pinned to the panel bottom.
   */
  examples?: readonly string[]
  /**
   * Optional slider node injected at the panel foot — typically
   * `<AllowanceSlider …/>` from `@klyp/brand`. When present, the panel
   * sets `data-has-slider="true"` for focus-ring padding.
   */
  slider?: ReactNode
  /**
   * Optional static read-out shown at the panel foot when there is NO
   * interactive `slider` — a filled track + label that visually rhymes with
   * the slider so fixed and adjustable tiers keep equal height. `fillPercent`
   * 0–100 (default 100 = full/fixed). Today fixed tiers pass 100 + a
   * "Fixed · N tokens/mo" label; the same slot can later show a logged-in
   * user's remaining balance (e.g. `{ fillPercent: 38, label: '1,240 left' }`).
   * Ignored when `slider` is present.
   */
  readout?: { fillPercent?: number; label: string }
  /** Optional className appended to the root element. */
  className?: string
}

export function AllowancePanel({
  amount,
  unit,
  examples,
  slider,
  readout,
  className,
}: AllowancePanelProps) {
  const composed = ['klyp-AllowancePanel', className].filter(Boolean).join(' ')
  return (
    <div className={composed} data-has-slider={slider ? 'true' : undefined}>
      <div className="klyp-AllowancePanel__header">
        <span className="klyp-AllowancePanel__amount">{amount}</span>
        <span className="klyp-AllowancePanel__unit">{unit}</span>
      </div>

      {/* Control zone — fixed-height band right under the amount so all 4
       *  cards align. Adjustable tiers inject the slider (track + ticks)
       *  here; fixed tiers show a centered "Fixed per month" label filling
       *  the same band. Examples render BELOW this band. */}
      {slider ? (
        <div className="klyp-AllowancePanel__control">{slider}</div>
      ) : readout ? (
        <div className="klyp-AllowancePanel__control" data-fixed="true">
          <span className="klyp-AllowancePanel__fixedLabel">{readout.label}</span>
        </div>
      ) : null}

      {examples && examples.length > 0 && (
        <ul className="klyp-AllowancePanel__examples">
          {examples.map((line) => (
            <li key={line} className="klyp-AllowancePanel__example">
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AllowancePanel

import './TopUpDialog.scss'

import { CoinsBulk } from '@klyp/icons/bulk'
import { AddOutline, CoinsOutline, MinusOutline } from '@klyp/icons/outline'
import { Button } from '@klyp/ui/Button'
import { type ReactNode, useState } from 'react'

import { AmountInput } from '../AmountInput/AmountInput'
import { InlineWarning } from '../InlineWarning/InlineWarning'
import { MeshButton } from '../MeshButton/MeshButton'
import { Modal } from '../Modal/Modal'
import { SummaryRow } from '../SummaryRow/SummaryRow'

// =====================================================================
// TopUpDialog — Klyp brand molecule (DEV-805)
// =====================================================================
//
// A COMPACT token-purchase dialog, duplicated from <StatusDialog>'s shell
// (centred header, bordered ✕ box, hero-radius surface, divider-less
// full-width footer) — but with an interactive body instead of a static
// outcome message: a "TOKENS" eyebrow over a big centred editable
// <AmountInput> (free typing, snap-on-blur), the live "You pay $X" line,
// a full-width row of quick presets, and a now → new-total summary.
//
// `state`-driven: `buy` (picker) · `cap` (limit notice) · `upgrade` (stopper).
//
// `embedded` renders the SAME content as an inline card (reusing Modal's
// content classes) instead of a portaled overlay — used by the /topup-paywall
// playground so the dialog sits in a pane with the sidebar staying live. The
// default (false) is the normal portaled Modal — chat usage is unchanged.
//
// Brand-tier purity: this package must NOT know the app's brand/locale, so
// the consumer injects currency/number formatters + every visible string.

export type TopUpDialogState = 'buy' | 'cap' | 'upgrade'

/** A label that may interpolate the validity-window days — pass a plain node,
 *  or a function that receives `validDays` (e.g. `(d) => \`Valid for ${d} days.\``). */
export type TopUpDaysLabel = ReactNode | ((days: number) => ReactNode)

export interface TopUpDialogLabels {
  /** Heading — also the dialog's accessible title. */
  title: ReactNode
  /** Muted subline — rendered centred at the top of the BODY (not the header,
   *  so it never collides with the ✕). May be a function of `validDays`. */
  description?: TopUpDaysLabel
  /** Accessible label for the amount input + slider. */
  amountAriaLabel: string
  /** Lead-in before the live price under the input, e.g. "You pay". */
  payLabel: ReactNode
  /** Muted note under the summary (e.g. one-time TTL). May be a function of `validDays`. */
  note?: TopUpDaysLabel
  /** Summary row labels — shown only when `currentTokens > 0`. */
  nowLabel: ReactNode
  totalLabel: ReactNode
  /** Danger message rendered in the `cap` state. */
  capMessage: ReactNode
  confirmLabel: ReactNode
  cancelLabel: ReactNode
}

export interface TopUpDialogProps {
  /** Controlled open state. */
  open: boolean
  /** Dismiss callback (✕, ESC, scrim, Cancel). */
  onOpenChange: (open: boolean) => void
  /** Render the content inline (card) instead of a portaled Modal. Default false. */
  embedded?: boolean
  /** `buy` = amount picker; `cap` = limit-reached notice; `upgrade` = next-plan stopper. */
  state?: TopUpDialogState
  /** Top glyph for the `upgrade` state — e.g. `<TierGlyph tier="creator" />`. */
  icon?: ReactNode
  /** Benefit / example lines for the `upgrade` state. */
  bullets?: readonly ReactNode[]
  /** Suffix beside the number (e.g. `tokens`). */
  ticker: string
  /** One-time tokens already held — drives the summary rows (0 hides them). */
  currentTokens?: number
  /** Max ADDITIONAL tokens buyable (headroom) — slider + preset ceiling. */
  headroom: number
  /** Pack size / grid step. Default `2000`. */
  step?: number
  /** Days the one-time pack stays valid. Default `30`. Fed to function labels. */
  validDays?: number
  /** Price per `step` (raw number). Drives the live "You pay" figure. */
  pricePerStep: number
  /** Quick-amount preset candidates (token counts). Those < headroom kept; a max-number appended. */
  presets?: readonly number[]
  /** Brand-aware currency formatter (consumer-injected — tier purity). */
  formatPrice: (value: number) => string
  /** Token-count formatter. Default `en-US` grouping. */
  formatTokens?: (n: number) => string
  /** All visible copy (consumer-injected for brand/locale). */
  labels: TopUpDialogLabels
  /** Fires with the snapped token amount on confirm. */
  onConfirm?: (tokens: number) => void
  /** Show the −/+ stepper buttons flanking the amount. Default `true`. */
  showSteppers?: boolean
  /** Show the quick-amount preset buttons. Default `true`. */
  showPresets?: boolean
}

const DEFAULT_STEP = 2000
const defaultFormatTokens = (n: number): string => n.toLocaleString('en-US')

/** Snap a free-typed value onto the `step` grid, clamped to [step, headroom]. */
function snapToGrid(raw: number | undefined, step: number, max: number): number {
  if (raw == null || Number.isNaN(raw)) return step
  const snapped = Math.round(raw / step) * step
  return Math.min(max, Math.max(step, snapped))
}

/**
 * Evenly-distributed preset values across `[min, max]`: first = `min`, the rest
 * spaced to `max` (last = `max`), each snapped to `step` and deduped. e.g.
 * min 2000 · max 50000 → [2000, 12000, 22000, 30000, 40000, 50000]. Small ranges
 * collapse to fewer (max 6000 → [2000, 4000, 6000]). Shared by all variants.
 */
export function evenPresets(min: number, max: number, step: number, count = 6): number[] {
  if (max <= min) return [Math.max(step, max)]
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    const raw = i === 0 ? min : (max * i) / (count - 1)
    const v = Math.min(max, Math.max(min, Math.round(raw / step) * step))
    if (!out.includes(v)) out.push(v)
  }
  return out
}

export function TopUpDialog({
  open,
  onOpenChange,
  embedded = false,
  state = 'buy',
  icon,
  bullets = [],
  ticker,
  currentTokens = 0,
  headroom,
  step = DEFAULT_STEP,
  validDays = 30,
  pricePerStep,
  formatPrice,
  formatTokens = defaultFormatTokens,
  labels,
  onConfirm,
  showSteppers = true,
  showPresets = true,
}: TopUpDialogProps) {
  const capped = state === 'cap'

  const resolveDays = (label: TopUpDaysLabel): ReactNode =>
    typeof label === 'function' ? label(validDays) : label
  const description = resolveDays(labels.description)
  const note = resolveDays(labels.note)

  const [amount, setAmount] = useState<number | undefined>(step)
  const safeHeadroom = Math.max(step, headroom)
  const snapped = snapToGrid(amount, step, safeHeadroom)
  const newTotal = currentTokens + snapped
  const pay = (snapped / step) * pricePerStep

  // −/+ steppers: snap the current value, then nudge by one `step`, clamped to
  // the [step, headroom] grid. Minus disables at the floor, plus at the ceiling.
  const decrement = () => setAmount(Math.max(step, snapped - step))
  const increment = () => setAmount(Math.min(safeHeadroom, snapped + step))
  const atFloor = snapped <= step
  const atCeiling = snapped >= safeHeadroom

  // Evenly-spaced presets (last = max buyable). The row trims 6→5→4 on narrow
  // widths via container queries — see TopUpDialog.scss.
  const presetValues = evenPresets(step, safeHeadroom, step)

  const footer = (
    <>
      <Button variant="secondary" size="md" onPress={() => onOpenChange(false)}>
        {labels.cancelLabel}
      </Button>
      <MeshButton
        tone="gold"
        size="md"
        isDisabled={state === 'cap' || (state === 'buy' && snapped <= 0)}
        onPress={() => onConfirm?.(snapped)}
      >
        {state === 'buy' && <CoinsOutline aria-hidden width={18} height={18} />}
        {labels.confirmLabel}
      </MeshButton>
    </>
  )

  const body = capped ? (
    <div className="klyp-TopUpDialog__body klyp-TopUpDialog__cap">
      <span className="klyp-TopUpDialog__capIcon" aria-hidden>
        <CoinsBulk width={80} height={80} />
      </span>
      {description && <p className="klyp-TopUpDialog__desc">{description}</p>}
      <InlineWarning tone="danger" size="sm">
        {labels.capMessage}
      </InlineWarning>
    </div>
  ) : state === 'upgrade' ? (
    <div className="klyp-TopUpDialog__body">
      {icon && (
        <span className="klyp-TopUpDialog__tierIcon" aria-hidden>
          {icon}
        </span>
      )}
      {description && <p className="klyp-TopUpDialog__desc">{description}</p>}
      {bullets.length > 0 && (
        <ul className="klyp-TopUpDialog__bullets">
          {bullets.map((line, i) => (
            <li key={i} className="klyp-TopUpDialog__bullet">
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  ) : (
    <div className="klyp-TopUpDialog__body">
      {description && <p className="klyp-TopUpDialog__desc">{description}</p>}
      <div className="klyp-TopUpDialog__amount">
        {/* Muted uppercase eyebrow over the number — replaces the AmountInput
            ticker suffix (no duplicate "tokens" beside the value). */}
        <span className="klyp-TopUpDialog__eyebrow">{ticker}</span>
        <div className="klyp-TopUpDialog__amountStepRow">
          {showSteppers && (
            <Button
              iconLeft={MinusOutline}
              aria-label="Decrease amount"
              variant="secondary"
              size="icon"
              onPress={decrement}
              isDisabled={atFloor}
            />
          )}
          <AmountInput
            id="topup-dialog-amount"
            ariaLabel={labels.amountAriaLabel}
            value={amount}
            onValueChange={setAmount}
            min={step}
            max={safeHeadroom}
            size="hero-xl"
          />
          {showSteppers && (
            <Button
              iconLeft={AddOutline}
              aria-label="Increase amount"
              variant="secondary"
              size="icon"
              onPress={increment}
              isDisabled={atCeiling}
            />
          )}
        </div>
        <p className="klyp-TopUpDialog__pay">
          {labels.payLabel} <span className="klyp-TopUpDialog__payValue">{formatPrice(pay)}</span>
        </p>
      </div>

      {showPresets && (
        <div className="klyp-TopUpDialog__presets" role="group" aria-label={labels.amountAriaLabel}>
          {presetValues.map((p) => (
            <Button
              key={p}
              variant={snapped === p ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => setAmount(p)}
            >
              {formatTokens(p)}
            </Button>
          ))}
        </div>
      )}

      {currentTokens > 0 && (
        <div className="klyp-TopUpDialog__summary">
          <SummaryRow label={labels.nowLabel} value={formatTokens(currentTokens)} />
          <SummaryRow label={labels.totalLabel} value={formatTokens(newTotal)} emphasis="bold" />
        </div>
      )}

      {note && <p className="klyp-TopUpDialog__ttl">{note}</p>}
    </div>
  )

  // Inline card (playground) — reuses Modal's content classes so the chrome
  // reads identical, minus the portal / scrim / focus-trap.
  if (embedded) {
    return (
      <div className="klyp-Modal__content klyp-Modal__content--md klyp-TopUpDialog klyp-TopUpDialog--embedded">
        <div className="klyp-Dialog__header">
          <h2 className="klyp-Dialog__title">{labels.title}</h2>
        </div>
        <div className="klyp-Modal__body">{body}</div>
        <div className="klyp-Dialog__footer">{footer}</div>
      </div>
    )
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      title={labels.title}
      className="klyp-TopUpDialog"
      footer={footer}
    >
      {body}
    </Modal>
  )
}

export default TopUpDialog

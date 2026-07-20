import '../TopUpDialog/TopUpDialog.scss'
import './TopUpDialogV2.scss'

import { CoinsBulk } from '@klyp/icons/bulk'
import { AddOutline, CoinsOutline, MinusOutline } from '@klyp/icons/outline'
import { Button } from '@klyp/ui/Button'
import { type ReactNode, useState } from 'react'
import { AllowanceSlider } from '../AllowanceSlider/AllowanceSlider'
import { AmountInput } from '../AmountInput/AmountInput'
import { InlineWarning } from '../InlineWarning/InlineWarning'
import { MeshButton } from '../MeshButton/MeshButton'
import { MeshSlider } from '../MeshSlider/MeshSlider'
import { Modal } from '../Modal/Modal'
import { RulerSlider } from '../RulerSlider/RulerSlider'
import { SegmentSlider } from '../SegmentSlider/SegmentSlider'
import { SummaryRow } from '../SummaryRow/SummaryRow'
import { evenPresets, type TopUpDialogProps } from '../TopUpDialog/TopUpDialog'

// V1's TopUpDialogProps dropped `sliderVariant` / `showSlider` when its slider
// was removed (2026-06-29). V2/V3 are slider experiments, so they re-declare
// those two props locally on top of the shared contract.
type TopUpDialogVariantProps = TopUpDialogProps & {
  sliderVariant?: 'thin' | 'mesh' | 'segments' | 'ruler'
  showSlider?: boolean
}

// =====================================================================
// TopUpDialogV2 — DEV-805 variant 2 (DOLLARS-FIRST)
// =====================================================================
//
// Mirror of v1 with $ and tokens SWAPPED: the user types DOLLARS (input +
// presets + slider are all in currency), and the live line below reads
// "You get N tokens". `pricePerStep` $ buys `step` tokens, so the dollar grid
// step = pricePerStep and tokens = (dollars / pricePerStep) * step.
//
// Same props as v1 (the `ticker` here is the currency suffix, e.g. "$").
// `formatPrice` renders the dollar number + presets; `formatTokens` the
// token equivalent. cap / upgrade states behave exactly like v1.

const DEFAULT_STEP = 2000
const defaultFormatTokens = (n: number): string => n.toLocaleString('en-US')

/** Snap a free-typed value onto `grid`, clamped to [grid, max]. */
function snap(raw: number | undefined, grid: number, max: number): number {
  if (raw == null || Number.isNaN(raw)) return grid
  const s = Math.round(raw / grid) * grid
  return Math.min(max, Math.max(grid, s))
}

function buildStops(grid: number, max: number): number[] {
  const out: number[] = []
  for (let v = grid; v <= max; v += grid) out.push(v)
  return out
}

export function TopUpDialogV2({
  open,
  onOpenChange,
  embedded = false,
  sliderVariant = 'thin',
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
  showSlider = true,
  showSteppers = true,
  showPresets = true,
}: TopUpDialogVariantProps) {
  const capped = state === 'cap'

  const resolveDays = (label: TopUpDialogProps['labels']['description']): ReactNode =>
    typeof label === 'function' ? label(validDays) : label
  const description = resolveDays(labels.description)
  const note = resolveDays(labels.note)

  // $-domain. dollarStep buys `step` tokens; the ceiling is the dollar value
  // of the token headroom.
  const dollarStep = pricePerStep
  const maxDollars = (Math.max(step, headroom) / step) * pricePerStep
  const tokensFor = (dollars: number) => (dollars / pricePerStep) * step

  const [dollars, setDollars] = useState<number | undefined>(dollarStep)
  const snapped = snap(dollars, dollarStep, maxDollars)
  const tokens = tokensFor(snapped)
  const newTotal = currentTokens + tokens

  const decrement = () => setDollars(Math.max(dollarStep, snapped - dollarStep))
  const increment = () => setDollars(Math.min(maxDollars, snapped + dollarStep))
  const atFloor = snapped <= dollarStep
  const atCeiling = snapped >= maxDollars

  const stops = buildStops(dollarStep, maxDollars)
  const sliderIndex = Math.max(0, Math.min(stops.length - 1, snapped / dollarStep - 1))
  const dollarPresets = evenPresets(dollarStep, maxDollars, dollarStep)

  const footer = (
    <>
      <Button variant="secondary" size="md" onPress={() => onOpenChange(false)}>
        {labels.cancelLabel}
      </Button>
      <MeshButton
        tone="gold"
        size="md"
        isDisabled={state === 'cap' || (state === 'buy' && snapped <= 0)}
        onPress={() => onConfirm?.(tokens)}
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
        {/* V2 delta: DOLLARS input with the currency glyph as a LEFT prefix at
         *  the number's size (muted); tokens are the equivalent below. */}
        <div className="klyp-TopUpDialog__amountStepRow">
          {showSteppers && (
            <Button
              iconLeft={MinusOutline}
              aria-label="Decrease amount"
              variant="secondary"
              size="icon-lg"
              onPress={decrement}
              isDisabled={atFloor}
            />
          )}
          <div className="klyp-TopUpDialogV2__amountRow">
            <span className="klyp-TopUpDialogV2__currency" aria-hidden>
              {ticker}
            </span>
            <AmountInput
              id="topup-dialog-v2-amount"
              ariaLabel={labels.amountAriaLabel}
              value={dollars}
              onValueChange={setDollars}
              min={dollarStep}
              max={maxDollars}
              ticker=""
              size="hero-lg"
            />
          </div>
          {showSteppers && (
            <Button
              iconLeft={AddOutline}
              aria-label="Increase amount"
              variant="secondary"
              size="icon-lg"
              onPress={increment}
              isDisabled={atCeiling}
            />
          )}
        </div>
        <p className="klyp-TopUpDialog__pay">
          {labels.payLabel}{' '}
          <span className="klyp-TopUpDialog__payValue">{formatTokens(tokens)} tokens</span>
        </p>
      </div>

      {showPresets && (
        <div className="klyp-TopUpDialog__presets" role="group" aria-label={labels.amountAriaLabel}>
          {dollarPresets.map((d) => (
            <Button
              key={d}
              variant={snapped === d ? 'primary' : 'secondary'}
              size="md"
              onPress={() => setDollars(d)}
            >
              {formatPrice(d)}
            </Button>
          ))}
        </div>
      )}

      {showSlider && stops.length >= 2 && (
        <div className="klyp-TopUpDialog__slider">
          {sliderVariant === 'mesh' ? (
            <MeshSlider
              stops={stops.map((d) => ({ tokens: d, label: formatPrice(d) }))}
              value={sliderIndex}
              onChange={(idx) => setDollars(stops[idx] ?? dollarStep)}
              ariaLabel={labels.amountAriaLabel}
            />
          ) : sliderVariant === 'ruler' ? (
            <RulerSlider
              stops={stops.map((d) => ({ tokens: d, label: formatPrice(d) }))}
              value={sliderIndex}
              onChange={(idx) => setDollars(stops[idx] ?? dollarStep)}
              ariaLabel={labels.amountAriaLabel}
            />
          ) : sliderVariant === 'segments' ? (
            // $-first: stops are DOLLAR amounts, so the active cell labels with
            // the currency formatter ("$50"), not the token-compact default.
            <SegmentSlider
              stops={stops.map((d) => ({ tokens: d, label: formatPrice(d) }))}
              value={sliderIndex}
              onChange={(idx) => setDollars(stops[idx] ?? dollarStep)}
              ariaLabel={labels.amountAriaLabel}
              formatValue={formatPrice}
            />
          ) : (
            <AllowanceSlider
              stops={stops.map((d) => ({ tokens: d, label: formatPrice(d) }))}
              value={sliderIndex}
              onChange={(idx) => setDollars(stops[idx] ?? dollarStep)}
              ariaLabel={labels.amountAriaLabel}
              tickDisplay="endpoints"
            />
          )}
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

export default TopUpDialogV2

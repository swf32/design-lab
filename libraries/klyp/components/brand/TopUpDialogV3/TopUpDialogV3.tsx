import '../TopUpDialog/TopUpDialog.scss'
import './TopUpDialogV3.scss'

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
// TopUpDialogV3 — DEV-805 variant 3 (duplicate of TopUpDialog v1)
// =====================================================================
//
// Identical to v1 EXCEPT the buy amount block: a LEFT bulk-coin glyph (36×36)
// beside the hug-content number instead of the right-side "tokens" word, and
// `ticker` dropped. Same props (incl. `embedded` for the playground).

const DEFAULT_STEP = 2000
const defaultFormatTokens = (n: number): string => n.toLocaleString('en-US')

function snapToGrid(raw: number | undefined, step: number, max: number): number {
  if (raw == null || Number.isNaN(raw)) return step
  const snapped = Math.round(raw / step) * step
  return Math.min(max, Math.max(step, snapped))
}

function buildStops(step: number, max: number): number[] {
  const out: number[] = []
  for (let t = step; t <= max; t += step) out.push(t)
  return out
}

export function TopUpDialogV3({
  open,
  onOpenChange,
  embedded = false,
  sliderVariant = 'thin',
  state = 'buy',
  icon,
  bullets = [],
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

  const [amount, setAmount] = useState<number | undefined>(step)
  const safeHeadroom = Math.max(step, headroom)
  const snapped = snapToGrid(amount, step, safeHeadroom)
  const newTotal = currentTokens + snapped
  const pay = (snapped / step) * pricePerStep

  const decrement = () => setAmount(Math.max(step, snapped - step))
  const increment = () => setAmount(Math.min(safeHeadroom, snapped + step))
  const atFloor = snapped <= step
  const atCeiling = snapped >= safeHeadroom

  const stops = buildStops(step, headroom)
  const sliderIndex = Math.max(0, Math.min(stops.length - 1, snapped / step - 1))
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
          {/* V3 delta: coin glyph LEFT of the number, no "tokens" word. */}
          <div className="klyp-TopUpDialogV3__amountRow">
            <span className="klyp-TopUpDialogV3__coin" aria-hidden>
              <CoinsBulk width={36} height={36} />
            </span>
            <AmountInput
              id="topup-dialog-v3-amount"
              ariaLabel={labels.amountAriaLabel}
              value={amount}
              onValueChange={setAmount}
              min={step}
              max={safeHeadroom}
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
          {labels.payLabel} <span className="klyp-TopUpDialog__payValue">{formatPrice(pay)}</span>
        </p>
      </div>

      {showPresets && (
        <div className="klyp-TopUpDialog__presets" role="group" aria-label={labels.amountAriaLabel}>
          {presetValues.map((p) => (
            <Button
              key={p}
              variant={snapped === p ? 'primary' : 'secondary'}
              size="md"
              onPress={() => setAmount(p)}
            >
              {formatTokens(p)}
            </Button>
          ))}
        </div>
      )}

      {showSlider && stops.length >= 2 && (
        <div className="klyp-TopUpDialog__slider">
          {sliderVariant === 'mesh' ? (
            <MeshSlider
              stops={stops.map((t) => ({ tokens: t, label: formatTokens(t) }))}
              value={sliderIndex}
              onChange={(idx) => setAmount(stops[idx] ?? step)}
              ariaLabel={labels.amountAriaLabel}
            />
          ) : sliderVariant === 'ruler' ? (
            <RulerSlider
              stops={stops.map((t) => ({ tokens: t, label: formatTokens(t) }))}
              value={sliderIndex}
              onChange={(idx) => setAmount(stops[idx] ?? step)}
              ariaLabel={labels.amountAriaLabel}
            />
          ) : sliderVariant === 'segments' ? (
            <SegmentSlider
              stops={stops.map((t) => ({ tokens: t, label: formatTokens(t) }))}
              value={sliderIndex}
              onChange={(idx) => setAmount(stops[idx] ?? step)}
              ariaLabel={labels.amountAriaLabel}
            />
          ) : (
            <AllowanceSlider
              stops={stops.map((t) => ({ tokens: t, label: formatTokens(t) }))}
              value={sliderIndex}
              onChange={(idx) => setAmount(stops[idx] ?? step)}
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
      <div className="klyp-Modal__content klyp-Modal__content--md klyp-TopUpDialog klyp-TopUpDialogV3 klyp-TopUpDialog--embedded">
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
      className="klyp-TopUpDialog klyp-TopUpDialogV3"
      footer={footer}
    >
      {body}
    </Modal>
  )
}

export default TopUpDialogV3

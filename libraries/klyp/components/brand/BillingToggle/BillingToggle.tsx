import { Badge } from '@klyp/ui'
import { TabSwitcher } from '../TabSwitcher/TabSwitcher'

// =====================================================================
// BillingToggle — Monthly / Annual segmented switcher with SAVE % chip
// =====================================================================
//
// Thin wrapper over `<TabSwitcher>` with two pre-baked items (Monthly /
// Annual) + an optional "SAVE N%" inline chip on the Annual option.
// Visually a fully-rounded pill (`shape="pill"`) rather than the default
// card-shape used by generic tab controls — this is a settings toggle,
// not a navigation tab. Animation comes verbatim from TabSwitcher (Motion
// FLIP sliding indicator with shared layoutId).
//
// Created 2026-05-20 per design lead: «создай компонент на основе нашего таб
// свитчера, с закругленными углами и плашкой с save %, анимации как у
// таб свитчера». Replaces the per-feature native `<button>` toggle in
// `pricing-page.tsx`.

export type BillingPeriod = 'monthly' | 'annual'

export interface BillingToggleProps {
  /** Currently selected period. */
  value: BillingPeriod
  /** Called when the user flips between monthly and annual. */
  onValueChange: (next: BillingPeriod) => void
  /**
   * Annual savings percentage. Renders as a "SAVE N%" gold chip after the
   * Annual label. Omit (or set to 0/null) to hide the chip — the toggle
   * still works as a plain Monthly/Annual switch.
   */
  annualSavingsPercent?: number | null
  /**
   * Visible labels — caller controls copy + i18n. Defaults: 'Monthly',
   * 'Annual'. Customise for marketing variants (e.g. 'Pay monthly').
   */
  monthlyLabel?: string
  annualLabel?: string
  /**
   * Accessibility label for the segmented group ("Billing period",
   * "Pricing cadence", etc). Required — read by screen readers entering
   * the toggle.
   */
  ariaLabel: string
  /** Outer pill height. Default `md` (40px). */
  size?: 'sm' | 'md' | 'lg'
  /** Optional className appended to the root. */
  className?: string
}

export function BillingToggle({
  value,
  onValueChange,
  annualSavingsPercent,
  monthlyLabel = 'Monthly',
  annualLabel = 'Annual',
  ariaLabel,
  size = 'md',
  className,
}: BillingToggleProps) {
  const saveBadge =
    typeof annualSavingsPercent === 'number' && annualSavingsPercent > 0 ? (
      <Badge intent="green" variant="solid" size="md">
        Save {annualSavingsPercent}%
      </Badge>
    ) : null

  return (
    <TabSwitcher
      value={value}
      onValueChange={(next) => onValueChange(next as BillingPeriod)}
      ariaLabel={ariaLabel}
      shape="pill"
      size={size}
      className={className}
    >
      <TabSwitcher.Item value="monthly">{monthlyLabel}</TabSwitcher.Item>
      <TabSwitcher.Item value="annual" badge={saveBadge}>
        {annualLabel}
      </TabSwitcher.Item>
    </TabSwitcher>
  )
}

export default BillingToggle

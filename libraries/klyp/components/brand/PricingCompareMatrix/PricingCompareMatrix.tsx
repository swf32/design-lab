import './PricingCompareMatrix.scss'

import { CheckOutline } from '@klyp/icons'
import { Fragment, type ReactNode, type Ref } from 'react'
import { type BrandId, useBrand } from '../_brand-context'
import { BillingToggle } from '../BillingToggle/BillingToggle'
import type { PricingTierId } from '../PricingTierCard'

const MATRIX_COPY = {
  klyp: {
    comparePlans: 'Compare plans',
    compareXPlans: (n: string) => `Compare ${n} plans`,
    billingPeriod: 'Billing period',
    feature: 'Feature',
  },
  unreals: {
    comparePlans: 'Сравнение тарифов',
    compareXPlans: (n: string) => `Сравнение тарифов ${n}`,
    billingPeriod: 'Период оплаты',
    feature: 'Фича',
  },
} as const

// =====================================================================
// PricingCompareMatrix — Magnific-style compare table (2026-05-20 rework)
// =====================================================================
//
// Sticky tier-card header + per-model rows with derived per-tier counts,
// modelled on magnific.com/pricing. Source PR comment + screenshots from
// design lead: «compare plans block переделать наш под такой формат… хедер
// побольше чем наш, sticky».
//
// Composition top-down:
//   1. `<table>` thead, single sticky row `__tierRow` (Magnific pattern,
//      sticky `top: var(--matrix-sticky-top, 0)`; the consumer opts into an
//      offset only when a header overlaps the scroll port). Corner cell
//      hosts the `<BillingToggle>` brand control
//      (Monthly/Annual + SAVE% chip); per-tier cells render the tier card
//      stack (name + price line + credits/year + Get-plan CTA).
//   2. `<tbody>` — alternating `__catRow` (full-width category header) +
//      data rows with `__rowLabel` (model label + optional badge + optional
//      subline) and per-tier cells.
//
// A11y:
//   • Table has `aria-label`.
//   • `<th scope="col">` on tier headers, `<th scope="row">` on row labels.
//   • Billing toggle: a11y owned by `<BillingToggle>` → `<TabSwitcher>` →
//     RAC `ToggleButtonGroup` (roving tabindex + arrow nav per ARIA APG).
//   • Badge pills are text spans (NEW, LOWER PRICE) — SR users hear the
//     label naturally.

/** Inline minus glyph. No `MinusOutline` in `@klyp/icons/outline`. */
function MinusGlyph(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export type CellValue =
  | { kind: 'check' }
  | { kind: 'minus' }
  | { kind: 'num'; value: string; sub?: string }
  | { kind: 'text'; value: string }

/** Optional inline badge next to a row label — Magnific-style NEW /
 *  LOWER PRICE. */
export type CompareRowBadge = 'new' | 'lower-price'

export interface CompareRow {
  /** Row label, shown in the left-most column (scope="row"). */
  label: string
  /** One cell per tier, in the same order as `tiers`. */
  cells: readonly CellValue[]
  /** Optional secondary text under the label (e.g. `"100 credits / 10s
   *  clip"` on a model row). Same line height as the label, muted color. */
  subline?: string
  /** Optional inline pill next to the label (NEW / LOWER PRICE). */
  badge?: CompareRowBadge
  /** Optional icon rendered BEFORE the label — e.g. a provider logo on a
   *  model row (`<ProviderIcon provider="openai" />`). Any ReactNode. */
  icon?: ReactNode
}

export interface CompareCategory {
  /** Category heading row — uppercase muted label on `--color-bg-canvas`. */
  title: string
  rows: readonly CompareRow[]
}

export interface PricingCompareMatrixTier {
  id: PricingTierId
  /** Tier display name (e.g. `Creator Plus`). */
  name: string
  /** Display price (current billing period) shown big in the tier card,
   *  e.g. `$9.99`. Optional — when absent, the tier card omits the price
   *  block (use for legacy / no-price tier displays). */
  price?: string
  /** Optional pre-discount price string. When set, the tier-header cell
   *  renders a struck-through line above `price` showing the un-discounted
   *  figure — mirrors `<PricingTierCard>`'s `priceOriginal` slot so the
   *  card grid and the sticky matrix header tell the same story (the design lead
   *  2026-05-22, DEV-187 audit fix). */
  priceOriginal?: string
  /** Cadence string rendered next to the price, e.g. `/month` or
   *  `/mo · billed annually`. Optional. */
  priceUnit?: string
  /** Annual credits/year label rendered under the price (Magnific style),
   *  e.g. `'3,600/year'`. */
  creditsPerYear?: string
  /** CTA rendered at the bottom of the tier card — typically a `<Button>`
   *  / `<MeshButton>` / anchor (the matrix doesn't own button chrome). */
  cta?: ReactNode
  /** Marks this tier as recommended — paints the gold wash across every
   *  body cell + flips the tier-card name to `--color-fg-accent`. */
  recommended?: boolean
}

export type PricingCompareBillingPeriod = 'monthly' | 'annual'

export interface PricingCompareMatrixProps {
  /** Tier identifiers left → right. Length must match every row's `cells`. */
  tiers: readonly PricingCompareMatrixTier[]
  /** Grouped rows. */
  categories: readonly CompareCategory[]
  /** Current billing period — drives the toggle's active state. */
  billingPeriod?: PricingCompareBillingPeriod
  /** Toggle change handler. When omitted, the toggle is hidden — useful
   *  for legacy renders that don't need an in-matrix billing switch. */
  onBillingPeriodChange?: (p: PricingCompareBillingPeriod) => void
  /** Discount percentage shown next to the toggle (e.g. `10` → "Save
   *  10% with annual"). Defaults to `10`. */
  annualDiscountPct?: number
  /** Brand name used in `<table>` aria-label. Default `'Klyp'`. Override
   *  per brand — `brand.name` from `@/lib/brand` on apps-side. */
  brandName?: string
  /** Optional className for the root `<section>`. */
  className?: string
  /** React 19 ref-as-prop. */
  ref?: Ref<HTMLElement>
}

function renderCell(cell: CellValue): ReactNode {
  switch (cell.kind) {
    case 'check':
      return (
        <span className="klyp-PricingCompareMatrix__check">
          <CheckOutline />
        </span>
      )
    case 'minus':
      return (
        <span className="klyp-PricingCompareMatrix__minus">
          <MinusGlyph />
        </span>
      )
    case 'num':
      return (
        <>
          <span className="klyp-PricingCompareMatrix__num">{cell.value}</span>
          {cell.sub && <div className="klyp-PricingCompareMatrix__muted">{cell.sub}</div>}
        </>
      )
    case 'text':
      return <span className="klyp-PricingCompareMatrix__muted">{cell.value}</span>
  }
}

function renderBadge(badge: CompareRowBadge, brandId: BrandId): ReactNode {
  const label =
    brandId === 'unreals'
      ? badge === 'new'
        ? 'Новое'
        : 'Ниже цена'
      : badge === 'new'
        ? 'New'
        : 'Lower price'
  // Label is visible text inside the span — no need for aria-label
  // (would duplicate the announcement).
  return (
    <span className="klyp-PricingCompareMatrix__pill" data-tone={badge}>
      {label}
    </span>
  )
}

export function PricingCompareMatrix({
  tiers,
  categories,
  billingPeriod,
  onBillingPeriodChange,
  annualDiscountPct = 10,
  brandName = 'Klyp',
  className,
  ref,
}: PricingCompareMatrixProps) {
  const { brandId } = useBrand()
  const matrixCopy = MATRIX_COPY[brandId]
  const totalCols = tiers.length + 1 // +1 for the row-label column
  const hasToggle = billingPeriod !== undefined && onBillingPeriodChange !== undefined

  return (
    <section
      ref={ref}
      className={['klyp-PricingCompareMatrix', className].filter(Boolean).join(' ')}
      aria-label={matrixCopy.comparePlans}
    >
      <div className="klyp-PricingCompareMatrix__scrollWrap">
        <table
          className="klyp-PricingCompareMatrix__table"
          aria-label={matrixCopy.compareXPlans(brandName)}
        >
          <thead>
            <tr className="klyp-PricingCompareMatrix__tierRow">
              {/* Corner cell — Magnific puts the Monthly/Annual toggle +
               *  "Save N% with annual" hint HERE (left of the tier cards),
               *  not in a separate row above. When the consumer provides
               *  `billingPeriod` + `onBillingPeriodChange`, the toggle
               *  renders; otherwise this cell is a SR-only spacer. */}
              <th scope="col" className="klyp-PricingCompareMatrix__rowHeadCol">
                {hasToggle ? (
                  <BillingToggle
                    value={billingPeriod}
                    onValueChange={onBillingPeriodChange}
                    annualSavingsPercent={annualDiscountPct}
                    ariaLabel={matrixCopy.billingPeriod}
                    size="md"
                  />
                ) : (
                  <span className="klyp-PricingCompareMatrix__visuallyHidden">
                    {matrixCopy.feature}
                  </span>
                )}
              </th>
              {tiers.map((tier) => (
                <th
                  key={tier.id}
                  scope="col"
                  className="klyp-PricingCompareMatrix__tierCell"
                  data-recommended={tier.recommended ? 'true' : undefined}
                >
                  <div className="klyp-PricingCompareMatrix__tierCard">
                    <span className="klyp-PricingCompareMatrix__tierName">{tier.name}</span>
                    {tier.price && (
                      <div className="klyp-PricingCompareMatrix__tierPriceLine">
                        <span className="klyp-PricingCompareMatrix__tierPrice">{tier.price}</span>
                        {tier.priceUnit && (
                          <span className="klyp-PricingCompareMatrix__tierPriceUnit">
                            {tier.priceUnit}
                          </span>
                        )}
                      </div>
                    )}
                    {tier.creditsPerYear && (
                      <span className="klyp-PricingCompareMatrix__tierCredits">
                        {tier.creditsPerYear}
                      </span>
                    )}
                    {tier.cta && (
                      <div className="klyp-PricingCompareMatrix__tierCta">{tier.cta}</div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <Fragment key={`cat-${category.title}`}>
                <tr className="klyp-PricingCompareMatrix__catRow">
                  <td colSpan={totalCols}>{category.title}</td>
                </tr>
                {category.rows.map((row) => (
                  <tr key={`${category.title}-${row.label}`}>
                    <th scope="row" className="klyp-PricingCompareMatrix__rowLabel">
                      <div className="klyp-PricingCompareMatrix__rowLabelMain">
                        {row.icon && (
                          <span className="klyp-PricingCompareMatrix__rowIcon" aria-hidden>
                            {row.icon}
                          </span>
                        )}
                        <span>{row.label}</span>
                        {row.badge && renderBadge(row.badge, brandId)}
                      </div>
                      {row.subline && (
                        <span className="klyp-PricingCompareMatrix__rowSubline">{row.subline}</span>
                      )}
                    </th>
                    {row.cells.map((cell, i) => {
                      const tier = tiers[i]
                      return (
                        <td
                          // Row × column index stable for static data; tier
                          // id keeps key uniqueness when row labels collide.
                          key={`${category.title}-${row.label}-${tier?.id ?? i}`}
                          data-recommended={tier?.recommended ? 'true' : undefined}
                        >
                          {renderCell(cell)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default PricingCompareMatrix

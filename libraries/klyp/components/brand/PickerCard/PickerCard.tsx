import './PickerCard.scss'

import type { ReactNode } from 'react'

// =====================================================================
// PickerCard — Klyp brand atom (Tier 3)
// =====================================================================
//
// Generic standalone radio-tile card. Self-contained: renders as a
// `<button role="radio">` with `aria-checked`. Use either as a single
// tile (controlled selection) or inside a `<div role="radiogroup">`
// for native radio semantics.
//
// Anatomy (vertical layout — default):
//   ┌──────────────────────────────┐
//   │  ┌────┐                  ◯   │ ← visual slot + radio dot
//   │  │logo│                      │
//   │  └────┘                      │
//   │                              │
//   │  Label                       │ ← primary line
//   │  Sub                         │ ← optional secondary line
//   └──────────────────────────────┘
//
// Anatomy (horizontal layout):
//   ┌──────────────────────────────────────────┐
//   │  ┌────┐  Label                       ◯   │
//   │  │logo│  Sub                             │
//   │  └────┘                                  │
//   └──────────────────────────────────────────┘
//
// Reference callsite pattern: see USDT/USDC currency picker tiles in
// `apps/web/src/features/referrals/withdraw/shared/components/add-wallet-form.tsx`.

export interface PickerCardProps {
  /** Unique id — used for `htmlFor` / `aria-labelledby` wiring by callers. */
  id: string
  /** Primary line (e.g. "USDT"). */
  label: ReactNode
  /** Secondary line (e.g. "Tether"). */
  sub?: ReactNode
  /** Top / leading slot — large logo or icon. Caller passes ReactNode. */
  visual?: ReactNode
  /** Selected state — drives `aria-checked` + `[data-selected]`. */
  selected?: boolean
  /** Click handler — typically toggles selection in the parent radiogroup. */
  onSelect?: () => void
  /** Disable interaction. */
  disabled?: boolean
  /** Padding scale. Default `md`. */
  size?: 'sm' | 'md' | 'lg'
  /** Layout direction. `vertical` stacks visual above label. */
  layout?: 'vertical' | 'horizontal'
  /** Show the radio dot indicator. When `false`, selection is shown only via the border ring. */
  showRadioDot?: boolean
}

export function PickerCard({
  id,
  label,
  sub,
  visual,
  selected,
  onSelect,
  disabled,
  size = 'md',
  layout = 'vertical',
  showRadioDot = true,
}: PickerCardProps) {
  return (
    <button
      id={id}
      type="button"
      role="radio"
      aria-checked={selected ?? false}
      className="klyp-PickerCard"
      data-selected={selected || undefined}
      data-size={size}
      data-layout={layout}
      data-disabled={disabled || undefined}
      disabled={disabled}
      onClick={onSelect}
    >
      {visual ? (
        <span className="klyp-PickerCard__visual" aria-hidden>
          {visual}
        </span>
      ) : null}
      <span className="klyp-PickerCard__stack">
        <span className="klyp-PickerCard__label">{label}</span>
        {sub ? <span className="klyp-PickerCard__sub">{sub}</span> : null}
      </span>
      {showRadioDot ? <span className="klyp-PickerCard__radio" aria-hidden /> : null}
    </button>
  )
}

export default PickerCard

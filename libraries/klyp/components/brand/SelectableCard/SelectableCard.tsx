import './SelectableCard.scss'

import type { ComponentProps, ReactNode } from 'react'

// =====================================================================
// SelectableCard — Klyp brand molecule (Tier 4)
// =====================================================================
//
// Self-contained card content for use inside `<Radio data-variant="card">`
// or `<Checkbox data-variant="card">` (from `@klyp/ui`). Anatomy:
//
//   ┌───────────────────────────────────┐
//   │  ╭──╮                          ✓  │ ← icon + selected check (top-right)
//   │  │ic│                             │
//   │  ╰──╯                             │
//   │                                   │
//   │  Title                            │
//   │  Description (optional, 1-2 lines)│
//   └───────────────────────────────────┘
//
// Selection state is owned by the parent RAC `Radio` / `Checkbox` — it
// applies `[data-selected]` on its label root. Our SCSS reads that
// ancestor attribute to highlight the check badge:
//
//   .klyp-Radio[data-selected] .klyp-SelectableCard__check { … }
//
// Same logic for `[data-disabled]` (which propagates from RAC group).
//
// ⛔ NO Warm Gold — selected check is a white filled circle with a dark
// checkmark, per the onboarding mock visual contract.

export type SelectableCardProps = ComponentProps<'div'> & {
  /** Optional Iconsax outline / bulk icon node, rendered top-left. */
  icon?: ReactNode
  /** Primary heading. */
  title: ReactNode
  /** Optional secondary line (clamped to 2). */
  description?: ReactNode
}

export function SelectableCard({
  icon,
  title,
  description,
  className,
  children,
  ...props
}: SelectableCardProps) {
  const rootClass =
    typeof className === 'string' && className.length > 0
      ? `klyp-SelectableCard ${className}`
      : 'klyp-SelectableCard'
  return (
    <div data-slot="selectable-card" className={rootClass} {...props}>
      {icon ? (
        <span aria-hidden className="klyp-SelectableCard__icon">
          {icon}
        </span>
      ) : null}
      <span className="klyp-SelectableCard__body">
        <span className="klyp-SelectableCard__title">{title}</span>
        {description ? (
          <span className="klyp-SelectableCard__description">{description}</span>
        ) : null}
        {children}
      </span>
      <span aria-hidden className="klyp-SelectableCard__check">
        <svg
          viewBox="0 0 12 12"
          width="100%"
          height="100%"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="presentation"
          focusable="false"
        >
          <path d="M2.5 6.5l2.5 2.5 4.5-5" />
        </svg>
      </span>
    </div>
  )
}

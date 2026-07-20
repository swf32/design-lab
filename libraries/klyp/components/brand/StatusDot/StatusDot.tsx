import './StatusDot.scss'

// =====================================================================
// StatusDot — Klyp brand atom
// =====================================================================
//
// Tiny solid colored dot used inline as a live-status indicator
// (BalanceCard tone dots, sidebar "Soon" rows, generation queue
// pills). Visual-only — pass `aria-label` when the dot conveys
// semantics not already in adjacent text.
//
// Tones map to semantic status tokens (success/warning/danger/info)
// plus `neutral` (muted fg) and `accent` (warm gold) for non-status
// indicators. Sizes: xs (6px) / sm (8px, default) / md (10px).
// `pulse` drives a 1.6s opacity animation for "live" / "in progress"
// states. Variants are driven by `data-tone`, `data-size`, and
// `data-pulse` per Klyp data-attribute convention.

export type StatusDotTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent'

export type StatusDotSize = 'xs' | 'sm' | 'md'

export interface StatusDotProps {
  /** Color tone — drives background via `data-tone`. Default `neutral`. */
  tone?: StatusDotTone
  /** Dot diameter: xs=6px / sm=8px / md=10px. Default `sm`. */
  size?: StatusDotSize
  /** Animated opacity pulse for "live" / in-progress states. */
  pulse?: boolean
  /** Accessible label — required when the dot conveys meaning alone. */
  'aria-label'?: string
}

export function StatusDot({
  tone = 'neutral',
  size = 'sm',
  pulse = false,
  'aria-label': ariaLabel,
}: StatusDotProps) {
  return (
    <span
      role="status"
      className="klyp-StatusDot"
      data-tone={tone}
      data-size={size}
      data-pulse={pulse || undefined}
      aria-label={ariaLabel}
    />
  )
}

export default StatusDot

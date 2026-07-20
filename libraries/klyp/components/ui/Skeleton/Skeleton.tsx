import './Skeleton.scss'

import type { ComponentProps } from 'react'

// =====================================================================
// Skeleton — Klyp loading-state placeholder
// =====================================================================
//
// Default animation: **Pulse Wave** (set `animation="none"` to opt a single
// instance out). Opacity breath (1.6s) plus an
// optional per-instance phase offset (`--klyp-stagger-i` × 120ms).
// When a parent renders many Skeletons in document order and assigns
// sequential indices, the breath rolls top-down through the row as
// one continuous wave — different placeholders sit on different
// phases of the same cycle. Standalone usage (no stagger) reads as
// plain Pulse, which is the correct fallback.
//
// Stagger contract: pass `style={{ '--klyp-stagger-i': N }}` on each
// Skeleton instance. Default 0 — safe for solo placeholders.

export type SkeletonRadius = 'sm' | 'chip' | 'card' | 'section' | 'panel' | 'full'
export type SkeletonAnimation = 'wave' | 'none'

export type SkeletonProps = ComponentProps<'div'> & {
  radius?: SkeletonRadius
  /**
   * Animation mode. `'wave'` (default) = the pulse-wave breath.
   * `'none'` = a static placeholder (no motion) — use inside an already
   * animated context, or to opt a single instance out of motion without
   * relying on OS-level `prefers-reduced-motion`.
   */
  animation?: SkeletonAnimation
}

export function Skeleton({ className, radius, animation, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      data-radius={radius}
      data-animation={animation === 'none' ? 'none' : undefined}
      aria-hidden="true"
      className={typeof className === 'string' ? `klyp-Skeleton ${className}` : 'klyp-Skeleton'}
      {...props}
    />
  )
}

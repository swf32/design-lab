import './SkeletonCard.scss'

import { Skeleton } from '@klyp/ui/Skeleton'
import type { HTMLAttributes } from 'react'

// =====================================================================
// SkeletonCard — Klyp brand molecule (Phase 3 of React Aria migration)
// =====================================================================
//
// Loading-state placeholder for grids of asset cards (Library, Series list,
// Scene grid). Mirrors SceneCard / asset-card shape so layout doesn't shift
// when real data arrives.
//
// Surface styled in-place (flex column / radius / padding live in
// SkeletonCard.scss). The ui/Card primitive was removed 2026-06-25 —
// SkeletonCard was its only consumer. Composes ui/Skeleton only.
// All visual state via Klyp DTCG tokens — no Tailwind, no cn().

type CardRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | '21:9'

type SkeletonCardProps = HTMLAttributes<HTMLDivElement> & {
  /** Aspect ratio of the top media block. Default 16:9. */
  ratio?: CardRatio
  /** Lines of text skeleton inside the body. Default 2. */
  lines?: number
  /** Show a meta-row (chips placeholder) under the lines. */
  meta?: boolean
}

function joinClass(base: string, className: unknown): string {
  return typeof className === 'string' && className.length > 0 ? `${base} ${className}` : base
}

export function SkeletonCard({
  ratio = '16:9',
  lines = 2,
  meta = true,
  className,
  ...props
}: SkeletonCardProps) {
  return (
    <div
      data-slot="skeleton-card"
      data-ratio={ratio}
      aria-busy="true"
      className={joinClass('klyp-SkeletonCard', className)}
      {...props}
    >
      <Skeleton className="klyp-SkeletonCard__media" />
      <div className="klyp-SkeletonCard__body">
        {Array.from({ length: lines }).map((_, idx) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton lines are static and order-stable
            key={idx}
            className={
              idx === 0
                ? 'klyp-SkeletonCard__line klyp-SkeletonCard__line--lead'
                : 'klyp-SkeletonCard__line'
            }
          />
        ))}
        {meta && (
          <div className="klyp-SkeletonCard__meta">
            <Skeleton className="klyp-SkeletonCard__chip klyp-SkeletonCard__chip--sm" />
            <Skeleton className="klyp-SkeletonCard__chip klyp-SkeletonCard__chip--md" />
          </div>
        )}
      </div>
    </div>
  )
}

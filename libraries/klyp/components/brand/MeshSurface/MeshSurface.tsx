import './MeshSurface.scss'

import { type CSSProperties, useId, useMemo } from 'react'

/**
 * `<MeshSurface>` — the golden goo-blob mesh fill extracted from `<MeshButton>`
 * as a standalone, reusable layer (the MeshButton SCSS long anticipated "another
 * mesh-* component"). It paints ONLY the animated mesh: an absolutely-positioned
 * layer that fills its (positioned, rounded, `overflow:hidden`) parent.
 *
 * Tech (identical to MeshButton, incl. the iOS Safari fixes):
 *   • per-instance `useId` goo `<filter>` (duplicate static `<filter id>`s are
 *     Safari resolution-roulette);
 *   • rounded clip wrapper with a self-mask (`mask: linear-gradient(#000 0 0)`)
 *     so the composited/filtered output is contained on iOS Safari;
 *   • 4 hard-light radial blobs drifting via seeded keyframes.
 *
 * Drop it inside any `position: relative; overflow: hidden; border-radius: …`
 * box (slider fill, thumb, chips…). Pure decoration → `aria-hidden`.
 */

export interface MeshSurfaceProps {
  /** Post-goo blur radius. Smaller surfaces want a smaller blur. Default 6px. */
  blur?: string
  className?: string
}

type Seed = { delays: [number, number, number, number]; mults: [number, number, number, number] }
function createSeed(): Seed {
  const r = Math.random
  return {
    delays: [-(r() * 15), -(r() * 15), -(r() * 15), -(r() * 15)],
    mults: [0.85 + r() * 0.35, 0.85 + r() * 0.35, 0.85 + r() * 0.35, 0.85 + r() * 0.35],
  }
}

export function MeshSurface({ blur = '6px', className }: MeshSurfaceProps) {
  const seed = useMemo(createSeed, [])
  const gooId = `klyp-MeshSurface-goo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  const vars = {
    '--mesh-goo': `url("#${gooId}")`,
    '--mesh-blur': blur,
    '--blob-a-delay': `${seed.delays[0]}s`,
    '--blob-b-delay': `${seed.delays[1]}s`,
    '--blob-c-delay': `${seed.delays[2]}s`,
    '--blob-d-delay': `${seed.delays[3]}s`,
    '--blob-a-mult': seed.mults[0],
    '--blob-b-mult': seed.mults[1],
    '--blob-c-mult': seed.mults[2],
    '--blob-d-mult': seed.mults[3],
  } as CSSProperties

  return (
    <span
      aria-hidden
      className={['klyp-MeshSurface', className].filter(Boolean).join(' ')}
      style={vars}
    >
      <svg className="klyp-MeshSurface__svgFilter" aria-hidden focusable="false">
        <defs>
          <filter id={gooId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -7"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <span className="klyp-MeshSurface__inner">
        <span className="klyp-MeshSurface__blob" data-blob="a" />
        <span className="klyp-MeshSurface__blob" data-blob="b" />
        <span className="klyp-MeshSurface__blob" data-blob="c" />
        <span className="klyp-MeshSurface__blob" data-blob="d" />
      </span>
    </span>
  )
}

export default MeshSurface

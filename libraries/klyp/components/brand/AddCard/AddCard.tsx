/**
 * `<AddCard>` — Tier 4 brand molecule for "+ create new entity" CTAs that
 * sit inside a grid of `<AssetCard>` siblings (serials, episodes, scenes,
 * library entities) and read as an empty slot, not a populated tile.
 *
 * **Why a dedicated component**
 *
 * A dashed-border "+" tile shows up in many grids: Home (`+ New serial`,
 * `+ New scene`), Series detail (`+ New episode`), Episode detail
 * (`+ Add scene`), Library tabs (`+ New character`, `+ New outfit`, etc.),
 * and the cover uploader's empty state (`+ Add cover image`). Without
 * one source of truth this drifts: different radii, different label
 * casing, different aspect ratios, different focus rings. AddCard is
 * the contract for all of them — variants drive the surface, not the
 * caller.
 *
 * **Visual contract** (per concept-optimal.html line 317 + spec §6)
 *
 *   - Subtle `bg-surface-panel/40` fill — one shade above `bg-root` so
 *     the empty slot reads as a discrete grid cell, not a hole in the
 *     canvas. Was transparent prior.
 *   - 1px dashed border — only AddCard uses dashed; live cards are solid
 *   - `--r-card` (12px) — same radius as AssetCard sibling
 *   - Centered vertical stack: icon (24px "+" or `iconSlot`) → label →
 *     optional sublabel
 *   - Hover: border darkens (`border-default`) + faint panel tint
 *   - Aspect honored via data attributes — caller controls grid track
 *
 * **Variants**
 *
 *   `aspect`  — `'16/9' | '4/3' | '3/4' | '1/1' | 'auto'`. Default `16/9`
 *               so it sits naturally next to `<AssetCard kind="series">`.
 *               Use `'auto'` + custom min-height for row-shaped lists.
 *   `accent`  — `'gold' | 'neutral'`. Default `'neutral'`. `'gold'` is the
 *               primary "create" CTA on a screen and is bound by the
 *               single-accent rule (`Warm Gold ≤ 2/screen`). One per grid.
 *   `size`    — `'sm' | 'md' | 'lg'`. Drives padding, not type scale.
 *
 * **Anti-pattern guards**
 *
 *   - React 19 ref-as-prop, NO `forwardRef`
 *   - Tokens-only — no hex, no off-system radii, no magic spacing
 *   - Iconsax-friendly slot (`ReactNode`), no library-specific type leak
 *   - No fixed widths — width:100%, parent grid track sets size
 *   - Dashed border is the ONLY decorative deviation from AssetCard
 */

import type { ReactNode, Ref } from 'react'
import './AddCard.scss'

export type AddCardAspect = '16/9' | '4/3' | '3/4' | '1/1' | 'auto'
export type AddCardAccent = 'gold' | 'neutral'
export type AddCardSize = 'sm' | 'md' | 'lg'

export type AddCardProps = {
  /**
   * Sentence-case label rendered under the icon — e.g. `"New episode"`,
   * `"Add scene"`. Also used as the default `aria-label` so screen-readers
   * announce the action without depending on visual tracking.
   */
  label: string

  /** Click handler — opens the create flow. No-op when `disabled`. */
  onClick: () => void

  /** Optional helper line under the label (single line, line-clamped). */
  description?: string

  /**
   * Override the default `+` glyph with a custom node — e.g. an Iconsax
   * Bulk icon. Recommended size 24px to match the default `+`.
   */
  icon?: ReactNode

  /** Disabled state — e.g. no permission, quota exhausted. */
  disabled?: boolean

  /** Override the auto-derived aria-label (defaults to `label`). */
  ariaLabel?: string

  /** Aspect ratio. Default `'16/9'`. */
  aspect?: AddCardAspect

  /** Accent. Default `'neutral'`. */
  accent?: AddCardAccent

  /** Padding scale. Default `'md'`. */
  size?: AddCardSize

  /** Explicit pixel width — applied inline on the button root. Required
   *  when consumer is `react-photo-album`'s `render.photo` (RPA does NOT
   *  wrap render.photo elements — the tile must self-size from layout).
   *  When omitted, the SCSS default `width: 100%` applies. */
  width?: number

  /** Explicit pixel height — see `width`. */
  height?: number

  /** React 19 ref-as-prop. */
  ref?: Ref<HTMLButtonElement>

  className?: string
}

export function AddCard({
  label,
  onClick,
  description,
  icon,
  disabled,
  ariaLabel,
  aspect = '16/9',
  accent = 'neutral',
  size = 'md',
  width,
  height,
  className,
  ref,
}: AddCardProps) {
  const rootClass = ['klyp-AddCard', className].filter(Boolean).join(' ')
  // Explicit px dims for RPA `render.photo` callers — overrides SCSS
  // `width: 100%` + aspect-ratio fallback. Inline style only set when
  // props provided; otherwise CSS defaults apply (Storybook, fixed-track
  // grids, cover uploader empty state).
  const dimStyle =
    width != null || height != null
      ? {
          ...(width != null ? { width: `${width}px` } : null),
          ...(height != null ? { height: `${height}px` } : null),
        }
      : undefined

  return (
    <button
      ref={ref}
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      data-slot="add-card"
      data-aspect={aspect}
      data-accent={accent}
      data-size={size}
      className={rootClass}
      style={dimStyle}
    >
      {/* Inline SVG dashed border. Native `border: dashed` can't do
          rounded dash caps or animated stroke offset — SVG can. The
          rect uses `pathLength="300"` so the 1.5/1.5 dash pattern (3
          units total) divides evenly across the perimeter — no
          asymmetric corners. `stroke-linecap="round"` rounds each
          dash. CSS animates `stroke-dashoffset` on hover for the
          clockwise snake effect. */}
      <svg
        aria-hidden
        focusable="false"
        preserveAspectRatio="none"
        className="klyp-AddCard__border"
      >
        {/* Rect sits at SVG bounds (width/height 100%). The SVG itself
            is positioned inset 1px from card edge via CSS — that 1px
            inset accommodates the centered 1.5px stroke (0.75px each
            side) so nothing clips. `pathLength=250` divides evenly by
            the dash cycle (1.5 + 1 = 2.5) → 100 dashes around perimeter,
            symmetric corners. */}
        <rect
          width="100%"
          height="100%"
          rx="11"
          ry="11"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="1 1"
          pathLength={250}
        />
      </svg>

      <span aria-hidden className="klyp-AddCard__icon">
        {icon ?? '+'}
      </span>

      <span className="klyp-AddCard__label">{label}</span>

      {description ? <span className="klyp-AddCard__description">{description}</span> : null}
    </button>
  )
}

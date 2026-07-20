import './TierGlyph.scss'

import type { CSSProperties, SVGProps } from 'react'
import type { PricingTierId } from '../PricingTierCard/PricingTierCard'

/**
 * `<TierGlyph>` — small brand glyph for each Klyp paid subscription tier
 * (design lead 2026-05-22). Used as the leading icon on every `<MeshButton>` CTA
 * across the `/pricing` route, AND as a tile-grid entry in the catalog's
 * `/components/icons` Colorful category.
 *
 * Four glyphs, one per paid tier id:
 *   • `starter`     — silver gradient capsule (4-step drop-shadow filter)
 *   • `creator`     — purple 5-pointed star
 *   • `creatorPlus` — gold sunburst / crown
 *   • `studio`      — blue camera (no drop-shadow — flat-ish marketing read)
 *
 * `free` and `enterprise` tier ids return `null` — those two aren't in the
 * public 4-card pricing grid as of 2026-05-22, no designed glyph yet. When
 * either is added to the marketing surface, design a 5th/6th glyph and add
 * the matching `case` block below.
 *
 * Companion to `<MeshButton>` hover affordance (in MeshButton.scss): when
 * this SVG is rendered as the FIRST direct child of `klyp-MeshButton__content`,
 * MeshButton's `:has(> svg:first-child)` selectors trigger icon-scale 1.15 +
 * content translateX 2px on hover. Pass `<TierGlyph>` as the first child of
 * MeshButton — the wrapper is a plain `<svg>` element so it lands directly
 * in the right slot.
 *
 * SVG `<defs>` IDs are statically prefixed per-tier (`tg-starter-clip`,
 * `tg-creator-grad`, …) so multiple glyphs can co-exist on the same page
 * without `<filter id>` / `<linearGradient id>` collisions across instances.
 *
 * Brand-icon convention: each SVG carries baked-in linear gradients + (for
 * 3 of 4) a drop-shadow filter, so the glyph holds identity on any surface
 * regardless of `currentColor`. Same pattern as `CryptoGlyph` and
 * `ProviderIcon` — not Iconsax outline.
 */

export interface TierGlyphProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  tier: PricingTierId
  /** Pixel size — width AND height. Default `20` matches MeshButton `size='lg'`
   *  icon proportions (44px button → 20px icon). */
  size?: number
}

const MASK_LUMINANCE_STYLE: CSSProperties = { maskType: 'luminance' }

export function TierGlyph({ tier, size = 20, ...rest }: TierGlyphProps) {
  switch (tier) {
    case 'starter':
      return <StarterGlyph size={size} {...rest} />
    case 'creator':
      return <CreatorGlyph size={size} {...rest} />
    case 'creatorPlus':
      return <CreatorPlusGlyph size={size} {...rest} />
    case 'studio':
      return <StudioGlyph size={size} {...rest} />
    // `free` and `enterprise` aren't on the public pricing grid today —
    // when/if they ship, design new glyphs and add cases here.
    default:
      return null
  }
}

// ---- Per-tier glyphs --------------------------------------------------
//
// Each glyph keeps the exact path geometry, viewBox, filter region, and
// gradient stops from the source brand artwork. The only edit from the
// source is `id="X"` → `id="tg-<tier>-X"` so multiple glyphs on the same
// page don't share `<defs>` references.

type Glyph = Omit<TierGlyphProps, 'tier'>

function StarterGlyph({ size = 20, className, ...rest }: Glyph) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={typeof className === 'string' ? `klyp-TierGlyph ${className}` : 'klyp-TierGlyph'}
      data-tier="starter"
      {...rest}
    >
      <g clipPath="url(#tg-starter-clip)">
        <mask
          id="tg-starter-mask"
          width="24"
          height="24"
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={MASK_LUMINANCE_STYLE}
        >
          <path fill="#fff" d="M24 0H0v24h24V0Z" />
        </mask>
        <g filter="url(#tg-starter-filter)" mask="url(#tg-starter-mask)">
          <path
            fill="url(#tg-starter-fill)"
            d="M3 12V8.24c0-4.667 3.519-6.578 7.824-4.244l3.473 1.88 3.474 1.879c4.305 2.334 4.305 6.156 0 8.49l-3.474 1.88-3.473 1.88C6.519 22.337 3 20.426 3 15.758V12Z"
          />
          <path
            stroke="url(#tg-starter-stroke)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M5.536 3.933c1.22-.662 2.988-.615 5.05.503l3.474 1.88 3.472 1.878C19.6 9.315 20.5 10.717 20.5 12c0 1.203-.791 2.51-2.594 3.592l-.374.214-3.472 1.879-3.474 1.88c-2.062 1.117-3.83 1.164-5.05.502C4.328 19.412 3.5 17.972 3.5 15.76V8.24c0-2.212.828-3.651 2.036-4.307Z"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="tg-starter-fill"
          x1="12"
          x2="12"
          y1="3"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#999" />
        </linearGradient>
        <linearGradient
          id="tg-starter-stroke"
          x1="12"
          x2="12"
          y1="3"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" stopOpacity=".3" />
          <stop offset="1" stopColor="#fff" stopOpacity=".1" />
        </linearGradient>
        <clipPath id="tg-starter-clip">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
        <filter
          id="tg-starter-filter"
          width="34"
          height="34"
          x="-5"
          y="-1"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend in2="BackgroundImageFix" result="tg-starter-dropShadow" />
          <feBlend in="SourceGraphic" in2="tg-starter-dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}

function CreatorGlyph({ size = 20, className, ...rest }: Glyph) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={typeof className === 'string' ? `klyp-TierGlyph ${className}` : 'klyp-TierGlyph'}
      data-tier="creator"
      {...rest}
    >
      <g clipPath="url(#tg-creator-clip)">
        <mask
          id="tg-creator-mask"
          width="24"
          height="24"
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={MASK_LUMINANCE_STYLE}
        >
          <path fill="#fff" d="M24 0H0v24h24V0Z" />
        </mask>
        <g filter="url(#tg-creator-filter)" mask="url(#tg-creator-mask)">
          <path
            fill="url(#tg-creator-fill)"
            d="m13.568 4.31 1.583 3.2c.216.436.792.872 1.278.945l2.86.472c1.836.31 2.268 1.655.936 2.982l-2.23 2.255c-.379.382-.576 1.11-.469 1.636l.63 2.782c.504 2.2-.648 3.055-2.591 1.91l-2.68-1.6c-.487-.292-1.278-.292-1.782 0l-2.681 1.6c-1.925 1.145-3.095.29-2.591-1.91l.63-2.782c.126-.527-.09-1.254-.468-1.636l-2.231-2.255c-1.314-1.327-.882-2.672.935-2.982l2.861-.472c.486-.073 1.044-.51 1.26-.946l1.583-3.2c.918-1.745 2.321-1.745 3.167 0Z"
          />
          <path
            stroke="url(#tg-creator-stroke)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M12.012 3.5c.288 0 .718.227 1.106 1.027l.002.004 1.583 3.2c.152.307.41.583.687.789.273.203.611.374.957.427v.001l2.86.472v0c.829.14 1.172.483 1.262.768.09.285.006.767-.597 1.368l-.002.002-2.231 2.255c-.264.266-.443.626-.542.979-.1.354-.134.75-.06 1.108l.002.011.63 2.781v.002c.242 1.06.023 1.54-.188 1.696-.209.154-.727.222-1.663-.33l-2.677-1.598c-.339-.203-.753-.29-1.141-.29-.389 0-.804.087-1.148.286l-.005.004-2.681 1.6c-.924.549-1.442.482-1.654.327-.214-.157-.435-.638-.194-1.695v-.002l.63-2.775c.087-.368.051-.773-.052-1.128a2.322 2.322 0 0 0-.547-.976l-2.232-2.255c-.593-.6-.676-1.082-.585-1.37.09-.287.43-.629 1.246-.768h.001l2.86-.472h0c.347-.054.683-.226.953-.431.273-.208.524-.483.674-.787l1.584-3.199c.422-.798.867-1.031 1.162-1.031Z"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="tg-creator-fill"
          x1="12"
          x2="12"
          y1="3"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#BF7AF0" />
          <stop offset="1" stopColor="#5F2E85" />
        </linearGradient>
        <linearGradient
          id="tg-creator-stroke"
          x1="12"
          x2="12"
          y1="3"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" stopOpacity=".3" />
          <stop offset="1" stopColor="#fff" stopOpacity=".1" />
        </linearGradient>
        <clipPath id="tg-creator-clip">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
        <filter
          id="tg-creator-filter"
          width="34"
          height="34"
          x="-5"
          y="-1"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend in2="BackgroundImageFix" result="tg-creator-dropShadow" />
          <feBlend in="SourceGraphic" in2="tg-creator-dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}

function CreatorPlusGlyph({ size = 20, className, ...rest }: Glyph) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={typeof className === 'string' ? `klyp-TierGlyph ${className}` : 'klyp-TierGlyph'}
      data-tier="creatorPlus"
      {...rest}
    >
      <g clipPath="url(#tg-creatorPlus-clip)">
        <mask
          id="tg-creatorPlus-mask"
          width="24"
          height="24"
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={MASK_LUMINANCE_STYLE}
        >
          <path fill="#fff" d="M24 0H0v24h24V0Z" />
        </mask>
        <g filter="url(#tg-creatorPlus-filter)" mask="url(#tg-creatorPlus-mask)">
          <path
            fill="url(#tg-creatorPlus-fill)"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2.999c1.203 0 2.19.952 2.19 2.113 0 .804-.463 1.51-1.162 1.857l.14.38c.727 1.899 1.845 3.748 3.232 3.748 1.48 0 2.405-.923 2.899-1.627a1.998 1.998 0 0 1-.678-1.519c0-1.16.987-2.113 2.19-2.113C22.013 5.838 23 6.79 23 7.95c0 1.042-.782 1.906-1.81 2.084.042 1.965-.072 5.438-1.13 7.592v.684c0 1.479-1.244 2.689-2.776 2.689H6.716c-1.532 0-2.786-1.21-2.786-2.689v-.705c-.918-1.884-1.127-4.763-1.137-6.77l.006-.8C1.77 9.855 1 8.992 1 7.95c0-1.16.977-2.113 2.19-2.113 1.202 0 2.19.952 2.19 2.113 0 .596-.247 1.141-.679 1.528l.204.272c.532.647 1.443 1.346 2.685 1.346 1.33 0 2.48-1.788 3.236-3.737l.146-.391A2.071 2.071 0 0 1 9.81 5.112C9.81 3.952 10.787 3 12 3Z"
          />
          <path
            stroke="url(#tg-creatorPlus-stroke)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            strokeWidth=".75"
            d="M4.305 17.606a.375.375 0 0 0-.038-.164c-.876-1.799-1.088-4.598-1.099-6.603l.006-.8a.375.375 0 0 0-.31-.373c-.86-.15-1.489-.867-1.489-1.715l.009-.175c.085-.806.753-1.47 1.617-1.554l.188-.01c1.009 0 1.816.798 1.816 1.74 0 .488-.202.932-.554 1.248a.375.375 0 0 0-.05.505l.204.272.01.012c.575.699 1.583 1.483 2.975 1.483.839 0 1.555-.56 2.127-1.28.58-.73 1.073-1.703 1.459-2.696l.002-.005.145-.391a.375.375 0 0 0-.184-.467 1.696 1.696 0 0 1-.954-1.52l.01-.176c.09-.864.851-1.563 1.805-1.563 1.008 0 1.814.797 1.815 1.738 0 .656-.377 1.234-.954 1.52a.375.375 0 0 0-.184.466l.14.38v.004c.37.967.847 1.942 1.423 2.683.568.73 1.291 1.307 2.16 1.307 1.657 0 2.681-1.038 3.206-1.787a.375.375 0 0 0-.06-.498 1.624 1.624 0 0 1-.55-1.236l.01-.175c.092-.863.86-1.563 1.805-1.563 1.008 0 1.814.797 1.814 1.738 0 .846-.637 1.565-1.499 1.715a.375.375 0 0 0-.31.377c.02.972.002 2.315-.151 3.676-.154 1.367-.441 2.724-.942 3.743a.375.375 0 0 0-.038.165v.684l-.013.234c-.122 1.154-1.136 2.08-2.388 2.08H6.716c-1.337 0-2.411-1.055-2.411-2.314v-.705Z"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="tg-creatorPlus-fill"
          x1="12"
          x2="12"
          y1="2.999"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FDD59A" />
          <stop offset="1" stopColor="#98805C" />
        </linearGradient>
        <linearGradient
          id="tg-creatorPlus-stroke"
          x1="12"
          x2="12"
          y1="2.999"
          y2="21"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" stopOpacity=".3" />
          <stop offset="1" stopColor="#fff" stopOpacity=".1" />
        </linearGradient>
        <clipPath id="tg-creatorPlus-clip">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
        <filter
          id="tg-creatorPlus-filter"
          width="38"
          height="34.001"
          x="-7"
          y="-1.001"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="4" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend in2="BackgroundImageFix" result="tg-creatorPlus-dropShadow" />
          <feBlend in="SourceGraphic" in2="tg-creatorPlus-dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}

function StudioGlyph({ size = 20, className, ...rest }: Glyph) {
  return (
    <svg
      width={size}
      height={size}
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={typeof className === 'string' ? `klyp-TierGlyph ${className}` : 'klyp-TierGlyph'}
      data-tier="studio"
      {...rest}
    >
      <g clipPath="url(#tg-studio-clip)">
        <mask
          id="tg-studio-mask"
          width="24"
          height="24"
          x="0"
          y="0"
          maskUnits="userSpaceOnUse"
          style={MASK_LUMINANCE_STYLE}
        >
          <path fill="#fff" d="M24 0H0v24h24V0Z" />
        </mask>
        <g mask="url(#tg-studio-mask)">
          <path
            fill="url(#tg-studio-fill)"
            stroke="url(#tg-studio-stroke)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M6.5 3.75h6c1.596 0 2.598.3 3.222.868.616.562.965 1.481 1.018 2.98a.5.5 0 0 0 .788.39l1.47-1.04c.517-.362.933-.47 1.238-.483.308-.013.536.07.677.145l.009.005c.143.073.345.213.512.473.165.257.316.66.316 1.292v7.24c0 .631-.15 1.035-.316 1.292-.167.26-.37.4-.512.473l-.005.003a1.32 1.32 0 0 1-.617.152c-.275 0-.647-.077-1.1-.355l-.201-.133-1.47-1.04a.5.5 0 0 0-.782.322l-.007.068c-.053 1.499-.402 2.418-1.018 2.98-.624.568-1.626.868-3.222.868h-6c-1.622 0-2.661-.562-3.304-1.333-.655-.787-.946-1.85-.946-2.917V8c0-1.664.327-2.685.946-3.304.62-.619 1.64-.946 3.304-.946ZM11 7.12A2.384 2.384 0 0 0 8.62 9.5 2.384 2.384 0 0 0 11 11.88a2.384 2.384 0 0 0 2.38-2.38A2.384 2.384 0 0 0 11 7.12Z"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="tg-studio-fill"
          x1="12"
          x2="12"
          y1="3.25"
          y2="20.75"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#52A8FF" />
          <stop offset="1" stopColor="#0A4380" />
        </linearGradient>
        <linearGradient
          id="tg-studio-stroke"
          x1="12"
          x2="12"
          y1="3.25"
          y2="20.75"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#fff" stopOpacity=".3" />
          <stop offset="1" stopColor="#fff" stopOpacity=".1" />
        </linearGradient>
        <clipPath id="tg-studio-clip">
          <path fill="#fff" d="M0 0h24v24H0z" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default TierGlyph

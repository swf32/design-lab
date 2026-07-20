import './IconLink.scss'

import type { SVGProps } from 'react'

// =====================================================================
// IconLink — brand glyph (design lead 2026-05-17)
// =====================================================================
//
// Two-path chain link glyph. Lifted verbatim from
// features/referrals/referral-hero-a.tsx (LinkIcon) into the canonical
// brand library. Source: SVG path geometry is preserved exactly —
// do not replace with Iconsax outline (design lead explicit ask).

export type IconLinkSize = 'sm' | 'md' | 'lg'

export interface IconLinkProps extends SVGProps<SVGSVGElement> {
  size?: IconLinkSize
}

export function IconLink({ size = 'md', className, ...svgProps }: IconLinkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-size={size}
      className={typeof className === 'string' ? `klyp-IconLink ${className}` : 'klyp-IconLink'}
      {...svgProps}
    >
      <path
        d="M10.5 13.5a4 4 0 0 0 5.66 0l2.5-2.5a4 4 0 0 0-5.66-5.66l-1.2 1.2"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 10.5a4 4 0 0 0-5.66 0l-2.5 2.5a4 4 0 0 0 5.66 5.66l1.2-1.2"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default IconLink

import './IconEmail.scss'

import type { SVGProps } from 'react'

// =====================================================================
// IconEmail — Klyp brand-glyph icon (outline envelope, Iconsax stroke weight).
// Source: hand-crafted by design lead (2026-05-17), preserved verbatim from
// apps/web/src/features/referrals/referral-hero-a.tsx (EmailIcon).
// =====================================================================

export type IconEmailSize = 'sm' | 'md' | 'lg'

export interface IconEmailProps extends SVGProps<SVGSVGElement> {
  size?: IconEmailSize
}

export function IconEmail({ size = 'md', className, ...svgProps }: IconEmailProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-size={size}
      className={typeof className === 'string' ? `klyp-IconEmail ${className}` : 'klyp-IconEmail'}
      {...svgProps}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth={1.5} />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default IconEmail

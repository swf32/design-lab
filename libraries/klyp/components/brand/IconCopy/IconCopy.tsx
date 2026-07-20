import './IconCopy.scss'

import type { SVGProps } from 'react'

// =====================================================================
// IconCopy — brand glyph (design lead 2026-05-17)
// =====================================================================
//
// Two-rectangle Iconsax-style stack. Lifted verbatim from
// features/referrals/referral-hero-a.tsx (CopyIcon) into the canonical
// brand library. Source: SVG path geometry is preserved exactly —
// do not replace with Iconsax outline (design lead explicit ask).
//
// Pattern reference: ../BrandMark/BrandMark.tsx

export type IconCopySize = 'sm' | 'md' | 'lg'

export interface IconCopyProps extends SVGProps<SVGSVGElement> {
  size?: IconCopySize
}

export function IconCopy({ size = 'md', className, ...svgProps }: IconCopyProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-size={size}
      className={typeof className === 'string' ? `klyp-IconCopy ${className}` : 'klyp-IconCopy'}
      {...svgProps}
    >
      <path
        d="M16 12.9V17.1C16 20.6 14.6 22 11.1 22H6.9C3.4 22 2 20.6 2 17.1V12.9C2 9.4 3.4 8 6.9 8H11.1C14.6 8 16 9.4 16 12.9Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 6.9V11.1C22 14.6 20.6 16 17.1 16H16V12.9C16 9.4 14.6 8 11.1 8H8V6.9C8 3.4 9.4 2 12.9 2H17.1C20.6 2 22 3.4 22 6.9Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default IconCopy

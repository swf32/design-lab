import './Spinner.scss'

import type { SVGProps } from 'react'

// =====================================================================
// Spinner — Klyp canonical primitive (Phase 2 of React Aria migration)
// =====================================================================
//
// Architecture: see ../../../../MIGRATION-REACT-ARIA-2026-04-30.md §5/§6/§16
//
// Pure SVG element — no React Aria component needed.
// Sizing via `data-size` attribute, color inherits via currentColor.

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps extends Omit<SVGProps<SVGSVGElement>, 'aria-label'> {
  /** Visual size — sm (12px), md (16px, default), lg (24px). */
  size?: SpinnerSize
  /** Override accessible label. Defaults to "Loading". */
  'aria-label'?: string
}

export function Spinner({
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Loading',
  ...props
}: SpinnerProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={typeof className === 'string' ? `klyp-Spinner ${className}` : 'klyp-Spinner'}
      data-size={size}
      aria-label={ariaLabel}
      aria-live="polite"
      role="status"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

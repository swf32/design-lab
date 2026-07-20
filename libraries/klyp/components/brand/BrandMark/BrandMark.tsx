import './BrandMark.scss'

import type { ComponentProps } from 'react'

// =====================================================================
// BrandMark — Klyp brand atom (Phase 3 of Tailwind → SCSS migration)
// =====================================================================
//
// Klyp brand expression. Three variants:
// - symbol: just the glyph
// - wordmark: just the text
// - lockup: glyph + text (default for headers)
//
// Pattern reference: ../MetaLabel/MetaLabel.tsx, ../Chip/Chip.tsx

export type BrandMarkVariant = 'symbol' | 'wordmark' | 'lockup'
export type BrandMarkSize = 'sm' | 'md' | 'lg'

export type BrandMarkProps = ComponentProps<'span'> & {
  variant?: BrandMarkVariant
  size?: BrandMarkSize
  /** Path to the symbol PNG. Override only if app moves the asset. */
  symbolSrc?: string
  /** Wordmark text. Default "Klyp". */
  wordmark?: string
}

export function BrandMark({
  variant = 'lockup',
  size = 'md',
  symbolSrc = '/logo-crown.png',
  wordmark = 'Klyp',
  className,
  ...props
}: BrandMarkProps) {
  return (
    <span
      data-slot="brand-mark"
      data-variant={variant}
      data-size={size}
      className={typeof className === 'string' ? `klyp-BrandMark ${className}` : 'klyp-BrandMark'}
      {...props}
    >
      {variant !== 'wordmark' && (
        <img className="klyp-BrandMark__symbol" src={symbolSrc} alt="" aria-hidden />
      )}
      {variant !== 'symbol' && <span className="klyp-BrandMark__wordmark">{wordmark}</span>}
    </span>
  )
}

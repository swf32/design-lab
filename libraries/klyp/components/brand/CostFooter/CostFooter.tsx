import './CostFooter.scss'

import type { ComponentProps } from 'react'

/**
 * Tiny "~{duration}s · {cost}" line that lives under every
 * Generate transaction. Centered by default — sits below the Generate
 * button. Pass `align="left"` for inline use under compiled-prompt previews.
 *
 * Phase 3 SCSS migration: Tailwind classes removed, BEM `klyp-CostFooter`
 * with `data-align` attribute. Numbers use tabular-nums (font-variant-numeric).
 */
type CostFooterProps = ComponentProps<'p'> & {
  /** Estimated duration in seconds. */
  durationSec: number
  /** Pre-formatted cost string ("$0.08") — caller controls currency / precision. */
  cost: string
  align?: 'left' | 'center' | 'right'
  /** Hide the leading "~". Use when the value is exact, not estimated. */
  exact?: boolean
}

export function CostFooter({
  durationSec,
  cost,
  align = 'center',
  exact,
  className,
  ...props
}: CostFooterProps) {
  return (
    <p
      data-slot="cost-footer"
      data-align={align}
      className={typeof className === 'string' ? `klyp-CostFooter ${className}` : 'klyp-CostFooter'}
      {...props}
    >
      {exact ? '' : '~ '}
      {durationSec}s · {cost}
    </p>
  )
}

import type { ComponentProps, ReactNode } from 'react'
import './EmptyState.scss'

/** Density: maps to the existing `compact` boolean for back-compat.
 *  comfortable = default (32px padding, 18px title)
 *  compact     = small panels / inline lists (16px padding, 14px title)
 *  spacious    = hero-style empty pages (48px padding, 22px title)
 */
export type EmptyStateSize = 'compact' | 'comfortable' | 'spacious'

/** Tone — neutral by default. Info / warning shift the icon-frame tint
 *  for filtering hints, quota walls, recoverable errors. */
export type EmptyStateTone = 'neutral' | 'info' | 'warning'

/** Horizontal alignment. `center` is default. `start` aligns to the
 *  left for inline list empties where centering looks awkward. */
export type EmptyStateAlign = 'center' | 'start'

type EmptyStateProps = ComponentProps<'div'> & {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  /** Density modifier — legacy boolean prop, kept for back-compat.
   *  When set, takes precedence over `size`. Prefer `size="compact"`. */
  compact?: boolean
  /** Density modifier. Defaults to `comfortable`. */
  size?: EmptyStateSize
  /** Tone of the icon frame. Defaults to `neutral`. */
  tone?: EmptyStateTone
  /** Content alignment. Defaults to `center`. */
  align?: EmptyStateAlign
}

/**
 * Empty-state pattern for Library tabs, History, search-with-no-results.
 * Centered content stack, optional decorative icon, primary CTA via `actions`.
 */
export function EmptyState({
  icon,
  title,
  description,
  actions,
  compact,
  size,
  tone = 'neutral',
  align = 'center',
  className,
  ...props
}: EmptyStateProps) {
  // Back-compat: `compact` boolean wins when set, otherwise use `size`.
  const resolvedSize: EmptyStateSize = compact ? 'compact' : (size ?? 'comfortable')

  // Legacy modifier class preserved so existing CSS selectors continue
  // to apply. Adds a third for the new `spacious` step.
  const sizeModifier =
    resolvedSize === 'compact'
      ? 'klyp-EmptyState--compact'
      : resolvedSize === 'spacious'
        ? 'klyp-EmptyState--spacious'
        : 'klyp-EmptyState--default'

  const rootClass = ['klyp-EmptyState', sizeModifier, className].filter(Boolean).join(' ')

  return (
    <div
      data-slot="empty-state"
      data-size={resolvedSize}
      data-tone={tone}
      data-align={align}
      className={rootClass}
      {...props}
    >
      {icon && (
        <div aria-hidden className="klyp-EmptyState__icon">
          {icon}
        </div>
      )}
      <div className="klyp-EmptyState__content">
        <h3 className="klyp-EmptyState__title">{title}</h3>
        {description && <p className="klyp-EmptyState__description">{description}</p>}
      </div>
      {actions && <div className="klyp-EmptyState__actions">{actions}</div>}
    </div>
  )
}

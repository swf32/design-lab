import './MetaLabel.scss'

import type { ComponentProps, ReactNode } from 'react'

// =====================================================================
// MetaLabel — Klyp brand atom (canonical eyebrow)
// =====================================================================
//
// Tiny eyebrow label used in routes for genre, archetype, mood, status.
// Geist sans · sentence case · 12–13px medium.
// NEVER font-mono. NEVER `uppercase + tracking-widest`.
// See .claude/rules/styles.md (Typography).

export type MetaLabelSize = 'xs' | 'sm'
export type MetaLabelTone = 'subtle' | 'muted' | 'accent'

export type MetaLabelProps = ComponentProps<'span'> & {
  icon?: ReactNode
  size?: MetaLabelSize
  tone?: MetaLabelTone
}

export function MetaLabel({
  icon,
  size = 'xs',
  tone = 'subtle',
  className,
  children,
  ...props
}: MetaLabelProps) {
  return (
    <span
      data-slot="meta-label"
      data-size={size}
      data-tone={tone}
      className={typeof className === 'string' ? `klyp-MetaLabel ${className}` : 'klyp-MetaLabel'}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}

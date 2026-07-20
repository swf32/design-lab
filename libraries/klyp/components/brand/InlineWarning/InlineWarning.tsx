import './InlineWarning.scss'

import { InfoCircleOutline } from '@klyp/icons/outline'
import type { ComponentType, ReactNode, SVGProps } from 'react'

// =====================================================================
// InlineWarning — Klyp brand atom
// =====================================================================
//
// Inline, borderless caution / info / danger callout. Icon + optional
// bold lead + body text. Wise / Mercury style — NO border, NO background,
// just warm-warning tinted icon and tonal text.
//
// Used by the withdraw Review screen ("Irreversible." message) and any
// future spot that needs an inline non-boxed warning.

export type InlineWarningTone = 'info' | 'warning' | 'danger'
export type InlineWarningSize = 'sm' | 'md'

export interface InlineWarningProps {
  /** Visual tone — drives icon colour and default icon. Defaults to 'warning'. */
  tone?: InlineWarningTone
  /** Override icon. Defaults to InfoCircleOutline (only outline icon currently in @klyp/icons). */
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  /** Bold inline lead (e.g. "Irreversible."). Renders before children with a small gap. */
  lead?: ReactNode
  /** Body text. */
  children: ReactNode
  /** Density. Defaults to 'md'. */
  size?: InlineWarningSize
}

export function InlineWarning({
  tone = 'warning',
  icon: Icon = InfoCircleOutline,
  lead,
  children,
  size = 'md',
}: InlineWarningProps) {
  return (
    <p
      className="klyp-InlineWarning"
      data-tone={tone}
      data-size={size}
      /* note, not alert/status: this callout renders statically with the
         screen (withdraw Review). Live-region roles only announce on
         insertion/change — on initial load most AT stay silent, so they
         add nothing here; `note` gives the correct static semantics. If a
         dynamically-mounted error use-case appears, add an opt-in
         `announce` prop rather than changing this default. */
      role="note"
    >
      <Icon className="klyp-InlineWarning__icon" aria-hidden focusable={false} />
      <span className="klyp-InlineWarning__body">
        {lead != null && <strong className="klyp-InlineWarning__lead">{lead}</strong>}
        {children}
      </span>
    </p>
  )
}

export default InlineWarning

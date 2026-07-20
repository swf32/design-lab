import type { ComponentProps, ReactNode } from 'react'
import './PreviewThumb.scss'

// =====================================================================
// PreviewThumb — Klyp brand atom (Phase 3 — Tailwind → SCSS migration)
// =====================================================================
//
// Generation preview tile — wraps a frame with aspect-ratio + overlay caption.
// Used in the right-side Generate panel of every editor (Visual / Script / Episode).
//
// Children = the real `<img>` / `<video>` (or nothing for empty / loading states).
// The component owns the surface, ratio, caption slot, and state styling.

export type PreviewThumbRatio = '9:16' | '16:9' | '1:1' | '4:5'
export type PreviewThumbState = 'empty' | 'loading' | 'ready'

export interface PreviewThumbProps extends ComponentProps<'div'> {
  ratio?: PreviewThumbRatio
  state?: PreviewThumbState
  /** Bottom-left mono caption. Common pattern: "Last render · 12m ago". */
  caption?: ReactNode
  /** Top-left badge slot — e.g. resolution / model name. */
  badge?: ReactNode
}

export function PreviewThumb({
  ratio = '9:16',
  state = 'empty',
  caption,
  badge,
  className,
  children,
  ...props
}: PreviewThumbProps) {
  const cls = typeof className === 'string' ? `klyp-PreviewThumb ${className}` : 'klyp-PreviewThumb'

  return (
    <div
      data-slot="preview-thumb"
      data-ratio={ratio}
      data-state={state}
      aria-busy={state === 'loading' || undefined}
      className={cls}
      {...props}
    >
      {state === 'empty' && (
        // Soft warm-gold radial — hints brand without filling the void with content.
        // Uses color-mix against the gold-300 token so a Warm Gold retune flows through.
        <div aria-hidden className="klyp-PreviewThumb__glow" />
      )}
      {children}
      {badge && <div className="klyp-PreviewThumb__badge">{badge}</div>}
      {caption && <div className="klyp-PreviewThumb__caption">{caption}</div>}
    </div>
  )
}

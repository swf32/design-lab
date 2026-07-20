import './TopNav.scss'

import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from 'react'

// =====================================================================
// TopNav — Klyp brand atom (Phase 3 of Tailwind → SCSS migration)
// =====================================================================
//
// Slot-based top navigation skeleton. Owns layout (sticky, height 56px,
// chrome — solid glass by default OR transparent → glass-on-scroll).
//
// Two consumers fill the slots with brand-specific content:
//   - `AppHeader` (this package) — canonical global header used by all
//     app + marketing surfaces. Defaults to `transparent={true}`.
//   - Legacy `apps/web/src/components/layout/AppHeader` — being phased
//     out by Header Migration 2026-05-28 (see
//     `apps/web/src/_handoff/HEADER-MIGRATION-2026-05-28/`).
//
// Sticky transparency works via a 1px sentinel rendered in normal flow
// directly above the sticky header. An IntersectionObserver toggles
// `data-stuck="true"` once the sentinel scrolls out of the viewport,
// which the SCSS uses to fade in glass + blur + bottom hairline. One
// observer per mount, no scroll listeners — cheap.

type TopNavProps = ComponentProps<'header'> & {
  leading?: ReactNode
  center?: ReactNode
  trailing?: ReactNode
  /** Sticky to viewport top. Default true. */
  sticky?: boolean
  /**
   * Transparent at top of page → glass-stuck on scroll. Default false —
   * preserves legacy "always glass" for existing AppHeader consumer. The
   * new `<AppHeader>` (`@klyp/brand/AppHeader`) opts in.
   */
  transparent?: boolean
  /** ARIA label for the center `<nav>` landmark. Default `Primary`. */
  navAriaLabel?: string
}

export function TopNav({
  leading,
  center,
  trailing,
  sticky = true,
  transparent = false,
  navAriaLabel = 'Primary',
  className,
  ...props
}: TopNavProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [stuck, setStuck] = useState(false)

  // Observe sentinel only when both transparent AND sticky — sentinel is
  // the mechanism that tells us "we've scrolled past the top, fade in
  // glass". For non-sticky or non-transparent headers we never set
  // stuck=true (and the SCSS doesn't read the attr in those cases).
  useEffect(() => {
    if (!transparent || !sticky) return
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setStuck(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [transparent, sticky])

  return (
    <>
      {transparent && sticky ? (
        <div ref={sentinelRef} className="klyp-TopNav__sentinel" aria-hidden="true" />
      ) : null}
      <header
        data-slot="top-nav"
        data-sticky={sticky ? 'true' : 'false'}
        data-transparent={transparent ? 'true' : undefined}
        data-stuck={stuck ? 'true' : undefined}
        className={typeof className === 'string' ? `klyp-TopNav ${className}` : 'klyp-TopNav'}
        {...props}
      >
        <div className="klyp-TopNav__inner">
          {leading && <div className="klyp-TopNav__leading">{leading}</div>}
          {center && (
            <nav className="klyp-TopNav__center" aria-label={navAriaLabel}>
              {center}
            </nav>
          )}
          {trailing && <div className="klyp-TopNav__trailing">{trailing}</div>}
        </div>
      </header>
    </>
  )
}

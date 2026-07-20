/**
 * `ComingSoonPage` — placeholder for routes that exist in nav but ship later.
 *
 * Editorial composition (per `.impeccable.md`):
 *   - Left-aligned title, asymmetric layout, no centered hero, no decorative
 *     icon-above-heading (frontend-design DON'T list).
 *   - Mono uppercase metadata as a leading rule, fluid display type via
 *     `clamp()`, body prose set tight at 60ch.
 *   - Single accent (Warm Gold) used on the back link only — keeps under the
 *     2-per-screen single-accent rule.
 *   - Adaptive: container queries (`@container`) — works at 280 / 600 / 1200 px.
 *
 * Used by: `/history`, `/analytics`, `/earnings`, `/referrals`. The three older
 * stubs (`series`, `sandbox`, `settings`) keep their bespoke layouts because
 * they each carry route-specific affordances (live data, lists) that this
 * generic shell would flatten.
 *
 * Source of stub copy: W3 brief 2026-04-27.
 *
 * Routing is data-agnostic per `packages/brand/AGENTS.md`: callers inject the
 * router `<Link>` (e.g. TanStack `<Link>`) via `linkComponent`. Without it the
 * back link renders as a native `<a href>` (full document navigation).
 */

import type { ComponentType, ReactNode, SVGProps } from 'react'
import './ComingSoonPage.scss'

/**
 * Minimal contract for the back-link component. Mirrors `AppTopbar`'s
 * `LinkComponent` shape so consumers can reuse the same router-aware wrapper.
 */
export type ComingSoonLinkComponent = ComponentType<{
  to: string
  children: ReactNode
  className?: string
}>

export type ComingSoonPageProps = {
  /** Bold display title — e.g. "History", "Analytics". */
  title: string
  /** One-sentence rationale for what the route eventually surfaces. */
  description?: string
  /**
   * Optional iconography. Generic SVG component type (per `frontend.md`
   * Icons API rule — keep public API independent of icon library). When set,
   * renders as a small mono-tone glyph next to the eyebrow rule, NOT as a
   * large hero icon above the heading.
   */
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  /** Eyebrow text above the title. Defaults to "Coming soon". */
  eyebrow?: string
  /** Optional kicker (e.g. "MVP · Q3 2026"). Sits under the description. */
  kicker?: string
  /** Back-link label. Default "Back to home". */
  backLabel?: string
  /** Back-link target. Default "/". */
  backTo?: '/' | '/series' | '/library'
  /**
   * Optional client-side router link. When provided, the back link renders
   * via this component (e.g. TanStack Router's `<Link>`); otherwise a native
   * `<a href={backTo}>` is used. Brand layer stays router-agnostic.
   */
  linkComponent?: ComingSoonLinkComponent
}

export function ComingSoonPage({
  title,
  description,
  icon: Icon,
  eyebrow = 'Coming soon',
  kicker,
  backLabel = 'Back to home',
  backTo = '/',
  linkComponent: LinkComp,
}: ComingSoonPageProps) {
  return (
    <section data-slot="coming-soon-page" className="klyp-ComingSoonPage">
      <div className="klyp-ComingSoonPage__inner">
        {/* Eyebrow rule — mono uppercase metadata, optional inline glyph */}
        <div className="klyp-ComingSoonPage__eyebrow">
          {Icon ? (
            <span aria-hidden className="klyp-ComingSoonPage__icon">
              <Icon />
            </span>
          ) : (
            <span aria-hidden className="klyp-ComingSoonPage__rule" />
          )}
          <span className="klyp-ComingSoonPage__eyebrowLabel">{eyebrow}</span>
        </div>

        {/* Display title — fluid clamp, no italic, no 700 weight */}
        <h1 className="klyp-ComingSoonPage__title">{title}</h1>

        {description && <p className="klyp-ComingSoonPage__description">{description}</p>}

        {kicker && <p className="klyp-ComingSoonPage__kicker">{kicker}</p>}

        {/* Back link — single accent (Warm Gold), text-only, with arrow */}
        <div className="klyp-ComingSoonPage__back">
          {LinkComp ? (
            <LinkComp to={backTo} className="klyp-ComingSoonPage__backLink">
              <span aria-hidden>←</span>
              <span>{backLabel}</span>
            </LinkComp>
          ) : (
            <a href={backTo} className="klyp-ComingSoonPage__backLink">
              <span aria-hidden>←</span>
              <span>{backLabel}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

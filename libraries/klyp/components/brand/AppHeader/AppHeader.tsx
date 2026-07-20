import './AppHeader.scss'

import type { ComponentType, ReactNode } from 'react'
import { BrandMark } from '../BrandMark/BrandMark'
import { TopNav } from '../TopNav/TopNav'

// =====================================================================
// AppHeader — Klyp global header (Phase 1 of Header Migration 2026-05-28)
// =====================================================================
//
// **Canonical** top header for ALL surfaces — app, marketing, canvas.
// Replaces both the legacy `apps/web/src/components/layout/AppHeader`
// (auth surfaces) and `packages/brand/src/MarketingHeader` (public
// pricing / landing). One component, two configurations: caller decides
// what goes in the right cluster via three optional slots
// (`notificationsSlot`, `upgradeSlot`, `authSlot`).
//
// Layout (fixed across surfaces — never reflows between routes):
//
//   [logo]      [Create  Series  Pricing]     [🔔 Upgrade  Avatar▾]
//   leading              center                       trailing
//
// Chrome:
//   - Transparent at top of page → glass + blur + 1px hairline on scroll
//     (via `<TopNav transparent>` + sentinel + IntersectionObserver).
//   - Sticky to viewport top.
//   - 56px height owned by TopNav.
//
// Router-agnostic via `linkComponent` prop (defaults to plain `<a>`).
// Brand-agnostic via `wordmark` / `symbolSrc` props (Klyp gold or Unreals
// blue lockup — both opt in at the call site, not baked in).
//
// Reading order for cold-start: this file → AppHeader.scss → TopNav.tsx
// (chrome owner) → MarketingHeader.tsx (deprecated, kept for reference).

export interface AppHeaderLink {
  /** Display label. Brand-aware copy injected by caller — EN for Klyp, RU for Unreals. */
  label: string
  /** Route path. Absolute (`/chat`, `/series`, `/pricing`). */
  to: string
  /**
   * Active-match predicate. Default = exact string match on `currentPath`.
   * Pass a prefix matcher for surfaces that own children
   * (e.g. `(p) => p.startsWith('/series')` so `/series/$slug` keeps Series active).
   */
  match?: (pathname: string) => boolean
  /**
   * Optional trailing badge (e.g. "Soon" pill for upcoming sections).
   * Renders inside the link, after the label, with a muted treatment.
   */
  badge?: ReactNode
  /**
   * Dim the link to 30% opacity + block pointer events. Used for "coming
   * soon" sections that still occupy a nav slot to signal upcoming work
   * without being clickable. Pairs with `badge` typically.
   */
  disabled?: boolean
}

/**
 * Render-prop for nav links + brand link. TanStack `<Link>` shape in the
 * real app, plain `<a>` in storybook / catalog. Keeps the brand package
 * router-agnostic — no `@tanstack/react-router` import.
 */
export type AppHeaderLinkComponent = ComponentType<{
  to: string
  className?: string
  children: ReactNode
  'aria-current'?: 'page' | undefined
  'aria-label'?: string
  'aria-disabled'?: 'true' | undefined
  'data-active'?: 'true' | undefined
  'data-disabled'?: 'true' | undefined
  tabIndex?: number
}>

export interface AppHeaderProps {
  // ── Navigation ────────────────────────────────────────────────────
  /** Center-slot nav links. Empty array → no center slot rendered. */
  links: readonly AppHeaderLink[]
  /** Pathname of the current route. Drives active state. */
  currentPath: string
  /**
   * Render-prop for link elements. Defaults to plain `<a href={to}>` so the
   * component renders in any environment (storybook, catalog, marketing
   * iframe) without a router.
   */
  linkComponent?: AppHeaderLinkComponent

  // ── Brand identity ────────────────────────────────────────────────
  /** Brand-mark link target. Default `/`. */
  brandLinkTo?: string
  /** ARIA label for the brand-mark link. Default `Klyp — home`. */
  homeAriaLabel?: string
  /** Brand-mark wordmark text. Default `Klyp`. Unreals → `Unreals`. */
  wordmark?: string
  /** Brand-mark symbol src. Default Klyp crown PNG. Unreals → `/brand-unreals/logo.svg`. */
  symbolSrc?: string
  /** ARIA label for the center `<nav>` landmark. Default `Primary`. Unreals → `Основная навигация`. */
  navAriaLabel?: string

  // ── Leading slot extension ───────────────────────────────────────
  /**
   * Mobile drawer trigger rendered BEFORE the brand inside the leading
   * slot. Default visibility controlled via container query (visible
   * only <768px). Caller passes `<HamburgerButton>` — see Header
   * Migration 2026-05-28 Phase 5a.
   */
  hamburgerSlot?: ReactNode

  // ── Right cluster (3 optional slots, fixed order) ─────────────────
  /** Notifications bell slot (reserved — empty OK on MVP). */
  notificationsSlot?: ReactNode
  /** Upgrade CTA slot. Caller passes a `<MeshButton>` (brand-tone aware). Null for unauth. */
  upgradeSlot?: ReactNode
  /**
   * Identity slot. Authenticated → caller passes `<ProfileMenu triggerVariant="avatar" />`.
   * Unauth → caller passes a Sign-in pill / link. Always rendered when present.
   */
  authSlot?: ReactNode

  // ── Chrome behavior ───────────────────────────────────────────────
  /**
   * Transparent default + glass-on-scroll-stuck. Default `true`. Set
   * `false` if the page below has no above-the-fold hero / mesh that
   * needs to bleed through the header at top of scroll.
   */
  transparent?: boolean

  /** Optional className appended to the underlying `<TopNav>`. */
  className?: string
}

/**
 * Default link renderer. Plain `<a>` so the header renders in any env
 * (storybook, catalog, marketing iframe) without a router. The real
 * app injects TanStack `<Link>` via the `linkComponent` prop.
 */
function DefaultLink({
  to,
  className,
  children,
  ...rest
}: {
  to: string
  className?: string
  children: ReactNode
  'aria-current'?: 'page' | undefined
  'aria-label'?: string
  'aria-disabled'?: 'true' | undefined
  'data-active'?: 'true' | undefined
  'data-disabled'?: 'true' | undefined
  tabIndex?: number
}) {
  return (
    <a href={to} className={className} {...rest}>
      {children}
    </a>
  )
}

export function AppHeader({
  links,
  currentPath,
  linkComponent,
  brandLinkTo = '/',
  homeAriaLabel = 'Klyp — home',
  wordmark,
  symbolSrc,
  navAriaLabel = 'Primary',
  hamburgerSlot,
  notificationsSlot,
  upgradeSlot,
  authSlot,
  transparent = true,
  className,
}: AppHeaderProps) {
  const LinkComp: AppHeaderLinkComponent = linkComponent ?? DefaultLink
  const hasCluster = Boolean(notificationsSlot || upgradeSlot || authSlot)

  return (
    <TopNav
      className={['klyp-AppHeader', className].filter(Boolean).join(' ')}
      transparent={transparent}
      navAriaLabel={navAriaLabel}
      leading={
        <>
          {hamburgerSlot ? (
            <div className="klyp-AppHeader__hamburgerSlot">{hamburgerSlot}</div>
          ) : null}
          <LinkComp to={brandLinkTo} className="klyp-AppHeader__brand" aria-label={homeAriaLabel}>
            <BrandMark variant="lockup" size="md" wordmark={wordmark} symbolSrc={symbolSrc} />
          </LinkComp>
        </>
      }
      center={
        links.length > 0 ? (
          <div className="klyp-AppHeader__nav">
            {links.map((link) => {
              const active = link.match ? link.match(currentPath) : currentPath === link.to
              return (
                <LinkComp
                  key={link.label}
                  to={link.to}
                  className="klyp-AppHeader__navItem"
                  data-active={active ? 'true' : undefined}
                  data-disabled={link.disabled ? 'true' : undefined}
                  aria-current={active ? 'page' : undefined}
                  aria-disabled={link.disabled ? 'true' : undefined}
                  tabIndex={link.disabled ? -1 : undefined}
                >
                  {link.label}
                  {link.badge ? (
                    <span className="klyp-AppHeader__navBadge">{link.badge}</span>
                  ) : null}
                </LinkComp>
              )
            })}
          </div>
        ) : undefined
      }
      trailing={
        hasCluster ? (
          <div className="klyp-AppHeader__cluster">
            {notificationsSlot ? (
              <div className="klyp-AppHeader__slot klyp-AppHeader__slot--notifications">
                {notificationsSlot}
              </div>
            ) : null}
            {upgradeSlot ? (
              <div className="klyp-AppHeader__slot klyp-AppHeader__slot--upgrade">
                {upgradeSlot}
              </div>
            ) : null}
            {authSlot ? (
              <div className="klyp-AppHeader__slot klyp-AppHeader__slot--auth">{authSlot}</div>
            ) : null}
          </div>
        ) : undefined
      }
    />
  )
}

export default AppHeader

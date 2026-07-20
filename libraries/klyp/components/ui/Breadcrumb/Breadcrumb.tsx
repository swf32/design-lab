import './Breadcrumb.scss'

import { ChevronRightBulk, MoreHorizontalBulk } from '@klyp/icons/bulk'
import type { AnchorHTMLAttributes, HTMLAttributes, OlHTMLAttributes, ReactNode } from 'react'

// =====================================================================
// Breadcrumb — Klyp canonical primitive (Phase 2 of React Aria migration)
// =====================================================================
//
// Architecture: see ../../../../MIGRATION-REACT-ARIA-2026-04-30.md §5/§6/§16
//
// Breadcrumb has no good React Aria counterpart for our use-case
// (`react-aria-components` Breadcrumbs assumes its own structure that
// conflicts with the existing 7-component compound API). We keep the
// implementation as semantic HTML (nav / ol / li / a / span) and migrate
// only the styling layer to SCSS + data-attributes.
//
// Backward-compat: keeps the same compound API used by callers
// (`<Breadcrumb><BreadcrumbList>…</BreadcrumbList></Breadcrumb>`) and
// the legacy `asChild` prop on `BreadcrumbLink` which renders the link
// as a `<span>` so callers can wrap their own router `<Link>` inside.
// Pure CSS via BEM children + tokens; no Tailwind, no cn().

// === Public API types ===============================================
export type BreadcrumbProps = HTMLAttributes<HTMLElement>
export type BreadcrumbListProps = OlHTMLAttributes<HTMLOListElement>
export type BreadcrumbItemProps = HTMLAttributes<HTMLLIElement>
export type BreadcrumbLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  /**
   * When true, render as `<span>` instead of `<a>` so callers can wrap
   * their own router `<Link>` inside. Mirrors the shadcn convention.
   */
  asChild?: boolean
}
export type BreadcrumbPageProps = HTMLAttributes<HTMLSpanElement>
export type BreadcrumbSeparatorProps = HTMLAttributes<HTMLLIElement>
export type BreadcrumbEllipsisProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode
}

// === Components =====================================================
export function Breadcrumb({ className, ...props }: BreadcrumbProps) {
  return (
    <nav
      {...props}
      data-slot="breadcrumb"
      aria-label="breadcrumb"
      className={typeof className === 'string' ? `klyp-Breadcrumb ${className}` : 'klyp-Breadcrumb'}
    />
  )
}

export function BreadcrumbList({ className, ...props }: BreadcrumbListProps) {
  return (
    <ol
      {...props}
      data-slot="breadcrumb-list"
      className={
        typeof className === 'string'
          ? `klyp-Breadcrumb__list ${className}`
          : 'klyp-Breadcrumb__list'
      }
    />
  )
}

export function BreadcrumbItem({ className, ...props }: BreadcrumbItemProps) {
  return (
    <li
      {...props}
      data-slot="breadcrumb-item"
      className={
        typeof className === 'string'
          ? `klyp-Breadcrumb__item ${className}`
          : 'klyp-Breadcrumb__item'
      }
    />
  )
}

export function BreadcrumbLink({ className, asChild, ...props }: BreadcrumbLinkProps) {
  const mergedClassName =
    typeof className === 'string' ? `klyp-Breadcrumb__link ${className}` : 'klyp-Breadcrumb__link'

  if (asChild) {
    // Render as <span> so callers can wrap their own router <Link/> inside.
    // We strip anchor-specific attributes that don't apply to span.
    const {
      href: _href,
      target: _target,
      rel: _rel,
      ...spanProps
    } = props as AnchorHTMLAttributes<HTMLAnchorElement>
    return (
      <span
        {...(spanProps as HTMLAttributes<HTMLSpanElement>)}
        data-slot="breadcrumb-link"
        className={mergedClassName}
      />
    )
  }

  return <a {...props} data-slot="breadcrumb-link" className={mergedClassName} />
}

export function BreadcrumbPage({ className, ...props }: BreadcrumbPageProps) {
  return (
    <span
      {...props}
      data-slot="breadcrumb-page"
      aria-current="page"
      className={
        typeof className === 'string'
          ? `klyp-Breadcrumb__page ${className}`
          : 'klyp-Breadcrumb__page'
      }
    />
  )
}

export function BreadcrumbSeparator({ children, className, ...props }: BreadcrumbSeparatorProps) {
  return (
    <li
      {...props}
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={
        typeof className === 'string'
          ? `klyp-Breadcrumb__separator ${className}`
          : 'klyp-Breadcrumb__separator'
      }
    >
      {children ?? <ChevronRightBulk />}
    </li>
  )
}

export function BreadcrumbEllipsis({ className, children, ...props }: BreadcrumbEllipsisProps) {
  return (
    <span
      {...props}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={
        typeof className === 'string'
          ? `klyp-Breadcrumb__ellipsis ${className}`
          : 'klyp-Breadcrumb__ellipsis'
      }
    >
      {children ?? <MoreHorizontalBulk />}
      <span className="klyp-Breadcrumb__sr-only">More</span>
    </span>
  )
}

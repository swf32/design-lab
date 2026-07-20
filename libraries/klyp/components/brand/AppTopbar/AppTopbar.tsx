import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@klyp/ui/Breadcrumb'
import type { ComponentProps, ComponentType, ReactNode } from 'react'
import './AppTopbar.scss'

export type Crumb = {
  label: string
  /**
   * Internal route target. When `linkComponent` is provided by the caller
   * (e.g. apps/web injects TanStack Router's `<Link>`), the value is forwarded
   * as the component's `to` prop for client-side navigation. Otherwise the
   * fallback `<a href={to}>` is rendered (full document navigation).
   */
  to?: string
  /**
   * Plain href. Falls back to native <a> with full document navigation —
   * use only for external links. Internal routes should use `to`.
   */
  href?: string
}

/**
 * Minimal contract for the link component the caller may inject. Compatible
 * with both TanStack Router's `<Link>` (`to: string`) and any custom wrapper
 * that takes a `to` target.
 */
export type LinkComponent = ComponentType<{
  to: string
  children: ReactNode
  className?: string
}>

type AppTopbarProps = ComponentProps<'div'> & {
  crumbs: Crumb[]
  actions?: ReactNode
  /** Current page label override. Defaults to last crumb. */
  current?: string
  /**
   * Optional client-side router link component — typically TanStack Router's
   * `<Link>` injected from the consuming app. When omitted, internal `to`
   * targets render as native `<a href={to}>` (full document navigation).
   * Brand layer stays router-agnostic per `packages/brand/AGENTS.md`.
   */
  linkComponent?: LinkComponent
}

/**
 * In-page topbar that sits below TopNav. Holds breadcrumbs + page-level actions.
 * One-line layout, no sticky behavior of its own — drop it into a route's content area.
 *
 * Routing is data-agnostic: pass a `linkComponent` (e.g. TanStack `<Link>`)
 * to upgrade internal `to` crumbs from native `<a>` to client-side navigation.
 */
export function AppTopbar({
  crumbs,
  current,
  actions,
  linkComponent: LinkComp,
  className,
  ...props
}: AppTopbarProps) {
  const last = crumbs[crumbs.length - 1]
  const trail = crumbs.slice(0, -1)
  const currentLabel = current ?? last?.label

  const rootClassName = ['klyp-AppTopbar', className].filter(Boolean).join(' ')

  return (
    <div data-slot="app-topbar" className={rootClassName} {...props}>
      <Breadcrumb>
        <BreadcrumbList>
          {trail.flatMap((c, idx) => [
            <BreadcrumbItem key={`item-${c.label}-${idx}`}>
              {c.to ? (
                LinkComp ? (
                  <BreadcrumbLink asChild>
                    <LinkComp to={c.to}>{c.label}</LinkComp>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbLink href={c.to}>{c.label}</BreadcrumbLink>
                )
              ) : c.href ? (
                <BreadcrumbLink href={c.href}>{c.label}</BreadcrumbLink>
              ) : (
                c.label
              )}
            </BreadcrumbItem>,
            <BreadcrumbSeparator key={`sep-${c.label}-${idx}`} />,
          ])}
          {currentLabel && (
            <BreadcrumbItem>
              <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {actions && <div className="klyp-AppTopbar__actions">{actions}</div>}
    </div>
  )
}

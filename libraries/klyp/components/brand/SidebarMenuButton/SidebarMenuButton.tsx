import './SidebarMenuButton.scss'

import { SidebarLottie } from '@klyp/icons/sidebar'
import { Tooltip, TooltipContent } from '@klyp/ui/Tooltip'
import type { ComponentType, MouseEventHandler, ReactNode } from 'react'
import { useState } from 'react'
import { Focusable } from 'react-aria-components'

// SidebarMenuButton — THE canonical sidebar nav-row (brand molecule).
//
// Reworked 2026-07-02 to the production AppSidebar mechanics (the previous
// 2026-05-16 version is archived in `_archive/2026-07-02-pre-glow-unification`):
//   - fixed square icon slot = row height (`--smb-size`: 36px `md` desktop rail /
//     40px `lg` mobile drawer) anchored at the row start — the icon never moves
//     horizontally, so a collapsed rail of width 2×gutter + slot centres it
//     with NO jump between states;
//   - NEUTRAL, INSTANT states: hover = `--color-bg-surface-hover` wash +
//     icon scale(1.15) + Lottie playback; active = solid neutral wash. (A
//     same-day accent-glow + hover-delay experiment was reverted — Val.)
//   - the label/badge collapse to zero width via `data-collapsed` (opacity +
//     max-width + flex:0 0 0), mirroring the AppSidebar label mechanic.
//
// Consumers: AppSidebar nav rows (via AppSidebarNavRow binding), the
// MobileNavDrawer rows (`size="lg"`), and the ProfileMenu guest sign-in row.
//
// Router-agnostic: pass `linkComponent` + `to` for a router link (TanStack
// `<Link>` in the app), `href` for a plain `<a>`, or neither for a `<button>`.
// While `collapsed`, an optional `tooltip` surfaces the label on the right
// (RAC Tooltip; the trigger is wrapped in `<Focusable>` because TooltipTrigger
// only wires hover/focus onto React Aria focusable components).

export type SidebarMenuButtonSize = 'md' | 'lg'

/** Props forwarded to a router `linkComponent` (e.g. TanStack `<Link>`). */
export interface SidebarMenuButtonLinkProps {
  to: string
  className: string
  children: ReactNode
  'data-active'?: 'true'
  'data-disabled'?: 'true'
  'data-collapsed'?: 'true'
  'data-size'?: SidebarMenuButtonSize
  'data-hovered'?: 'true'
  'aria-label'?: string
  'aria-current'?: 'page'
  'aria-disabled'?: 'true'
  tabIndex?: number
  onClick?: MouseEventHandler<HTMLElement>
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onFocus?: () => void
  onBlur?: () => void
}

export type SidebarMenuButtonLinkComponent = ComponentType<SidebarMenuButtonLinkProps>

export interface SidebarMenuButtonProps {
  /** Row label text. Collapses to zero width while `collapsed`. */
  label: string
  /** Static icon (ReactNode). Rest-state fallback when no `lottieName`. */
  icon?: ReactNode
  /** Lottie animation key from `@klyp/icons/sidebar` (`railLottieIndex`).
   *  Plays on hover / focus of the whole row; `SidebarLottie` handles the
   *  reduce-motion fallback internally. */
  lottieName?: string
  /** Per-icon Lottie render size (px). Default 20. Bump for Lotties whose
   *  artwork carries internal canvas padding (e.g. the chat glyph). */
  lottieSize?: number
  /** Optional trailing badge (e.g. "Soon" pill on disabled items). */
  badge?: string
  /** Row scale: `md` = 36px (desktop rail), `lg` = 40px (mobile drawer). */
  size?: SidebarMenuButtonSize
  /** Active route — solid neutral wash + white fg. */
  active?: boolean
  /** Disabled — subtle fg, icon dims, activation prevented (click + Enter).
   *  Rows stay FOCUSABLE (`aria-disabled`, not native `disabled`) so keyboard
   *  and SR users can still discover "Soon" items; hover/focus previews the
   *  Lottie (playful affordance, matches the old rail). */
  disabled?: boolean
  /** Collapsed rail layout — label/badge fade to zero width. */
  collapsed?: boolean
  /** Label surfaced as a right-side tooltip while `collapsed`. */
  tooltip?: string
  /** Static hover mirror for docs/stories — forces the hover visuals and
   *  plays the Lottie without a real pointer. */
  forceHovered?: boolean
  /** Renders as `<a href>` (external / non-router targets). */
  href?: string
  /** Router link target — rendered through `linkComponent`. */
  to?: string
  /** Router link renderer (e.g. TanStack `<Link>`); used when `to` is set. */
  linkComponent?: SidebarMenuButtonLinkComponent
  onClick?: MouseEventHandler<HTMLElement>
  className?: string
  /** Accessible name override (defaults to the visible label). */
  ariaLabel?: string
}

export function SidebarMenuButton({
  label,
  icon,
  lottieName,
  lottieSize,
  badge,
  size = 'md',
  active,
  disabled,
  collapsed,
  tooltip,
  forceHovered,
  href,
  to,
  linkComponent: LinkComponent,
  onClick,
  className,
  ariaLabel,
}: SidebarMenuButtonProps) {
  const [hovered, setHovered] = useState(false)
  const playing = hovered || Boolean(forceHovered)

  const iconNode = lottieName ? (
    <SidebarLottie name={lottieName} play={playing} size={lottieSize ?? 20} />
  ) : (
    icon
  )

  const content = (
    <>
      <span className="klyp-SidebarMenuButton__icon" aria-hidden="true">
        {iconNode}
      </span>
      <span className="klyp-SidebarMenuButton__label">{label}</span>
      {badge ? <span className="klyp-SidebarMenuButton__badge">{badge}</span> : null}
    </>
  )

  const handleClick: MouseEventHandler<HTMLElement> = (event) => {
    if (disabled) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  const shared = {
    className: className ? `klyp-SidebarMenuButton ${className}` : 'klyp-SidebarMenuButton',
    'data-active': active ? ('true' as const) : undefined,
    'data-disabled': disabled ? ('true' as const) : undefined,
    'data-collapsed': collapsed ? ('true' as const) : undefined,
    'data-size': size === 'lg' ? ('lg' as const) : undefined,
    'data-hovered': forceHovered ? ('true' as const) : undefined,
    'aria-label': ariaLabel,
    'aria-current': active ? ('page' as const) : undefined,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
  }

  // Disabled rows stay in the tab order on ALL branches — `aria-disabled` +
  // the handleClick guard (covers Enter/Space too), never native `disabled`
  // or tabIndex=-1: those remove "Soon" rows from keyboard/SR discovery, and
  // native `disabled` also suppresses the hover Lottie + collapsed tooltip.
  const element =
    LinkComponent && to != null ? (
      <LinkComponent
        {...shared}
        to={to}
        aria-disabled={disabled ? 'true' : undefined}
        onClick={handleClick}
      >
        {content}
      </LinkComponent>
    ) : href != null ? (
      <a
        {...shared}
        href={href}
        rel="noopener noreferrer"
        aria-disabled={disabled ? 'true' : undefined}
        onClick={handleClick}
      >
        {content}
      </a>
    ) : (
      <button
        {...shared}
        type="button"
        aria-disabled={disabled ? 'true' : undefined}
        onClick={handleClick}
      >
        {content}
      </button>
    )

  if (!tooltip) return element

  return (
    <Tooltip isDisabled={!collapsed}>
      <Focusable>{element}</Focusable>
      <TooltipContent side="right">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export default SidebarMenuButton

import './SidebarShell.scss'

import { ChevronDownOutline } from '@klyp/icons'
import { SidebarLottie } from '@klyp/icons/sidebar'
import { type ReactNode, useState } from 'react'
import { Button as RACButton } from 'react-aria-components'

// SidebarShell — the sidebar KIT (brand molecule, ONE module, ONE catalog
// page). Extracted from the AppSidebar at the 2026-07-02 sidebar
// decomposition, consolidated same-day (Val: don't scatter sidebar-only
// pieces across separate catalog components). The kit ships:
//   - SidebarShell (+Header/Nav/NavItem/Footer) — the chassis: panel chrome
//     (surface, gutter, right hairline seam) + the vertical layout contract,
//     with `data-expanded` on the root as the single collapse driver;
//   - SidebarToggle — the collapse ⇄ expand control (chevron Lottie, mirror);
//   - SidebarGroupHeader — a section header that doubles as a disclosure
//     toggle (the "Recents" row) with a trailing action slot.
// (The nav row itself is the standalone `SidebarMenuButton` — it has three
// production consumers beyond this kit. Tiny row-riding icon actions are the
// ui `ToolButton variant="bare"`, not a sidebar-specific component.)
//
// The chassis is deliberately DUMB: it owns no width (the host layout
// animates the track — AppLayout's `--app-sidebar-width` grid track in the
// app), no state, no data. Compose the pieces inside:
//   <SidebarShell expanded>
//     <SidebarShellHeader>  logo + <SidebarToggle/>          </SidebarShellHeader>
//     <SidebarShellNav>     <SidebarShellNavItem>…rows…      </SidebarShellNav>
//     …free-form content (e.g. the Recents block / a spacer)…
//     <SidebarShellFooter>  profile row                      </SidebarShellFooter>
//   </SidebarShell>
// Rows collapse themselves (SidebarMenuButton `collapsed` prop); app-specific
// blocks hook their own `[data-expanded='false']` cascades off the root.

export interface SidebarShellProps {
  /** Collapse driver — written as `data-expanded` for descendant CSS. */
  expanded?: boolean
  /** Accessible name for the `<aside>` landmark. */
  ariaLabel?: string
  id?: string
  className?: string
  children: ReactNode
}

export function SidebarShell({
  expanded = true,
  ariaLabel,
  id,
  className,
  children,
}: SidebarShellProps) {
  return (
    <aside
      id={id}
      className={className ? `klyp-SidebarShell ${className}` : 'klyp-SidebarShell'}
      data-expanded={expanded ? 'true' : 'false'}
      aria-label={ariaLabel}
    >
      {children}
    </aside>
  )
}

/** Header row — logo slot + the collapse toggle. `justify-content: flex-start`
 *  (NOT space-between) so a max-width-collapsing logo lets the toggle SLIDE
 *  left into the icon column instead of teleporting. */
export function SidebarShellHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={className ? `klyp-SidebarShell__header ${className}` : 'klyp-SidebarShell__header'}
    >
      {children}
    </div>
  )
}

/** Primary-nav region — a `<nav>` landmark wrapping the row list. Shrinkable:
 *  on short windows it gives up height and scrolls inside itself instead of
 *  pushing the content below over the footer. */
export function SidebarShellNav({
  ariaLabel,
  children,
  className,
}: {
  ariaLabel?: string
  children: ReactNode
  className?: string
}) {
  return (
    <nav
      className={className ? `klyp-SidebarShell__nav ${className}` : 'klyp-SidebarShell__nav'}
      aria-label={ariaLabel}
    >
      <ul className="klyp-SidebarShell__list">{children}</ul>
    </nav>
  )
}

/** One nav-list cell. `position: relative` so row-level overlays (e.g. the
 *  AppSidebar Create-row quick actions) can anchor to it. */
export function SidebarShellNavItem({
  sectionBreak,
  children,
  className,
}: {
  /** Marks the first item of a new visual group — extra top margin. */
  sectionBreak?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <li
      className={className ? `klyp-SidebarShell__item ${className}` : 'klyp-SidebarShell__item'}
      data-section-break={sectionBreak ? 'true' : undefined}
    >
      {children}
    </li>
  )
}

/** Footer — pinned to the bottom by the flex column, separated by a hairline. */
export function SidebarShellFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={className ? `klyp-SidebarShell__footer ${className}` : 'klyp-SidebarShell__footer'}
    >
      {children}
    </div>
  )
}

// =====================================================================
// SidebarToggle — the collapse ⇄ expand control.
// =====================================================================
// Fixed 36px square icon button that plays the `sidebar-toggle` Lottie
// chevron on hover/focus and mirrors it (scaleX(-1), points right = expand)
// while the sidebar is collapsed. Controlled: the host owns `expanded`
// (persisted UI pref) and flips it in `onPress`.

export interface SidebarToggleProps {
  /** Current sidebar state — drives the chevron mirror + accessible name. */
  expanded: boolean
  onPress: () => void
  /** Accessible name while expanded (the action = collapse). */
  collapseLabel?: string
  /** Accessible name while collapsed (the action = expand). */
  expandLabel?: string
  /** `aria-controls` — id of the sidebar element this toggle drives. */
  controls?: string
  className?: string
}

export function SidebarToggle({
  expanded,
  onPress,
  collapseLabel = 'Collapse sidebar',
  expandLabel = 'Expand sidebar',
  controls,
  className,
}: SidebarToggleProps) {
  // Drives the Lottie chevron — plays on hover/focus, frozen while collapsed
  // (the mirrored playback reads as a horizontal shift in the narrow rail).
  const [hovered, setHovered] = useState(false)

  return (
    <RACButton
      className={className ? `klyp-SidebarToggle ${className}` : 'klyp-SidebarToggle'}
      data-expanded={expanded ? 'true' : 'false'}
      aria-label={expanded ? collapseLabel : expandLabel}
      aria-expanded={expanded}
      aria-controls={controls}
      onPress={onPress}
      onHoverChange={setHovered}
      onFocusChange={setHovered}
    >
      <span className="klyp-SidebarToggle__slot">
        <SidebarLottie name="sidebar-toggle" play={hovered && expanded} size={20} />
      </span>
    </RACButton>
  )
}

// =====================================================================
// SidebarGroupHeader — section header + disclosure toggle.
// =====================================================================
// Anatomy: [label + chevron] ......... [trailing slot]
//   - the label button collapses/expands the section (aria-expanded); the
//     chevron appears on hover/focus only and rotates -90° while collapsed;
//   - `trailing` pins an optional action to the right edge (e.g. the
//     "+ New chat" pill in the AppSidebar Recents).

export interface SidebarGroupHeaderProps {
  /** Section label — also the disclosure button's accessible name. */
  label: string
  /** Disclosure state — `false` = section collapsed (chevron points right). */
  expanded?: boolean
  onToggle?: () => void
  /** Optional action pinned to the right edge of the header row. */
  trailing?: ReactNode
  className?: string
}

export function SidebarGroupHeader({
  label,
  expanded = true,
  onToggle,
  trailing,
  className,
}: SidebarGroupHeaderProps) {
  return (
    <div className={className ? `klyp-SidebarGroupHeader ${className}` : 'klyp-SidebarGroupHeader'}>
      <button
        type="button"
        className="klyp-SidebarGroupHeader__toggle"
        data-collapsed={expanded ? undefined : 'true'}
        aria-expanded={expanded ? 'true' : 'false'}
        onClick={onToggle}
      >
        <span>{label}</span>
        <ChevronDownOutline
          className="klyp-SidebarGroupHeader__chevron"
          width={14}
          height={14}
          aria-hidden
        />
      </button>
      {trailing}
    </div>
  )
}

export default SidebarShell

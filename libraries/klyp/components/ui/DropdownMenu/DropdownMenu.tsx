import './DropdownMenu.scss'

import { CircleBulk } from '@klyp/icons/bulk'
import { ChevronDownOutline, TickOutline } from '@klyp/icons/outline'
import {
  type ComponentProps,
  cloneElement,
  isValidElement,
  type Key,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react'
import {
  Button as RACButton,
  Header as RACHeader,
  Menu as RACMenu,
  MenuItem as RACMenuItem,
  type MenuItemProps as RACMenuItemProps,
  type MenuProps as RACMenuProps,
  MenuSection as RACMenuSection,
  MenuTrigger as RACMenuTrigger,
  Popover as RACPopover,
  type PopoverProps as RACPopoverProps,
  Separator as RACSeparator,
  SubmenuTrigger as RACSubmenuTrigger,
} from 'react-aria-components'

// =====================================================================
// DropdownMenu — Klyp canonical primitive (Phase 2 of React Aria migration)
// =====================================================================
//
// Architecture: see ../../../../MIGRATION-REACT-ARIA-2026-04-30.md §5/§6/§16
//
// RAC mapping:
//   DropdownMenu (Root)        -> RAC MenuTrigger
//   DropdownMenuTrigger        -> RAC Button (or `render` element clone)
//   DropdownMenuPortal         -> Fragment (RAC handles portal)
//   DropdownMenuContent        -> RAC Popover + RAC Menu
//   DropdownMenuGroup          -> RAC MenuSection
//   DropdownMenuRadioGroup     -> RAC MenuSection (selection at Menu level)
//   DropdownMenuItem           -> RAC MenuItem
//   DropdownMenuCheckboxItem   -> RAC MenuItem with check indicator
//   DropdownMenuRadioItem      -> RAC MenuItem with radio indicator
//   DropdownMenuLabel          -> RAC Header
//   DropdownMenuSeparator      -> RAC Separator
//   DropdownMenuShortcut       -> styled <span>
//   DropdownMenuSub            -> RAC SubmenuTrigger
//   DropdownMenuSubTrigger     -> RAC MenuItem (first child of SubmenuTrigger)
//   DropdownMenuSubContent     -> RAC Popover + RAC Menu (second child of SubmenuTrigger)
//
// Drop-in compat: keeps all 15 export names. Maps Base UI's `side`/`align`/
// `sideOffset` to RAC `placement`/`offset`. Maps `onSelect` and `onClick` on
// items to RAC `onAction`. Maps `disabled` to `isDisabled`.

// === Side / Align mapping ============================================
type LegacySide = 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end'
type LegacyAlign = 'start' | 'center' | 'end'

const SIDE_MAP: Record<LegacySide, 'top' | 'bottom' | 'left' | 'right'> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
  'inline-start': 'left',
  'inline-end': 'right',
}

function toPlacement(side: LegacySide, align: LegacyAlign): RACPopoverProps['placement'] {
  const base = SIDE_MAP[side] ?? 'bottom'
  if (align === 'center') return base
  return `${base} ${align}` as RACPopoverProps['placement']
}

// === DropdownMenu (Root → RAC MenuTrigger) ===========================
export interface DropdownMenuProps {
  /** Controlled open state. */
  open?: boolean
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean
  /** Open-state change handler. */
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
}

export function DropdownMenu({ open, defaultOpen, onOpenChange, children }: DropdownMenuProps) {
  return (
    <RACMenuTrigger
      {...(open !== undefined ? { isOpen: open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      {children}
    </RACMenuTrigger>
  )
}

// === DropdownMenuPortal ==============================================
// RAC handles portaling internally via the Popover. Keep as transparent
// fragment for drop-in compat with Base UI callers that wrapped content.
export interface DropdownMenuPortalProps {
  children?: ReactNode
}

export function DropdownMenuPortal({ children }: DropdownMenuPortalProps) {
  return <>{children}</>
}

// === DropdownMenuTrigger =============================================
//
// Two legacy code paths:
//   A) `<DropdownMenuTrigger render={<Button .../>}>` — Base UI render-prop.
//      Clone the element so it becomes the actual button child of MenuTrigger.
//   B) `<DropdownMenuTrigger className="..." aria-label="...">children</...>`
//      — render an RAC Button as the trigger.
export interface DropdownMenuTriggerProps
  extends Omit<ComponentProps<typeof RACButton>, 'children' | 'render'> {
  /** Legacy Base UI render-prop — the element to render as the trigger. */
  render?: ReactElement
  /** Legacy Base UI flag — silences non-native-button a11y warning. Ignored. */
  nativeButton?: boolean
  children?: ReactNode
}

export function DropdownMenuTrigger({
  render,
  nativeButton: _nativeButton,
  className,
  children,
  ...props
}: DropdownMenuTriggerProps) {
  if (render && isValidElement(render)) {
    const renderProps = (render.props ?? {}) as {
      className?: string
      children?: ReactNode
    }
    const mergedClassName =
      typeof className === 'string'
        ? typeof renderProps.className === 'string'
          ? `${renderProps.className} ${className}`
          : className
        : renderProps.className
    return cloneElement(render, {
      ...props,
      ...(mergedClassName ? { className: mergedClassName } : {}),
    } as Record<string, unknown>)
  }

  return (
    <RACButton
      {...props}
      className={
        typeof className === 'string'
          ? `klyp-DropdownMenu__trigger ${className}`
          : 'klyp-DropdownMenu__trigger'
      }
    >
      {children}
    </RACButton>
  )
}

// === DropdownMenuContent (RAC Popover + Menu) ========================
export interface DropdownMenuContentProps
  extends Omit<RACMenuProps<object>, 'children' | 'className'> {
  side?: LegacySide
  align?: LegacyAlign
  sideOffset?: number
  alignOffset?: number
  className?: string
  children?: ReactNode
  /** Ref to the popover ROOT element (the positioned `.klyp-DropdownMenu`
   *  surface). Consumers that render a companion layer beside the menu (e.g.
   *  @klyp/brand Dropdown's `renderDetail` side-card) measure this rect. */
  ref?: Ref<HTMLElement>
  /** Companion layer rendered INSIDE the popover as a SIBLING of the menu
   *  (after it). Inside = it stays interactive under RAC's modal
   *  `ariaHideOutside` (everything outside the popover becomes `inert`) and
   *  rides the popover's entrance/exit. The popover root gets
   *  `data-has-aside` so styles can restructure scroll (the aside is usually
   *  absolutely positioned — see @klyp/brand Dropdown.scss). Note: RAC Menu
   *  children stay collection-restricted; only this slot may hold free markup. */
  aside?: ReactNode
}

export function DropdownMenuContent({
  className,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
  ref,
  aside,
  children,
  ...props
}: DropdownMenuContentProps) {
  const placement = toPlacement(side, align)
  return (
    <RACPopover
      ref={ref as Ref<HTMLElement>}
      placement={placement}
      offset={sideOffset}
      crossOffset={alignOffset}
      data-has-aside={aside ? 'true' : undefined}
      className={
        typeof className === 'string' ? `klyp-DropdownMenu ${className}` : 'klyp-DropdownMenu'
      }
    >
      <RACMenu {...props} className="klyp-DropdownMenu__menu">
        {children}
      </RACMenu>
      {aside}
    </RACPopover>
  )
}

// === DropdownMenuGroup (→ MenuSection) ===============================
export interface DropdownMenuGroupProps {
  className?: string
  children?: ReactNode
}

export function DropdownMenuGroup({ className, children }: DropdownMenuGroupProps) {
  return (
    <RACMenuSection
      className={
        typeof className === 'string'
          ? `klyp-DropdownMenu__group ${className}`
          : 'klyp-DropdownMenu__group'
      }
    >
      {children}
    </RACMenuSection>
  )
}

// === DropdownMenuRadioGroup ==========================================
// RAC handles radio selection at the Menu level via `selectionMode='single'`.
// For backward compat we render a plain section here — callers wanting real
// single-selection should set selectionMode on the parent <DropdownMenuContent>.
export interface DropdownMenuRadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children?: ReactNode
}

export function DropdownMenuRadioGroup({ className, children }: DropdownMenuRadioGroupProps) {
  return (
    <RACMenuSection
      className={
        typeof className === 'string'
          ? `klyp-DropdownMenu__group ${className}`
          : 'klyp-DropdownMenu__group'
      }
    >
      {children}
    </RACMenuSection>
  )
}

// === DropdownMenuItem ================================================
// Maps Base UI props onto RAC:
//   disabled  -> isDisabled
//   onSelect  -> onAction (no-arg callback in our wrapper)
//   onClick   -> still forwarded to RAC (rendered as <div role="menuitem">,
//               supports onClick natively).
export interface DropdownMenuItemProps
  extends Omit<RACMenuItemProps, 'children' | 'className' | 'onAction'> {
  inset?: boolean
  variant?: 'default' | 'destructive'
  /** Base UI alias for `isDisabled`. */
  disabled?: boolean
  /** Base UI signature: fired on item activation. */
  onSelect?: (event?: Event) => void
  /** RAC-style activation. */
  onAction?: () => void
  className?: string
  children?: ReactNode
}

export function DropdownMenuItem({
  className,
  inset,
  variant = 'default',
  disabled,
  isDisabled,
  onSelect,
  onAction,
  children,
  ...props
}: DropdownMenuItemProps) {
  const handleAction = () => {
    if (onAction) onAction()
    if (onSelect) onSelect()
  }
  return (
    <RACMenuItem
      {...props}
      isDisabled={isDisabled || disabled}
      onAction={onAction || onSelect ? handleAction : undefined}
      data-inset={inset || undefined}
      data-variant={variant}
      className={
        typeof className === 'string'
          ? `klyp-DropdownMenu__item ${className}`
          : 'klyp-DropdownMenu__item'
      }
    >
      {children}
    </RACMenuItem>
  )
}

// === DropdownMenuCheckboxItem ========================================
// RAC sets `data-selected` on multi-select items. Use selectionMode="multiple"
// on parent Menu (or via this component's render path: we expose `checked`
// for backward-compat — caller-controlled visual state without a selection
// manager). When `checked` is set explicitly, we render the indicator
// regardless of RAC's selection state.
export interface DropdownMenuCheckboxItemProps
  extends Omit<RACMenuItemProps, 'children' | 'className' | 'onAction'> {
  inset?: boolean
  /** Caller-controlled visual checked state (Base UI compat). */
  checked?: boolean
  disabled?: boolean
  onSelect?: (event?: Event) => void
  onAction?: () => void
  onCheckedChange?: (checked: boolean) => void
  className?: string
  children?: ReactNode
}

export function DropdownMenuCheckboxItem({
  className,
  inset,
  checked,
  disabled,
  isDisabled,
  onSelect,
  onAction,
  onCheckedChange,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const handleAction = () => {
    if (onAction) onAction()
    if (onSelect) onSelect()
    if (onCheckedChange) onCheckedChange(!checked)
  }
  return (
    <RACMenuItem
      {...props}
      isDisabled={isDisabled || disabled}
      onAction={handleAction}
      data-inset={inset || undefined}
      data-checked={checked || undefined}
      className={
        typeof className === 'string'
          ? `klyp-DropdownMenu__item klyp-DropdownMenu__item--checkbox ${className}`
          : 'klyp-DropdownMenu__item klyp-DropdownMenu__item--checkbox'
      }
    >
      <span className="klyp-DropdownMenu__item-indicator" aria-hidden="true">
        <TickOutline />
      </span>
      {children}
    </RACMenuItem>
  )
}

// === DropdownMenuRadioItem ===========================================
export interface DropdownMenuRadioItemProps
  extends Omit<RACMenuItemProps, 'children' | 'className' | 'onAction' | 'value'> {
  inset?: boolean
  /** Caller-controlled visual selected state (Base UI compat). */
  value?: string
  checked?: boolean
  disabled?: boolean
  onSelect?: (event?: Event) => void
  onAction?: () => void
  className?: string
  children?: ReactNode
}

export function DropdownMenuRadioItem({
  className,
  inset,
  checked,
  disabled,
  isDisabled,
  onSelect,
  onAction,
  children,
  value: _value,
  ...props
}: DropdownMenuRadioItemProps) {
  const handleAction = () => {
    if (onAction) onAction()
    if (onSelect) onSelect()
  }
  return (
    <RACMenuItem
      {...props}
      isDisabled={isDisabled || disabled}
      onAction={onAction || onSelect ? handleAction : undefined}
      data-inset={inset || undefined}
      data-checked={checked || undefined}
      className={
        typeof className === 'string'
          ? `klyp-DropdownMenu__item klyp-DropdownMenu__item--radio ${className}`
          : 'klyp-DropdownMenu__item klyp-DropdownMenu__item--radio'
      }
    >
      <span className="klyp-DropdownMenu__item-indicator" aria-hidden="true">
        <CircleBulk />
      </span>
      {children}
    </RACMenuItem>
  )
}

// === DropdownMenuLabel (→ RAC Header) ================================
export interface DropdownMenuLabelProps extends ComponentProps<'span'> {
  inset?: boolean
}

export function DropdownMenuLabel({
  className,
  inset,
  children,
  ...props
}: DropdownMenuLabelProps) {
  return (
    <RACHeader
      {...props}
      data-inset={inset || undefined}
      className={
        typeof className === 'string'
          ? `klyp-DropdownMenu__label ${className}`
          : 'klyp-DropdownMenu__label'
      }
    >
      {children}
    </RACHeader>
  )
}

// === DropdownMenuSeparator ===========================================
export interface DropdownMenuSeparatorProps extends ComponentProps<'div'> {}

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <RACSeparator
      {...props}
      className={
        typeof className === 'string'
          ? `klyp-DropdownMenu__separator ${className}`
          : 'klyp-DropdownMenu__separator'
      }
    />
  )
}

// === DropdownMenuShortcut ============================================
export interface DropdownMenuShortcutProps extends ComponentProps<'span'> {}

export function DropdownMenuShortcut({ className, children, ...props }: DropdownMenuShortcutProps) {
  return (
    <span
      {...props}
      className={
        typeof className === 'string'
          ? `klyp-DropdownMenu__shortcut ${className}`
          : 'klyp-DropdownMenu__shortcut'
      }
    >
      {children}
    </span>
  )
}

// === DropdownMenuSub (→ RAC SubmenuTrigger) ==========================
export interface DropdownMenuSubProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
}

export function DropdownMenuSub({ children }: DropdownMenuSubProps) {
  // RAC SubmenuTrigger doesn't accept controlled isOpen — for Base UI compat
  // we just pass children through. The first child must be a MenuItem and
  // the second a Popover (handled by SubTrigger/SubContent below).
  return <RACSubmenuTrigger>{children as never}</RACSubmenuTrigger>
}

// === DropdownMenuSubTrigger ==========================================
// Renders as a MenuItem with a chevron — first child of SubmenuTrigger.
export interface DropdownMenuSubTriggerProps
  extends Omit<RACMenuItemProps, 'children' | 'className' | 'onAction'> {
  inset?: boolean
  disabled?: boolean
  className?: string
  children?: ReactNode
}

export function DropdownMenuSubTrigger({
  className,
  inset,
  disabled,
  isDisabled,
  children,
  ...props
}: DropdownMenuSubTriggerProps) {
  return (
    <RACMenuItem
      {...props}
      isDisabled={isDisabled || disabled}
      data-inset={inset || undefined}
      className={
        typeof className === 'string'
          ? `klyp-DropdownMenu__item klyp-DropdownMenu__item--sub-trigger ${className}`
          : 'klyp-DropdownMenu__item klyp-DropdownMenu__item--sub-trigger'
      }
    >
      {children}
      <ChevronDownOutline className="klyp-DropdownMenu__sub-chevron" />
    </RACMenuItem>
  )
}

// === DropdownMenuSubContent ==========================================
// Second child of SubmenuTrigger: Popover + Menu.
export interface DropdownMenuSubContentProps
  extends Omit<RACMenuProps<object>, 'children' | 'className'> {
  side?: LegacySide
  align?: LegacyAlign
  sideOffset?: number
  alignOffset?: number
  className?: string
  children?: ReactNode
}

export function DropdownMenuSubContent({
  className,
  side = 'right',
  align = 'start',
  sideOffset = 0,
  alignOffset = -3,
  children,
  ...props
}: DropdownMenuSubContentProps) {
  const placement = toPlacement(side, align)
  return (
    <RACPopover
      placement={placement}
      offset={sideOffset}
      crossOffset={alignOffset}
      className={
        typeof className === 'string'
          ? `klyp-DropdownMenu klyp-DropdownMenu--sub ${className}`
          : 'klyp-DropdownMenu klyp-DropdownMenu--sub'
      }
    >
      <RACMenu {...props} className="klyp-DropdownMenu__menu">
        {children}
      </RACMenu>
    </RACPopover>
  )
}

// Re-export Key for callers using onAction(key) signature.
export type { Key }

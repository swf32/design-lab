import './Sheet.scss'

import { XOutline } from '@klyp/icons/outline'
import { Button } from '@klyp/ui/Button'
import {
  type ComponentProps,
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react'
import {
  Button as RACButton,
  Dialog as RACDialog,
  Heading as RACHeading,
  Modal as RACModal,
  ModalOverlay as RACModalOverlay,
  type ModalOverlayProps as RACModalOverlayProps,
} from 'react-aria-components'

// =====================================================================
// Sheet — Klyp canonical primitive (Phase 2 of React Aria migration)
// =====================================================================
//
// Architecture: see ../../../../MIGRATION-REACT-ARIA-2026-04-30.md §5/§6/§16
//
// 2026-05-06: rewritten to drive open-state via React context instead of
// `RACDialogTrigger`. The DialogTrigger wrapper warns
// "PressResponder rendered without a pressable child" whenever the Sheet
// is used in controlled mode without a `<SheetTrigger>` sibling — which
// is our common case (MobileNavDrawer, ScriptHistoryDrawer, CompiledPanel
// all open the sheet from external state). RAC's ModalOverlay accepts
// `isOpen` / `onOpenChange` directly, so we can wire it from context and
// drop DialogTrigger entirely.
//
// RAC mapping:
//   Sheet (Root)        -> SheetContext provider (manages open state)
//   SheetTrigger        -> RACButton / cloneElement with onClick → setOpen(true)
//   SheetClose          -> RACButton / cloneElement with onClick → setOpen(false)
//   SheetOverlay        -> RAC ModalOverlay (klyp-Sheet__overlay)
//   SheetContent        -> RAC ModalOverlay (controlled by context) +
//                          Modal + Dialog. Carries `data-side` + `data-size`.
//   SheetBody           -> styled <div>, the scrollable region (flex:1 +
//                          min-height:0 + overflow-y:auto). Header/Footer pin.
//   SheetHeader/Footer  -> styled <div>
//   SheetTitle          -> RAC Heading slot="title"
//   SheetDescription    -> styled <p>
//
// Close button is opt-in via `showCloseButton` (default false) — top-right X
// mirroring Dialog. Otherwise close via <SheetClose>, backdrop click, or Esc.
// Width: `size` prop (sm/md/lg/full) → --sheet-width;
// set --sheet-width directly for an exact one-off width. Applies to left/right.
// Scrim: `backdrop` prop (blur=default / opaque / transparent) → data-backdrop.
//
// State styling via RAC data-attrs:
//   [data-entering], [data-exiting], [data-side='top'|'right'|'bottom'|'left']

type SheetSide = 'top' | 'right' | 'bottom' | 'left'

// === SheetContext =====================================================
type SheetCtx = {
  isOpen: boolean
  setOpen: (next: boolean) => void
}

const SheetContext = createContext<SheetCtx | null>(null)

// === Sheet (Root → SheetContext provider) =============================
export interface SheetProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
}

export function Sheet({ open, defaultOpen, onOpenChange, children }: SheetProps) {
  const isControlled = open !== undefined
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const isOpen = isControlled ? (open as boolean) : internalOpen

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  return <SheetContext.Provider value={{ isOpen, setOpen }}>{children}</SheetContext.Provider>
}

// === SheetTrigger ====================================================
//
// Two shapes (legacy parity with old Base UI Dialog.Trigger):
//
//   A) `<SheetTrigger render={<Comp/>}>` — caller supplies the trigger
//      element. We clone it and merge an onClick that opens the sheet.
//
//   B) `<SheetTrigger>children</SheetTrigger>` — wrap children in an RAC
//      Button with onPress wired to setOpen(true).
export interface SheetTriggerProps
  extends Omit<ComponentProps<typeof RACButton>, 'children' | 'render'> {
  /** Legacy Base UI render-prop — element to render as the trigger. */
  render?: ReactElement
  /** Legacy Base UI flag — silences non-native button warning. Ignored. */
  nativeButton?: boolean
  children?: ReactNode
}

export function SheetTrigger({
  render,
  nativeButton: _nativeButton,
  className,
  children,
  onPress,
  ...props
}: SheetTriggerProps) {
  const ctx = useContext(SheetContext)

  if (render && isValidElement(render)) {
    const renderProps = (render.props ?? {}) as {
      className?: string
      children?: ReactNode
      onClick?: (e: ReactMouseEvent) => void
    }
    const mergedClassName =
      typeof className === 'string'
        ? typeof renderProps.className === 'string'
          ? `${renderProps.className} ${className}`
          : className
        : renderProps.className
    const handleClick = (e: ReactMouseEvent) => {
      renderProps.onClick?.(e)
      ctx?.setOpen(true)
    }
    return cloneElement(render, {
      ...props,
      onClick: handleClick,
      ...(mergedClassName ? { className: mergedClassName } : {}),
    } as Record<string, unknown>)
  }

  return (
    <RACButton
      {...props}
      onPress={(e) => {
        onPress?.(e)
        ctx?.setOpen(true)
      }}
      className={
        typeof className === 'string' ? `klyp-Sheet__trigger ${className}` : 'klyp-Sheet__trigger'
      }
    >
      {children}
    </RACButton>
  )
}

// === SheetPortal =====================================================
// RAC handles portaling automatically via ModalOverlay. Kept as a Fragment
// passthrough for drop-in compat with legacy importers.
export interface SheetPortalProps {
  children?: ReactNode
}

export function SheetPortal({ children }: SheetPortalProps) {
  return <>{children}</>
}

// === SheetClose ======================================================
export interface SheetCloseProps extends Omit<ComponentProps<typeof RACButton>, 'render'> {
  /** Legacy Base UI render-prop. */
  render?: ReactElement
  children?: ReactNode
}

export function SheetClose({ render, className, children, onPress, ...props }: SheetCloseProps) {
  const ctx = useContext(SheetContext)

  if (render && isValidElement(render)) {
    const renderProps = (render.props ?? {}) as {
      className?: string
      children?: ReactNode
      onClick?: (e: ReactMouseEvent) => void
    }
    const mergedClassName =
      typeof className === 'string'
        ? typeof renderProps.className === 'string'
          ? `${renderProps.className} ${className}`
          : className
        : renderProps.className
    const handleClick = (e: ReactMouseEvent) => {
      renderProps.onClick?.(e)
      ctx?.setOpen(false)
    }
    return cloneElement(render, {
      ...props,
      onClick: handleClick,
      ...(mergedClassName ? { className: mergedClassName } : {}),
    } as Record<string, unknown>)
  }

  return (
    <RACButton
      {...props}
      onPress={(e) => {
        onPress?.(e)
        ctx?.setOpen(false)
      }}
      className={
        typeof className === 'string' ? `klyp-Sheet__close ${className}` : 'klyp-Sheet__close'
      }
    >
      {children}
    </RACButton>
  )
}

// === SheetOverlay ====================================================
// Wraps RAC ModalOverlay alone. Reads SheetContext if present so the
// overlay is controlled by Sheet's open state.
export interface SheetOverlayProps extends Omit<RACModalOverlayProps, 'className' | 'children'> {
  className?: string
  children?: ReactNode
}

export function SheetOverlay({ className, children, ...props }: SheetOverlayProps) {
  const ctx = useContext(SheetContext)
  return (
    <RACModalOverlay
      {...props}
      {...(ctx ? { isOpen: ctx.isOpen, onOpenChange: ctx.setOpen } : {})}
      className={
        typeof className === 'string' ? `klyp-Sheet__overlay ${className}` : 'klyp-Sheet__overlay'
      }
    >
      {children}
    </RACModalOverlay>
  )
}

// === SheetContent ====================================================
/** Panel width preset (left/right sides). `full` = edge-to-edge. For a
 *  precise one-off width, set the `--sheet-width` CSS custom property on
 *  the content instead of using a preset. Ignored on top/bottom (those
 *  are always full-width; their height is content-driven). */
export type SheetSize = 'sm' | 'md' | 'lg' | 'full'

/** Scrim behind the panel. `blur` (default) — dim + backdrop blur; `opaque`
 *  — dim, no blur; `transparent` — no dim, no blur (still catches click-out). */
export type SheetBackdrop = 'blur' | 'opaque' | 'transparent'

export interface SheetContentProps {
  className?: string
  children?: ReactNode
  side?: SheetSide
  /** Width preset for left/right panels. Default `md`. Escape hatch for an
   *  exact width: set `--sheet-width` on the content (e.g. via `className`
   *  SCSS or inline custom property). */
  size?: SheetSize
  /** Scrim treatment. Default `blur` (unchanged existing look). */
  backdrop?: SheetBackdrop
  /** Show the top-right close (X) button, like Dialog. Default `false`. */
  showCloseButton?: boolean
  /** Accessible name for the dialog when no `<SheetTitle>` is rendered.
   *  RAC requires either a `<Heading slot="title">` child OR aria-label /
   *  aria-labelledby on the Dialog. Pass this for chromeless drawers
   *  (e.g. MobileNavDrawer) where a visible title would be redundant. */
  'aria-label'?: string
  'aria-labelledby'?: string
  /** When false, backdrop click and Esc no longer close the sheet. Use
   *  this to guard against accidental dismissal during destructive or
   *  irreversible in-flight actions (e.g. submitting a payout). Default true. */
  isDismissable?: boolean
}

export function SheetContent({
  className,
  children,
  side = 'right',
  size = 'md',
  backdrop = 'blur',
  showCloseButton = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  isDismissable = true,
}: SheetContentProps) {
  const ctx = useContext(SheetContext)
  return (
    <RACModalOverlay
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={!isDismissable}
      data-backdrop={backdrop}
      className="klyp-Sheet__overlay"
      {...(ctx ? { isOpen: ctx.isOpen, onOpenChange: ctx.setOpen } : {})}
    >
      <RACModal
        data-side={side}
        data-size={size}
        className={
          typeof className === 'string' ? `klyp-Sheet__content ${className}` : 'klyp-Sheet__content'
        }
      >
        <RACDialog
          className="klyp-Sheet__dialog"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
        >
          {children}
          {showCloseButton ? (
            <Button
              slot={null}
              variant="secondary"
              size="icon"
              className="klyp-Sheet__close"
              aria-label="Close"
              onPress={() => ctx?.setOpen(false)}
            >
              <XOutline />
              <span className="klyp-Sheet__sr-only">Close</span>
            </Button>
          ) : null}
        </RACDialog>
      </RACModal>
    </RACModalOverlay>
  )
}

// === SheetBody =======================================================
// Scrollable content region. Header / Footer stay pinned (they don't
// flex-grow); only the body scrolls when content exceeds the panel.
// Mirrors the brand <Modal> body recipe (flex:1 + min-height:0 + overflow).
export interface SheetBodyProps extends ComponentProps<'div'> {}

export function SheetBody({ className, children, ...props }: SheetBodyProps) {
  return (
    <div
      {...props}
      className={
        typeof className === 'string' ? `klyp-Sheet__body ${className}` : 'klyp-Sheet__body'
      }
    >
      {children}
    </div>
  )
}

// === SheetHeader =====================================================
export interface SheetHeaderProps extends ComponentProps<'div'> {}

export function SheetHeader({ className, children, ...props }: SheetHeaderProps) {
  return (
    <div
      {...props}
      className={
        typeof className === 'string' ? `klyp-Sheet__header ${className}` : 'klyp-Sheet__header'
      }
    >
      {children}
    </div>
  )
}

// === SheetFooter =====================================================
export interface SheetFooterProps extends ComponentProps<'div'> {}

export function SheetFooter({ className, children, ...props }: SheetFooterProps) {
  return (
    <div
      {...props}
      className={
        typeof className === 'string' ? `klyp-Sheet__footer ${className}` : 'klyp-Sheet__footer'
      }
    >
      {children}
    </div>
  )
}

// === SheetTitle (RAC Heading slot=title) =============================
export interface SheetTitleProps extends ComponentProps<'h2'> {}

export function SheetTitle({ className, children, ...props }: SheetTitleProps) {
  return (
    <RACHeading
      slot="title"
      {...props}
      className={
        typeof className === 'string' ? `klyp-Sheet__title ${className}` : 'klyp-Sheet__title'
      }
    >
      {children}
    </RACHeading>
  )
}

// === SheetDescription ================================================
export interface SheetDescriptionProps extends ComponentProps<'p'> {}

export function SheetDescription({ className, children, ...props }: SheetDescriptionProps) {
  return (
    <p
      {...props}
      className={
        typeof className === 'string'
          ? `klyp-Sheet__description ${className}`
          : 'klyp-Sheet__description'
      }
    >
      {children}
    </p>
  )
}

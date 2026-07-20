import './Dialog.scss'

import { XOutline } from '@klyp/icons/outline'
import { Button } from '@klyp/ui/Button'
import { type ComponentProps, Fragment, type ReactNode, useContext } from 'react'
import {
  OverlayTriggerStateContext,
  Dialog as RACDialog,
  type DialogProps as RACDialogProps,
  DialogTrigger as RACDialogTrigger,
  Heading as RACHeading,
  type HeadingProps as RACHeadingProps,
  Modal as RACModal,
  ModalOverlay as RACModalOverlay,
  type ModalOverlayProps as RACModalOverlayProps,
} from 'react-aria-components'

// =====================================================================
// Dialog — Klyp canonical primitive (Phase 2 of React Aria migration)
// =====================================================================
//
// Architecture: see ../../../../MIGRATION-REACT-ARIA-2026-04-30.md §5/§6/§16
//
// RAC mapping (drop-in compat for legacy Base UI surface):
//   Legacy Dialog (Root)      -> RAC <DialogTrigger> (open-state context)
//   Legacy DialogTrigger      -> Fragment passthrough (legacy wrapper —
//                                 RAC reads the trigger from the first
//                                 child of DialogTrigger directly).
//   Legacy DialogClose        -> Button that calls state.close() via
//                                 OverlayTriggerStateContext.
//   Legacy DialogOverlay      -> styled wrapper around RAC <ModalOverlay>.
//                                 In modern callsites this is rendered
//                                 internally by DialogContent — exposed
//                                 only for backward compat.
//   Legacy DialogContent      -> RAC <ModalOverlay> + <Modal> + <Dialog>.
//                                 Accepts `showCloseButton` and renders an
//                                 optional close X via slot Button.
//   Legacy DialogHeader       -> styled <div>
//   Legacy DialogFooter       -> styled <div> with optional close button
//   Legacy DialogTitle        -> RAC <Heading slot="title">
//   Legacy DialogDescription  -> styled <p>
//
// State styling via RAC data-attrs:
//   [data-entering], [data-exiting] on Modal & ModalOverlay.

// === Dialog (Root → RAC DialogTrigger) ==============================
export interface DialogProps {
  /** Controlled open state. */
  open?: boolean
  /** Initial open state (uncontrolled). */
  defaultOpen?: boolean
  /** Open-state change handler. */
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
}

export function Dialog({ open, defaultOpen, onOpenChange, children }: DialogProps) {
  return (
    <RACDialogTrigger
      {...(open !== undefined ? { isOpen: open } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      {children}
    </RACDialogTrigger>
  )
}

// === DialogTrigger ===================================================
// Legacy wrapper — Base UI required this around the trigger element. RAC
// reads the trigger from DialogTrigger's first child directly, so we just
// pass through. Kept for drop-in compat.
export interface DialogTriggerProps {
  children?: ReactNode
  asChild?: boolean
}

/** @deprecated Pass the trigger element as a direct child of `<Dialog>`. */
export function DialogTrigger({ children }: DialogTriggerProps) {
  return <Fragment>{children}</Fragment>
}

// === DialogClose =====================================================
// Closes the surrounding dialog. Reads close() from RAC's
// OverlayTriggerStateContext (the state context DialogTrigger publishes).
export interface DialogCloseProps extends Omit<ComponentProps<typeof Button>, 'onPress'> {}

export function DialogClose({ children, className, ...props }: DialogCloseProps) {
  // OverlayTriggerStateContext typing returns `{}` in some RAC versions; we know
  // `state.close()` exists at runtime per RAC docs. Pragmatic cast.
  const state = useContext(OverlayTriggerStateContext) as { close: () => void } | null
  const close = () => state?.close()

  return (
    <Button {...props} className={className} onPress={close}>
      {children}
    </Button>
  )
}

// === DialogOverlay ===================================================
// Standalone backdrop wrapper — kept for backward compat with callers
// that mount it explicitly. Modern callsites use DialogContent which
// embeds ModalOverlay internally.
export interface DialogOverlayProps extends Omit<RACModalOverlayProps, 'className' | 'children'> {
  className?: string
  children?: ReactNode
}

export function DialogOverlay({
  className,
  children,
  isDismissable = true,
  ...props
}: DialogOverlayProps) {
  return (
    <RACModalOverlay
      {...props}
      isDismissable={isDismissable}
      className={
        typeof className === 'string' ? `klyp-Dialog__overlay ${className}` : 'klyp-Dialog__overlay'
      }
    >
      {children as ReactNode}
    </RACModalOverlay>
  )
}

// === DialogContent (RAC ModalOverlay + Modal + Dialog) ===============
//
// Two modes:
//   1. Inside a <Dialog> (= RACDialogTrigger) — open state inherited via
//      OverlayTriggerStateContext. Don't pass isOpen here.
//   2. Standalone controlled — pass isOpen + onOpenChange. The underlying
//      RAC Modal then publishes its own OverlayTriggerStateContext, so
//      <DialogClose> still works without a DialogTrigger wrapper. This is
//      the canonical RAC pattern for programmatic-mount modals; see
//      https://react-spectrum.adobe.com/react-aria/Modal.html#controlled
export interface DialogContentProps extends Omit<RACDialogProps, 'children' | 'className'> {
  className?: string
  /** Show the X close button in the top-right corner. Default: true. */
  showCloseButton?: boolean
  /** Standalone controlled mode — open state. Omit to inherit from <Dialog>. */
  isOpen?: boolean
  /** Standalone controlled mode — close handler. */
  onOpenChange?: (open: boolean) => void
  /** Click-outside-to-dismiss. Default true. */
  isDismissable?: boolean
  /**
   * Backdrop treatment behind the dialog. Default `blur`.
   * - `blur` — dimmed + background blur (the standard look).
   * - `opaque` — dimmed, no blur (cheaper over video / canvas).
   * - `transparent` — no backdrop at all.
   */
  backdrop?: 'blur' | 'opaque' | 'transparent'
  children?: ReactNode
}

export function DialogContent({
  className,
  showCloseButton = true,
  isOpen,
  onOpenChange,
  isDismissable = true,
  backdrop = 'blur',
  children,
  ...props
}: DialogContentProps) {
  const overlayProps = {
    isDismissable,
    ...(isOpen !== undefined ? { isOpen } : {}),
    ...(onOpenChange ? { onOpenChange } : {}),
  }
  return (
    <RACModalOverlay {...overlayProps} data-backdrop={backdrop} className="klyp-Dialog__overlay">
      <RACModal
        className={
          typeof className === 'string'
            ? `klyp-Dialog__content ${className}`
            : 'klyp-Dialog__content'
        }
      >
        <RACDialog {...props} className="klyp-Dialog__dialog">
          {children as ReactNode}
          {showCloseButton ? (
            <DialogClose
              variant="secondary"
              size="icon"
              className="klyp-Dialog__close"
              aria-label="Close"
            >
              <XOutline />
              <span className="klyp-Dialog__sr-only">Close</span>
            </DialogClose>
          ) : null}
        </RACDialog>
      </RACModal>
    </RACModalOverlay>
  )
}

// === DialogHeader ====================================================
export interface DialogHeaderProps extends ComponentProps<'div'> {}

export function DialogHeader({ className, children, ...props }: DialogHeaderProps) {
  return (
    <div
      {...props}
      className={
        typeof className === 'string' ? `klyp-Dialog__header ${className}` : 'klyp-Dialog__header'
      }
    >
      {children}
    </div>
  )
}

// === DialogFooter ====================================================
export interface DialogFooterProps extends ComponentProps<'div'> {
  /** Render a default "Close" button at the end of the footer. */
  showCloseButton?: boolean
}

export function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: DialogFooterProps) {
  return (
    <div
      {...props}
      className={
        typeof className === 'string' ? `klyp-Dialog__footer ${className}` : 'klyp-Dialog__footer'
      }
    >
      {children}
      {showCloseButton ? <DialogClose variant="outline">Close</DialogClose> : null}
    </div>
  )
}

// === DialogTitle (RAC Heading slot=title) ============================
export interface DialogTitleProps extends Omit<RACHeadingProps, 'className' | 'slot'> {
  className?: string
  children?: ReactNode
}

export function DialogTitle({ className, children, ...props }: DialogTitleProps) {
  return (
    <RACHeading
      slot="title"
      {...props}
      className={
        typeof className === 'string' ? `klyp-Dialog__title ${className}` : 'klyp-Dialog__title'
      }
    >
      {children}
    </RACHeading>
  )
}

// === DialogDescription ===============================================
export interface DialogDescriptionProps extends ComponentProps<'p'> {}

export function DialogDescription({ className, children, ...props }: DialogDescriptionProps) {
  return (
    <p
      {...props}
      className={
        typeof className === 'string'
          ? `klyp-Dialog__description ${className}`
          : 'klyp-Dialog__description'
      }
    >
      {children}
    </p>
  )
}

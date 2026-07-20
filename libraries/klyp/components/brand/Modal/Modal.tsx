import './Modal.scss'

import { XOutline } from '@klyp/icons/outline'
import { Button } from '@klyp/ui/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@klyp/ui/Dialog'
import { type ComponentProps, type ReactNode, useEffect, useState } from 'react'
import { Drawer } from 'vaul'

import { useBrand } from '../_brand-context'

// Snap-sheet detents (mobile `mobileSheet="snap"`). Half + full, mirroring the
// iOS sheet pattern; the modal opens at full and can be dragged down to half
// (and past it to dismiss). vaul drives the snap animation via transform.
const SHEET_SNAP_POINTS = [0.5, 1] as const

/**
 * Reactive `≤639.98px` viewport flag — same breakpoint as ui/Dialog's mobile
 * bottom-sheet switch. Only consulted when `mobileSheet="snap"`; drives whether
 * Modal renders the vaul snap sheet (mobile) or the RAC Dialog (desktop).
 */
function useIsMobileViewport(enabled: boolean): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    // Only snap modals attach a listener — every other modal stays a no-op so
    // its JS behaviour is byte-for-byte unchanged.
    if (!enabled || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(max-width: 639.98px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [enabled])
  return isMobile
}

// =====================================================================
// Modal — Klyp brand organism (Phase 3 of Tailwind → SCSS migration)
// =====================================================================
//
// Slot-based wrapper around ui/Dialog. Pass title / description / footer
// as props, body via children. For more advanced layouts use the
// underlying <Dialog> primitives directly via <Modal.Trigger> /
// <Modal.Close> below.
//
// Migration note (Phase 3): legacy `sizeMap` (Tailwind) replaced by
// `data-size` attribute resolved in Modal.scss. `cn()` removed —
// className merged manually.
// Pattern reference: ../Chip/Chip.tsx

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type ModalKind = 'modal' | 'dialog'
export type ModalAlign = 'start' | 'center'
export type ModalFooterAlign = 'start' | 'end' | 'split'

export type ModalProps = {
  /** Controlled open state. Pass undefined for uncontrolled mode (Trigger handles it). */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** What opens the modal. Pass <Modal.Trigger /> child here, or omit for controlled mode. */
  trigger?: ReactNode
  title: ReactNode
  description?: ReactNode
  /**
   * Footer slot — actions. Convention (design lead): the primary action is a
   * `<Button variant="primary">` (or `"destructive"` for destructive intent),
   * the secondary action a `<Button variant="secondary">`. Falls back to a
   * single "Close" (secondary) when omitted.
   */
  footer?: ReactNode
  /**
   * Drop the footer band entirely (no border-top, no separate background).
   * Use when actions live inside the body (e.g. sticky form footer) and the
   * modal should read as one continuous panel. Overrides `footer`.
   */
  hideFooter?: boolean
  /**
   * Surface kind. `'modal'` (default) — content / task surface, sized via
   * `size`. `'dialog'` — interruptive confirm / alert / prompt at the fixed
   * dialog width (`--modal-w-dialog`); `size` is ignored. See `ConfirmDialog`
   * for the ready-made preset.
   */
  kind?: ModalKind
  /** Width tier (kind='modal' only). Default 'md'. */
  size?: ModalSize
  /**
   * Header (and, with kind='dialog', body) alignment. `'start'` (default) —
   * left title with an optional leading `icon`. `'center'` — centered title +
   * `icon` rendered as a centered illustration above it (alert layout).
   */
  align?: ModalAlign
  /**
   * Optional header glyph / illustration. `align='start'` → leading icon
   * beside the title; `align='center'` → centered illustration above it.
   */
  icon?: ReactNode
  /**
   * Footer action alignment (desktop). `'end'` (default) — right-aligned;
   * `'start'` — left; `'split'` — equal-width buttons filling the row.
   */
  footerAlign?: ModalFooterAlign
  /** Click-outside / ESC to dismiss. Default true (RAC). */
  isDismissable?: boolean
  /**
   * Mobile presentation (`≤639.98px`). `'auto'` (default) — the RAC Dialog's
   * CSS bottom-sheet. `'snap'` — a vaul drag-to-snap bottom sheet (detents at
   * 50% / full, drag-down-to-dismiss). Snap requires CONTROLLED mode (`open` +
   * `onOpenChange`) — with a `trigger` (uncontrolled) it falls back to `'auto'`.
   * Desktop rendering is unchanged either way.
   */
  mobileSheet?: 'auto' | 'snap'
  /** Hide the default ✕ in the corner. */
  hideClose?: boolean
  className?: string
  /**
   * Optional body content. When omitted (e.g. confirmation modals where
   * the title + description carry the entire message) the body slot is
   * skipped entirely — avoids dead vertical space between description
   * and footer that the surrounding 24px gap creates around an empty
   * body element.
   */
  children?: ReactNode
}

export function Modal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  footer,
  hideFooter,
  kind = 'modal',
  size = 'md',
  align = 'start',
  icon,
  footerAlign = 'end',
  isDismissable,
  mobileSheet = 'auto',
  hideClose,
  className,
  children,
}: ModalProps) {
  const { brandId } = useBrand()
  const CLOSE_LABEL = brandId === 'unreals' ? 'Закрыть' : 'Close'
  const isMobile = useIsMobileViewport(mobileSheet === 'snap')
  const [sheetSnap, setSheetSnap] = useState<number | string | null>(
    SHEET_SNAP_POINTS[SHEET_SNAP_POINTS.length - 1],
  )
  // Snap needs controlled open state — the vaul tree has no RAC trigger context,
  // so an uncontrolled (trigger-driven) modal can't be opened inside it. Falls
  // back to the plain Dialog mobile sheet when not controlled.
  const useSnap = mobileSheet === 'snap' && isMobile && open !== undefined
  // Variants are className modifiers on `klyp-Modal__content` — the RACModal
  // element that ALSO carries `klyp-Dialog__content` (DialogContent merges our
  // className there). DialogContent spreads OTHER props (data-*) onto the inner
  // `klyp-Dialog__dialog`, so a `data-size` attribute selector would never
  // match the outer card. Hence the className-modifier contract (`&--md` etc).
  const widthClass =
    kind === 'dialog' ? 'klyp-Modal__content--dialog' : `klyp-Modal__content--${size}`
  const classes = ['klyp-Modal__content', widthClass, `klyp-Modal__content--footer-${footerAlign}`]
  if (align === 'center') classes.push('klyp-Modal__content--center')
  if (typeof className === 'string' && className.length > 0) classes.push(className)
  const contentClassName = classes.join(' ')

  // Body slot — shared by the Dialog and the vaul-sheet branches.
  const bodyNode =
    children !== undefined && children !== null ? (
      <div data-slot="modal-body" className="klyp-Modal__body">
        {children}
      </div>
    ) : null

  // Mobile snap sheet (mobileSheet="snap", controlled, ≤639.98px). A vaul Drawer
  // reusing `klyp-Modal__content` so the banded header / body / footer styling
  // applies; `--sheet` reshapes the card into a bottom-anchored sheet. Title /
  // Description map to vaul's a11y slots; the close + fallback footer button
  // drive `onOpenChange(false)` (no RAC OverlayTriggerState in the vaul tree).
  if (useSnap) {
    return (
      <Drawer.Root
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={[...SHEET_SNAP_POINTS]}
        activeSnapPoint={sheetSnap}
        setActiveSnapPoint={setSheetSnap}
        fadeFromIndex={SHEET_SNAP_POINTS.length - 1}
        {...(isDismissable !== undefined ? { dismissible: isDismissable } : {})}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="klyp-Modal__sheetOverlay" />
          <Drawer.Content className={`${contentClassName} klyp-Modal__sheet`}>
            <Drawer.Handle className="klyp-Modal__handle" />
            <div className="klyp-Dialog__header">
              <div className="klyp-Modal__headerMain">
                {align === 'center' && icon ? (
                  <span className="klyp-Modal__illustration" aria-hidden>
                    {icon}
                  </span>
                ) : null}
                <div className="klyp-Modal__titleRow">
                  {align !== 'center' && icon ? (
                    <span className="klyp-Modal__titleIcon" aria-hidden>
                      {icon}
                    </span>
                  ) : null}
                  <Drawer.Title className="klyp-Dialog__title">{title}</Drawer.Title>
                </div>
                {description ? (
                  <Drawer.Description className="klyp-Dialog__description">
                    {description}
                  </Drawer.Description>
                ) : null}
              </div>
              {hideClose ? null : (
                <Button
                  variant="secondary"
                  size="icon"
                  className="klyp-Modal__close"
                  aria-label={CLOSE_LABEL}
                  onPress={() => onOpenChange?.(false)}
                >
                  <XOutline aria-hidden />
                </Button>
              )}
            </div>
            {bodyNode}
            {hideFooter ? null : (
              <div className="klyp-Dialog__footer">
                {footer ?? (
                  <Button variant="secondary" onPress={() => onOpenChange?.(false)}>
                    {CLOSE_LABEL}
                  </Button>
                )}
              </div>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    )
  }

  // Two render modes:
  //   1. trigger absent  → standalone DialogContent (passes isOpen +
  //      onOpenChange to RAC ModalOverlay; RAC publishes its own
  //      OverlayTriggerStateContext, so DialogClose still works).
  //   2. trigger present → wrap in <Dialog> (RACDialogTrigger) which
  //      reads the trigger from its first child as usual.
  // Canonical RAC pattern: https://react-spectrum.adobe.com/react-aria/Modal.html#controlled
  const standalone = trigger === undefined
  const content = (
    <DialogContent
      showCloseButton={false}
      className={contentClassName}
      {...(isDismissable !== undefined ? { isDismissable } : {})}
      {...(standalone && open !== undefined ? { isOpen: open } : {})}
      {...(standalone && onOpenChange ? { onOpenChange } : {})}
    >
      {/* Header = flex row: [content column] [close]. The close is rendered HERE
          (not via DialogContent's absolute close, hence showCloseButton={false})
          so it's a real flex sibling — a long title wraps in its own column and
          can't run under the ✕. */}
      <DialogHeader>
        <div className="klyp-Modal__headerMain">
          {align === 'center' && icon ? (
            <span className="klyp-Modal__illustration" aria-hidden>
              {icon}
            </span>
          ) : null}
          <div className="klyp-Modal__titleRow">
            {align !== 'center' && icon ? (
              <span className="klyp-Modal__titleIcon" aria-hidden>
                {icon}
              </span>
            ) : null}
            <DialogTitle>{title}</DialogTitle>
          </div>
          {description && <DialogDescription>{description}</DialogDescription>}
        </div>
        {hideClose ? null : (
          <DialogClose
            variant="secondary"
            size="icon"
            className="klyp-Modal__close"
            aria-label={CLOSE_LABEL}
          >
            <XOutline aria-hidden />
          </DialogClose>
        )}
      </DialogHeader>
      {bodyNode}
      {hideFooter ? null : (
        <DialogFooter>
          {footer ?? <DialogClose variant="secondary">{CLOSE_LABEL}</DialogClose>}
        </DialogFooter>
      )}
    </DialogContent>
  )

  if (standalone) return content

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      {content}
    </Dialog>
  )
}

/** Optional escape hatch — render raw Dialog primitives for non-standard layouts. */
function ModalTrigger(props: ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger {...props} />
}

function ModalClose(props: ComponentProps<typeof DialogClose>) {
  return <DialogClose {...props} />
}

Modal.Trigger = ModalTrigger
Modal.Close = ModalClose

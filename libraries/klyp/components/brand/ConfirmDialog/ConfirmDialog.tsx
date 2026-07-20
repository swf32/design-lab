import './ConfirmDialog.scss'

import { Button } from '@klyp/ui/Button'
import type { ReactNode } from 'react'

import { useBrand } from '../_brand-context'
import { Modal, type ModalAlign, type ModalFooterAlign, type ModalSize } from '../Modal/Modal'

const CD_COPY = {
  klyp: { cancel: 'Cancel' },
  unreals: { cancel: 'Отмена' },
} as const

/**
 * `<ConfirmDialog>` — generic confirmation modal. Two-action footer
 * (Cancel + Confirm) over a controlled `<Modal>`. The destructive tone
 * autoFocuses Cancel as the safe default; primary tone autoFocuses
 * Confirm so Enter submits.
 *
 * Use when an action is destructive or otherwise needs an explicit "are
 * you sure" before firing — delete asset, delete board, leave without
 * saving, drop unsaved edits. Mirrors the pattern already used in
 * `apps/web/src/features/canvas-library/board-dialogs.tsx`.
 */
export type ConfirmDialogProps = {
  /** Controlled open state. */
  open: boolean
  /** Dismiss callback (Cancel, ESC, scrim click). */
  onOpenChange: (open: boolean) => void
  /** Confirm callback. Caller closes the dialog separately if needed. */
  onConfirm: () => void
  title: ReactNode
  description?: ReactNode
  confirmLabel: ReactNode
  cancelLabel?: ReactNode
  /** Visual tone of the Confirm button. Default 'destructive'. */
  tone?: 'destructive' | 'primary'
  /**
   * Header / body alignment. `'start'` (default) — left title, optional
   * leading `icon`. `'center'` — centered title + `icon` as a centered
   * illustration above it (alert layout, e.g. "Payment Failed").
   */
  align?: ModalAlign
  /** Optional glyph — leading icon (start) or centered illustration (center). */
  icon?: ReactNode
  /**
   * Footer layout. `'end'` (default) — Cancel + Confirm right-aligned;
   * `'split'` — equal-width buttons filling the row (alert style).
   */
  footerAlign?: ModalFooterAlign
  /** Show the corner ✕. Default false — a confirm forces an explicit choice. */
  hideClose?: boolean
  /** @deprecated The dialog kind owns its width (`--modal-w-dialog`); ignored. */
  size?: ModalSize
  /** Optional body slot — extra context above the footer. */
  children?: ReactNode
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'destructive',
  align = 'start',
  icon,
  footerAlign = 'end',
  hideClose = true,
  children,
}: ConfirmDialogProps) {
  const { brandId } = useBrand()
  const cancelText = cancelLabel ?? CD_COPY[brandId].cancel

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      kind="dialog"
      align={align}
      icon={icon}
      footerAlign={footerAlign}
      title={title}
      description={description}
      hideClose={hideClose}
      footer={
        <>
          {/* Secondary action = secondary variant (footer rule). autoFocus on
              Cancel for destructive tone — safe default. */}
          <Button
            variant="secondary"
            size="md"
            autoFocus={tone === 'destructive'}
            onPress={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
          <Button
            variant={tone === 'destructive' ? 'destructive' : 'primary'}
            size="md"
            autoFocus={tone === 'primary'}
            onPress={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}

export default ConfirmDialog

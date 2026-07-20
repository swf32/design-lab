import './StatusDialog.scss'

import { Button } from '@klyp/ui/Button'
import type { ComponentType, ReactNode, SVGProps } from 'react'

import { Modal, type ModalSize } from '../Modal/Modal'

// =====================================================================
// StatusDialog — Klyp brand molecule (DEV-919)
// =====================================================================
//
// A centered status / outcome dialog: tone-tinted icon, heading, an
// emphasised lead line, a muted detail line, and up to two actions.
// Built on `<Modal>` so it inherits the canonical scrim, the corner ✕,
// backdrop-click + ESC dismissal, focus trap and mobile bottom-sheet
// behaviour for free.
//
// First instance is the "Payment Failed" popup (Figma Development file,
// node 4:16) — but the component is generic: any failure / success /
// warning / info outcome that needs an explicit acknowledgement + an
// optional "Contact Support" escape hatch.
//
// Brand / design-system notes:
//  - Figma used Geist SemiBold (600) on the title + lead line; per
//    styles.md (medium/500 is the heaviest UI weight) we render the lead
//    line at medium. The title keeps the inherited Dialog weight.
//  - The Figma illustration (red filled card-with-X) maps to the outline
//    `CardRemoveOutline` glyph tinted with the `status-danger` token —
//    outline + single semantic status colour, not a bespoke multicolour
//    asset. The icon is caller-supplied so each instance picks its glyph.

export type StatusDialogTone = 'danger' | 'warning' | 'success' | 'info'

export type StatusDialogAction = {
  label: ReactNode
  onPress: () => void
  /** Button variant. Defaults by role: `primary` (solid) for the primary
   *  action, `ghost` (no rest background) for the secondary / dismissive one. */
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost'
  /**
   * Close the dialog after the action fires. Default `true`. Pass `false`
   * for actions that hand off to another surface and should leave the dialog
   * open (e.g. a "Contact Support" action that opens the chat widget — the
   * user may still need the error details behind it).
   */
  closeOnPress?: boolean
}

export type StatusDialogProps = {
  /** Controlled open state. */
  open: boolean
  /** Dismiss callback (✕, ESC, scrim click, action close). */
  onOpenChange: (open: boolean) => void
  /** Visual tone — tints the status icon. Default `'danger'`. */
  tone?: StatusDialogTone
  /** Status illustration (e.g. `CardRemoveOutline`). Tinted by `tone`. */
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  /** Heading — also the dialog's accessible title (required by Dialog). */
  title: ReactNode
  /** Emphasised lead line under the icon. */
  message?: ReactNode
  /** Muted detail line(s) under the lead line. */
  description?: ReactNode
  /** Right / emphasised action. */
  primaryAction?: StatusDialogAction
  /** Left / dismissive action. */
  secondaryAction?: StatusDialogAction
  /** Modal size. Default `'sm'`. */
  size?: ModalSize
}

function ActionButton({
  action,
  onOpenChange,
  autoFocus,
  defaultVariant,
}: {
  action: StatusDialogAction
  onOpenChange: (open: boolean) => void
  autoFocus: boolean
  defaultVariant: NonNullable<StatusDialogAction['variant']>
}) {
  const closeOnPress = action.closeOnPress ?? true
  return (
    <Button
      variant={action.variant ?? defaultVariant}
      size="md"
      autoFocus={autoFocus}
      onPress={() => {
        action.onPress()
        if (closeOnPress) onOpenChange(false)
      }}
    >
      {action.label}
    </Button>
  )
}

export function StatusDialog({
  open,
  onOpenChange,
  tone = 'danger',
  icon: Icon,
  title,
  message,
  description,
  primaryAction,
  secondaryAction,
  size = 'sm',
}: StatusDialogProps) {
  const hasFooter = Boolean(primaryAction || secondaryAction)
  // Safe default focus on the dismissive (secondary) action when present,
  // otherwise on the single primary action. Mirrors ConfirmDialog's
  // "destructive autofocuses the safe option" stance.
  const footer = hasFooter ? (
    <>
      {secondaryAction ? (
        <ActionButton
          action={secondaryAction}
          onOpenChange={onOpenChange}
          autoFocus
          defaultVariant="ghost"
        />
      ) : null}
      {primaryAction ? (
        <ActionButton
          action={primaryAction}
          onOpenChange={onOpenChange}
          autoFocus={!secondaryAction}
          defaultVariant="primary"
        />
      ) : null}
    </>
  ) : undefined

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size={size}
      className="klyp-StatusDialog"
      {...(footer ? { footer } : { hideFooter: true })}
    >
      <div className="klyp-StatusDialog__body" data-tone={tone}>
        {Icon ? (
          <span className="klyp-StatusDialog__icon" aria-hidden="true">
            <Icon />
          </span>
        ) : null}
        {message ? <p className="klyp-StatusDialog__message">{message}</p> : null}
        {description ? <p className="klyp-StatusDialog__description">{description}</p> : null}
      </div>
    </Modal>
  )
}

export default StatusDialog

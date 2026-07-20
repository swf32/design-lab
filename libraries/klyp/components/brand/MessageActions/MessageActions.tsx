/**
 * MessageActions — role-aware action toolbar shown below a chat message
 * bubble. Visibility: hover-revealed on pointer devices, always visible
 * on touch. Disabled while parent is busy/streaming.
 *
 * Action set is gated by which callbacks the caller passes (instead of
 * by an enum prop) — keeps the API flat and extensible. Role + variant
 * inputs only drive layout/visual hints (data-attrs).
 */

import './MessageActions.scss'

import {
  CheckOutline,
  CopyOutline,
  DownloadOutline,
  EditPencilOutline,
  ForwardFrameOutline,
  RotateCcwOutline,
} from '@klyp/icons/outline'
import { ToolButton } from '@klyp/ui/ToolButton'
import { Toolbar } from '@klyp/ui/Toolbar'

export type MessageRole = 'user' | 'assistant' | 'system'
export type MessageVariant = 'text' | 'image' | 'video'

export interface MessageActionsProps {
  /**
   * Message author role — `'user' | 'assistant' | 'system'`. Drives layout
   * (alignment via `data-role`) and which actions gate in (Edit on user,
   * Regenerate on assistant, Copy-only on system). NOT the ARIA `role`
   * attribute — when you set it in JSX (`<MessageActions role="assistant">`) an
   * a11y linter may flag it as an invalid ARIA role; route it through a typed
   * `MessageRole` const to silence that (see the stories).
   */
  role: MessageRole
  variant?: MessageVariant
  /** Async copy of message text content. */
  onCopyText?: () => Promise<void>
  /** Async copy of image as PNG bytes (assistant image variant only). */
  onCopyImage?: () => Promise<void>
  /** Async copy of the video URL string. Video variant only — a video can't be
   *  placed on the clipboard as bytes, so its single Copy action copies the URL
   *  (rendered with the same Copy glyph as text/image, not a distinct "link"). */
  onCopyUrl?: () => Promise<void>
  /** Download the original media file (image/video variant). */
  onDownload?: () => Promise<void> | void
  /** "Use as prompt" — caller pushes text + attachments into composer store. */
  onToPrompt?: () => void
  /** Regenerate (assistant only). */
  onRegenerate?: () => void
  /** Edit (user only). */
  onEdit?: () => void
  /**
   * @reserved Thumbs-up feedback (assistant only). Contract reserved so wiring
   * feedback later is non-breaking; NOT rendered yet (needs a Like glyph in
   * `@klyp/icons` + a backend signal — tracked as a separate task).
   */
  onFeedbackUp?: () => void
  /** @reserved Thumbs-down feedback (assistant only). Not rendered yet — see `onFeedbackUp`. */
  onFeedbackDown?: () => void
  /** @reserved Share / export the message. Not rendered yet (reserved contract). */
  onShare?: () => void
  /** @reserved Read aloud / TTS (assistant only). Not rendered yet — needs a Volume glyph + TTS backend. */
  onReadAloud?: () => void
  /** Disable all actions while parent is busy / streaming. */
  busy?: boolean
  className?: string
}

export function MessageActions({
  role,
  variant = 'text',
  onCopyText,
  onCopyImage,
  onCopyUrl,
  onDownload,
  onToPrompt,
  onRegenerate,
  onEdit,
  busy = false,
  className,
}: MessageActionsProps) {
  if (role === 'system') {
    // System messages are rare; keep the surface tiny — copy only if provided.
    if (!onCopyText) return null
    return (
      <Toolbar
        aria-label="Message actions"
        data-role={role}
        data-busy={busy ? '' : undefined}
        className={['klyp-MessageActions', className].filter(Boolean).join(' ')}
      >
        <ToolButton
          icon={CopyOutline}
          confirmIcon={CheckOutline}
          label="Copy message"
          confirmLabel="Copied"
          onPress={onCopyText}
          isDisabled={busy}
        />
      </Toolbar>
    )
  }

  return (
    <Toolbar
      aria-label="Message actions"
      data-role={role}
      data-variant={variant}
      data-busy={busy ? '' : undefined}
      className={['klyp-MessageActions', className].filter(Boolean).join(' ')}
    >
      <Toolbar.Group className="klyp-MessageActions__group--primary">
        {onCopyText ? (
          <ToolButton
            icon={CopyOutline}
            confirmIcon={CheckOutline}
            label="Copy message"
            confirmLabel="Copied"
            onPress={onCopyText}
            isDisabled={busy}
          />
        ) : null}
        {onCopyImage && variant === 'image' ? (
          <ToolButton
            icon={CopyOutline}
            confirmIcon={CheckOutline}
            label="Copy image"
            confirmLabel="Image copied"
            onPress={onCopyImage}
            isDisabled={busy}
          />
        ) : null}
        {onCopyUrl && variant === 'video' ? (
          <ToolButton
            icon={CopyOutline}
            confirmIcon={CheckOutline}
            label="Copy video"
            confirmLabel="Copied"
            onPress={onCopyUrl}
            isDisabled={busy}
          />
        ) : null}
        {onDownload && variant !== 'text' ? (
          <ToolButton
            icon={DownloadOutline}
            label="Download original"
            onPress={() => {
              void onDownload()
            }}
            isDisabled={busy}
          />
        ) : null}
        {onToPrompt ? (
          <ToolButton
            icon={ForwardFrameOutline}
            label="Insert in prompt"
            onPress={onToPrompt}
            isDisabled={busy}
          />
        ) : null}
      </Toolbar.Group>

      {(onRegenerate && role === 'assistant') || (onEdit && role === 'user') ? (
        <Toolbar.Group className="klyp-MessageActions__group--secondary">
          {onRegenerate && role === 'assistant' ? (
            <ToolButton
              icon={RotateCcwOutline}
              label="Regenerate"
              onPress={onRegenerate}
              isDisabled={busy}
            />
          ) : null}
          {onEdit && role === 'user' ? (
            <ToolButton icon={EditPencilOutline} label="Edit" onPress={onEdit} isDisabled={busy} />
          ) : null}
        </Toolbar.Group>
      ) : null}
    </Toolbar>
  )
}

export default MessageActions

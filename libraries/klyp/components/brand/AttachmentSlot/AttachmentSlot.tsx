import './AttachmentSlot.scss'

import {
  CloseCircleOutline,
  FileAudioGlyph,
  FileDocGlyph,
  FileFolderGlyph,
  FileImageGlyph,
  FileSheetGlyph,
  FileVideoGlyph,
  GalleryAddGlyph,
  InfoCircleOutline,
  VideoOutline,
} from '@klyp/icons'
import { Tooltip, TooltipContent } from '@klyp/ui/Tooltip'
import type { ComponentType, DragEvent, ReactNode, Ref, SVGProps } from 'react'
import { useState } from 'react'
import { Focusable } from 'react-aria-components'
import { CdnImage } from '../CdnImage'

// =====================================================================
// AttachmentSlot — Klyp brand molecule.
// =====================================================================
//
// One cell, five render states, no remount of the thumbnail across
// model / mode / badge / status changes. The root is ALWAYS a layout
// <div className="klyp-AttachmentSlot">; the visual carrier is `&__cell`,
// which switches element + `data-state`:
//
//   empty-pill | empty-square → <button>  (DropSlot empty look)
//   image                     → <div>     (VideoRef tile, <img> + fallback)
//   video                     → <div>     (VideoRef tile, <video> + fallback)
//   file                      → <div>     (256×80 attachment card)
//
// State is derived from props (resolveState); the filled cell keeps a
// stable position so switching model (badge / status changes while the
// state stays image/video) never remounts the <img>/<video>.

export type AttachmentSlotShape = 'pill' | 'square'
export type AttachmentSlotStatus = 'idle' | 'uploading' | 'error' | 'warning'
export type AttachmentSlotMedia = 'image' | 'video'
export type AttachmentSlotKind =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'doc'
  | 'xls'
  | 'txt'
  | 'document'
  | 'file'

/** File-card footer label per kind. PDF/DOC/XLS share a silhouette → text disambiguates. */
const KIND_LABEL: Record<AttachmentSlotKind, string> = {
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  pdf: 'PDF',
  doc: 'DOC',
  xls: 'XLS',
  txt: 'TXT',
  document: 'Doc',
  file: 'File',
}

/** Maps each file kind to its shared glyph. pdf/doc/txt/document share the
 *  document silhouette; text disambiguates (see KIND_LABEL). */
const KIND_GLYPH: Record<AttachmentSlotKind, ComponentType<SVGProps<SVGSVGElement>>> = {
  image: FileImageGlyph,
  video: FileVideoGlyph,
  audio: FileAudioGlyph,
  pdf: FileDocGlyph,
  doc: FileDocGlyph,
  xls: FileSheetGlyph,
  txt: FileDocGlyph,
  document: FileDocGlyph,
  file: FileFolderGlyph,
}

type ResolvedState = 'empty-pill' | 'empty-square' | 'image' | 'video' | 'file'

export interface AttachmentSlotProps {
  // ── content / value ──────────────────────────────────────────────
  /** Image thumbnail or video first-frame poster URL. Presence promotes the slot to a filled tile. */
  thumbnailUrl?: string
  /** Filled-tile media kind. 'video' → <video> poster + auto "Video" badge; 'image' (default) → <img>. */
  media?: AttachmentSlotMedia
  /** Display name. Required for the file card (no thumbnailUrl); also drives remove/replace aria. */
  name?: string
  /** File-card kind → footer label + glyph. Read only in the file branch. Default 'file'. */
  fileKind?: AttachmentSlotKind

  // ── presentation ─────────────────────────────────────────────────
  /** Empty footprint: 'pill' (~40px row) | 'square' (80×80). Ignored once filled. Default 'pill'. */
  shape?: AttachmentSlotShape
  /** Overlay badge text on filled tiles ("Start" | "End" | "Ref 1"). Video forces "Video" when omitted. */
  badge?: string
  /** Empty-slot label (pill "Reference"; square "Start"). Omit → icon-only.
   *  On an `addFormats` "add" cell this reads as the caption (e.g. the dynamic
   *  "Up to 7 images"). */
  label?: string
  /** Override the built-in empty glyph (gallery+plus duotone). */
  icon?: ReactNode
  /** Empty-square "add" cell only: the accepted file KINDS. When set, the cell
   *  widens (2:1) and shows the real format glyphs (image / video / audio /
   *  document) splayed — instead of a generic "+". `label` stays the action word
   *  ("Add"); `addCaption` is the requirements line below it. */
  addFormats?: readonly AttachmentSlotKind[]
  /** "Add" cell requirements caption (e.g. "Up to 8 images or 3 videos") —
   *  rendered dim, below the `label`. */
  addCaption?: string

  // ── status ───────────────────────────────────────────────────────
  /** Lifecycle: 'uploading' dims + spinner; 'error' red ring; 'warning' neutral ring. Default 'idle'. */
  status?: AttachmentSlotStatus
  /** Error/warning caption below the cell + native title tooltip. */
  message?: string

  // ── behaviour ────────────────────────────────────────────────────
  /** Empty-state activation → open picker / file dialog. */
  onClick?: () => void
  /** Empty-state per-slot drop target. Files dropped ON this cell are routed
   *  here (frame Start/End slots) instead of bubbling to the field drop-zone;
   *  the cell paints a dashed highlight while a file hovers. Empty cells only. */
  onDrop?: (files: File[]) => void
  /** Remove this attachment. Renders the × button (filled states). */
  onRemove?: () => void
  /** Click-to-swap THIS slot's asset. Full-tile overlay — IMAGE state only. */
  onReplace?: () => void

  disabled?: boolean
  ariaLabel?: string
  className?: string
  /** React 19 ref-as-prop — forwards to the root. */
  ref?: Ref<HTMLDivElement>
}

function resolveState(
  thumbnailUrl: string | undefined,
  name: string | undefined,
  media: AttachmentSlotMedia | undefined,
  shape: AttachmentSlotShape,
): ResolvedState {
  // Empty: nothing to show — no thumb, no name, no explicit media kind.
  if (!thumbnailUrl && !name && !media) {
    return shape === 'square' ? 'empty-square' : 'empty-pill'
  }
  // A thumbnail OR an explicit media kind → tile (image/video). `media` wins
  // over `name`: an uploading frame/ref image (media set, name set, thumb not
  // ready) stays a tile with the fallback glyph + keeps its Start/End badge —
  // it must NOT collapse into the file card and drop the badge.
  if (thumbnailUrl || media) return media === 'video' ? 'video' : 'image'
  // Name only (no media) → file attachment card (per-file-type glyph).
  return 'file'
}

export function AttachmentSlot({
  thumbnailUrl,
  media,
  name,
  fileKind = 'file',
  shape = 'pill',
  badge,
  label,
  icon,
  status = 'idle',
  message,
  onClick,
  onRemove,
  onReplace,
  onDrop,
  addFormats,
  addCaption,
  disabled,
  ariaLabel,
  className,
  ref,
}: AttachmentSlotProps) {
  const state = resolveState(thumbnailUrl, name, media, shape)
  const rootClass = ['klyp-AttachmentSlot', className].filter(Boolean).join(' ')
  const isEmpty = state === 'empty-pill' || state === 'empty-square'
  const KindGlyph = KIND_GLYPH[fileKind]

  // Per-slot drop (empty cells only). `stopPropagation` in handleDrop keeps the
  // drop from also bubbling to the PromptField <section> drop-zone (double-add).
  const [dragOver, setDragOver] = useState(false)
  const dropEnabled = !!onDrop && !disabled
  const isFileDrag = (e: DragEvent) => Array.from(e.dataTransfer.types).includes('Files')
  const handleDragOver = (e: DragEvent) => {
    if (!dropEnabled || !isFileDrag(e)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (!dragOver) setDragOver(true)
  }
  const handleDragLeave = () => {
    if (dragOver) setDragOver(false)
  }
  const handleDrop = (e: DragEvent) => {
    if (!dropEnabled) return
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    onDrop?.(Array.from(e.dataTransfer.files))
  }

  const removeButton = onRemove ? (
    <button
      type="button"
      className="klyp-AttachmentSlot__remove"
      onClick={onRemove}
      aria-label={`Remove ${name ?? 'attachment'}`}
      disabled={disabled}
    >
      <CloseCircleOutline width={10} height={10} aria-hidden="true" />
    </button>
  ) : null

  const spinner =
    status === 'uploading' ? (
      <span className="klyp-AttachmentSlot__spinner" aria-hidden="true" />
    ) : null

  // Error / warning indicator — a small corner badge (same footprint as the
  // remove ×) that is ALWAYS visible when there's a message. Hover / focus pops
  // a toned tooltip (red for error, amber for warning) carrying the full text,
  // so the message never takes row space or shoves the neighbouring tiles. The
  // icon is the InfoCircle glyph — a circle mark that pairs with the × corner.
  const statusBadge =
    (status === 'error' || status === 'warning') && message ? (
      <Tooltip delay={0}>
        <Focusable>
          <button
            type="button"
            className="klyp-AttachmentSlot__status"
            data-status={status}
            aria-label={message}
          >
            <InfoCircleOutline width={12} height={12} aria-hidden="true" />
          </button>
        </Focusable>
        <TooltipContent side="top" tone={status === 'error' ? 'danger' : 'warning'} maxWidth={220}>
          {message}
        </TooltipContent>
      </Tooltip>
    ) : null

  return (
    <div className={rootClass} ref={ref} data-shape={shape} data-disabled={disabled || undefined}>
      {isEmpty ? (
        <button
          type="button"
          className="klyp-AttachmentSlot__cell"
          data-state={state}
          data-add={addFormats && addFormats.length > 0 ? '' : undefined}
          data-dragover={dropEnabled && dragOver ? '' : undefined}
          disabled={disabled}
          onClick={disabled ? undefined : onClick}
          onDragEnter={dropEnabled ? handleDragOver : undefined}
          onDragOver={dropEnabled ? handleDragOver : undefined}
          onDragLeave={dropEnabled ? handleDragLeave : undefined}
          onDrop={dropEnabled ? handleDrop : undefined}
          aria-label={ariaLabel ?? label}
        >
          {addFormats && addFormats.length > 0 ? (
            // "Add" cell — the real accepted-format glyphs (splayed like the
            // composer's media stack) instead of a generic "+".
            <span className="klyp-AttachmentSlot__addFormats" data-count={addFormats.length}>
              {addFormats.map((fmt) => {
                const FmtGlyph = KIND_GLYPH[fmt]
                return (
                  <span key={fmt} className="klyp-AttachmentSlot__addFormat">
                    <FmtGlyph width={22} height={22} aria-hidden="true" />
                  </span>
                )
              })}
            </span>
          ) : (
            <span className="klyp-AttachmentSlot__glyph">
              {icon ?? (
                <GalleryAddGlyph
                  width={shape === 'square' ? 24 : 20}
                  height={shape === 'square' ? 24 : 20}
                  aria-hidden="true"
                />
              )}
            </span>
          )}
          {label ? <span className="klyp-AttachmentSlot__label">{label}</span> : null}
          {addCaption ? (
            <span className="klyp-AttachmentSlot__addCaption">{addCaption}</span>
          ) : null}
        </button>
      ) : state === 'file' ? (
        <div
          className="klyp-AttachmentSlot__cell"
          data-state="file"
          data-status={status}
          data-kind={fileKind}
        >
          <span className="klyp-AttachmentSlot__fileName">{name}</span>
          <span className="klyp-AttachmentSlot__fileFooter">
            <span aria-hidden="true" className="klyp-AttachmentSlot__kindIcon">
              <KindGlyph width={24} height={24} />
            </span>
            <span className="klyp-AttachmentSlot__kindLabel">{KIND_LABEL[fileKind]}</span>
          </span>
          {spinner}
          {statusBadge}
          {removeButton}
        </div>
      ) : (
        <div className="klyp-AttachmentSlot__cell" data-state={state} data-status={status}>
          {state === 'video' ? (
            thumbnailUrl ? (
              <video
                src={thumbnailUrl}
                className="klyp-AttachmentSlot__thumb"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <span className="klyp-AttachmentSlot__thumbFallback">
                <VideoOutline width={20} height={20} aria-hidden="true" />
              </span>
            )
          ) : thumbnailUrl ? (
            // R2 thumbs get the 160w CDN transform; blob:/data: local previews
            // don't match cdnBase and pass through untouched.
            <CdnImage
              src={thumbnailUrl}
              alt=""
              size="chip"
              className="klyp-AttachmentSlot__thumb"
            />
          ) : (
            <span className="klyp-AttachmentSlot__thumbFallback">
              <GalleryAddGlyph width={24} height={24} aria-hidden="true" />
            </span>
          )}
          {spinner}
          {state === 'image' && onReplace && status !== 'uploading' ? (
            <button
              type="button"
              className="klyp-AttachmentSlot__replace"
              onClick={onReplace}
              aria-label={`Replace ${name ?? 'attachment'}`}
              disabled={disabled}
            />
          ) : null}
          {badge || state === 'video' ? (
            <span className="klyp-AttachmentSlot__badge">{badge ?? 'Video'}</span>
          ) : null}
          {statusBadge}
          {removeButton}
        </div>
      )}
    </div>
  )
}

export default AttachmentSlot

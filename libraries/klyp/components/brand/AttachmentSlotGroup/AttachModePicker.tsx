import './AttachModePicker.scss'

import {
  CloseCircleOutline,
  FileAudioGlyph,
  FileDocGlyph,
  FileImageGlyph,
  FileVideoGlyph,
} from '@klyp/icons'
import type { ComponentType, DragEvent as ReactDragEvent, Ref, SVGProps } from 'react'
import { useState } from 'react'
import type { MediaAttachKind } from '../MediaAttachTrigger'

// =====================================================================
// AttachModePicker — split-panel mode chooser (composer takeover surface).
// =====================================================================
//
// Replaces the mode DROPDOWN: while a multi-mode model's slot row is empty and
// the chooser is active (a pill click OR a file dragged over the composer), the
// whole composer becomes one dashed panel per mode (Start&End frames |
// References …) plus a narrow Cancel block. Each panel shows the media KINDS it
// accepts (splayed file glyphs), the mode name, and a short caption — so the
// modes explain themselves.
//
// DRAG MODEL (important): the panels do NOT own the drop. They only report
// which one the cursor is over (`onHoverTarget`) + a local highlight; the DROP
// is handled once at the field level (PromptField) so the field's drag counter
// stays balanced (dragging a file back OUT reliably dismisses the surface) and
// the drop never double-fires. `onPick` handles clicks. Presentational.

/** Sentinel target id for the Cancel block — the field's drop handler treats a
 *  drop on it as "back out" (discard, don't attach). */
export const CANCEL_ID = '__cancel'

const KIND_ICON: Record<MediaAttachKind, ComponentType<SVGProps<SVGSVGElement>>> = {
  image: FileImageGlyph,
  video: FileVideoGlyph,
  audio: FileAudioGlyph,
  document: FileDocGlyph,
}
const KIND_ORDER: readonly MediaAttachKind[] = ['image', 'video', 'audio', 'document']

export interface AttachModePanel {
  /** Stable id passed back to `onPick` (e.g. 'frames'). */
  id: string
  /** Mode name (e.g. "Start & End frames"). */
  label: string
  /** Short explanation under the label (e.g. "First + last keyframe"). */
  caption?: string
  /** Media kinds this mode accepts — drives the glyph splay + drag compat. */
  mediaTypes: readonly MediaAttachKind[]
  disabled?: boolean
}

export interface AttachModePickerProps {
  panels: readonly AttachModePanel[]
  /** Click a panel → pick that mode. */
  onPick: (id: string) => void
  /** Report the panel the cursor is dragging over (`null` = none), plus whether
   *  the dragged kind fits it — the field's single drop handler routes by this. */
  onHoverTarget?: (target: string | null, compatible: boolean) => void
  /** Warning caption shown while an INCOMPATIBLE file is dragged over a panel. */
  incompatibleLabel?: (accepted: readonly MediaAttachKind[]) => string
  /** Renders the Cancel block (right side) — click OR drop on it to back out. */
  onCancel?: () => void
  cancelLabel?: string
  /** Panel id to SHAKE (a file was dropped on it but its kind isn't accepted).
   *  A one-shot reject animation; the host clears it + dismisses after a beat. */
  rejectedPanel?: string
  disabled?: boolean
  className?: string
  ref?: Ref<HTMLDivElement>
}

/** Left→right ordered glyph tiles with the splay positions (mirrors the
 *  collapsed MediaAttachTrigger stack). */
function arrange(kinds: readonly MediaAttachKind[]) {
  const ordered = KIND_ORDER.filter((k) => kinds.includes(k)).slice(0, 3)
  if (ordered.length <= 1) return ordered.map((kind) => ({ kind, pos: 'solo' as const }))
  if (ordered.length === 2)
    return [
      { kind: ordered[0], pos: 'left' as const },
      { kind: ordered[1], pos: 'right' as const },
    ]
  const centerKind = ordered.includes('image') ? 'image' : ordered[1]
  const sides = ordered.filter((k) => k !== centerKind)
  return [
    { kind: sides[0], pos: 'left' as const },
    { kind: centerKind, pos: 'center' as const },
    { kind: sides[1], pos: 'right' as const },
  ]
}

/** Media kind of a drag payload from its MIME prefix (null = unknown). */
function kindFromMime(mime: string): MediaAttachKind | null {
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  return null
}

export function AttachModePicker({
  panels,
  onPick,
  onHoverTarget,
  incompatibleLabel,
  onCancel,
  cancelLabel = 'Cancel',
  rejectedPanel,
  disabled,
  className,
  ref,
}: AttachModePickerProps) {
  // Which target is under a drag, and whether the dragged kind fits it.
  const [drag, setDrag] = useState<{ id: string; ok: boolean } | null>(null)
  const rootClass = ['klyp-AttachModePicker', className].filter(Boolean).join(' ')

  // Shared per-target drag wiring — NO stopPropagation (the field's counter must
  // stay balanced so a drag-back-out dismisses the surface). preventDefault so
  // the drop is allowed. Reports the hovered target up for the field's drop.
  const dragProps = (id: string, ok: boolean) => ({
    onDragOver: (e: ReactDragEvent<HTMLButtonElement>) => {
      if (disabled) return
      e.preventDefault()
      e.dataTransfer.dropEffect = ok ? 'copy' : 'none'
      setDrag({ id, ok })
      onHoverTarget?.(id, ok)
    },
    onDragLeave: () => {
      setDrag((d) => (d?.id === id ? null : d))
    },
  })

  return (
    <div className={rootClass} ref={ref} data-count={panels.length}>
      {panels.map((panel) => {
        const tiles = arrange(panel.mediaTypes)
        const isDragging = drag?.id === panel.id
        const incompatible = isDragging && !drag.ok
        const panelDisabled = disabled || panel.disabled
        // A drag whose kind we can't read (empty items list) counts as OK.
        const okFor = (k: MediaAttachKind | null) => k == null || panel.mediaTypes.includes(k)

        return (
          <button
            key={panel.id}
            type="button"
            className="klyp-AttachModePicker__panel"
            disabled={panelDisabled}
            data-dragover={isDragging && drag.ok ? '' : undefined}
            data-incompatible={incompatible ? '' : undefined}
            data-reject={rejectedPanel === panel.id ? '' : undefined}
            onClick={() => onPick(panel.id)}
            onDragOver={(e) => {
              if (panelDisabled) return
              const k = kindFromMime(e.dataTransfer.items?.[0]?.type ?? '')
              dragProps(panel.id, okFor(k)).onDragOver(e)
            }}
            onDragLeave={dragProps(panel.id, true).onDragLeave}
            aria-label={panel.caption ? `${panel.label} — ${panel.caption}` : panel.label}
          >
            <span aria-hidden className="klyp-AttachModePicker__stack" data-count={tiles.length}>
              {tiles.map((t) => {
                const Glyph = KIND_ICON[t.kind]
                return (
                  <span key={t.kind} className="klyp-AttachModePicker__tile" data-pos={t.pos}>
                    <Glyph width={24} height={24} aria-hidden />
                  </span>
                )
              })}
            </span>
            <span className="klyp-AttachModePicker__label">{panel.label}</span>
            <span className="klyp-AttachModePicker__caption">
              {incompatible
                ? (incompatibleLabel?.(panel.mediaTypes) ?? 'Not supported here')
                : panel.caption}
            </span>
          </button>
        )
      })}

      {onCancel ? (
        <button
          type="button"
          className="klyp-AttachModePicker__cancel"
          disabled={disabled}
          data-dragover={drag?.id === CANCEL_ID ? '' : undefined}
          onClick={onCancel}
          onDragOver={dragProps(CANCEL_ID, true).onDragOver}
          onDragLeave={dragProps(CANCEL_ID, true).onDragLeave}
          aria-label={cancelLabel}
        >
          <CloseCircleOutline width={20} height={20} aria-hidden />
          <span className="klyp-AttachModePicker__cancelLabel">{cancelLabel}</span>
        </button>
      ) : null}
    </div>
  )
}

export default AttachModePicker

import './MediaAttachTrigger.scss'

import { FileAudioGlyph, FileDocGlyph, FileImageGlyph, FileVideoGlyph } from '@klyp/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@klyp/ui/DropdownMenu'
import type { ComponentType, DragEvent as ReactDragEvent, Ref, SVGProps } from 'react'
import { useRef, useState } from 'react'

// =====================================================================
// MediaAttachTrigger — Klyp brand "meta" attach entry point.
// =====================================================================
//
// The single empty-state affordance that REPLACES the per-mode empty pills
// (Start frame / End frame / "Reference up to N") in the composer. It is
// media-aware: given the media KINDS a model accepts, it renders a splayed
// stack of file-type glyphs (1 → straight, 2 → ±10°, 3 → centre nudged up +
// sides nudged down + ±10°) plus a human-readable label. Clicking it opens a
// dropdown to pick the attach MODE
// (Start&End frames / Reference / …); a file dropped on it fires `onDropFiles`
// and the caller still resolves the mode.
//
// PURE PRESENTATIONAL — like AttachmentSlotGroup, capability resolution
// (which kinds, which modes) stays at the caller (the chat feature reads it
// from `getVideoImageCapability` + the model registry). This component never
// touches the model metadata itself.

export type MediaAttachKind = 'image' | 'video' | 'audio' | 'document'

// Bespoke duotone file-type glyphs (NOT the generic outline icons) — each is
// already a "media card + mark" (dim silhouette + bright content), so no tile
// chrome is needed behind them.
const KIND_ICON: Record<MediaAttachKind, ComponentType<SVGProps<SVGSVGElement>>> = {
  image: FileImageGlyph,
  video: FileVideoGlyph,
  audio: FileAudioGlyph,
  document: FileDocGlyph,
}

/** Canonical left→right kind order for the stack. */
const KIND_ORDER: readonly MediaAttachKind[] = ['image', 'video', 'audio', 'document']

export interface MediaAttachMode {
  /** Stable id passed back to `onSelectMode` (e.g. 'frames' | 'reference'). */
  id: string
  /** Human dropdown-item label (e.g. "Start & End frames"). */
  label: string
  /** Optional second line under the label in the dropdown. */
  description?: string
}

type StackTile = { kind: MediaAttachKind; pos: 'solo' | 'left' | 'center' | 'right' }

/** Arrange the accepted kinds into splay positions. 3 → the primary (image
 *  when present, else the middle) sits raised in the centre; the rest fan out
 *  to the sides. */
function arrangeStack(kinds: readonly MediaAttachKind[]): StackTile[] {
  // Cap at 3 glyphs — the splay layout is designed for 1–3 (a 4th kind would
  // have no position). Callers pass the ≤3 most representative kinds.
  const ordered = KIND_ORDER.filter((k) => kinds.includes(k)).slice(0, 3)
  if (ordered.length <= 1) return ordered.map((kind) => ({ kind, pos: 'solo' }) as StackTile)
  if (ordered.length === 2) {
    return [
      { kind: ordered[0], pos: 'left' },
      { kind: ordered[1], pos: 'right' },
    ]
  }
  const centerKind = ordered.includes('image') ? 'image' : ordered[1]
  const sides = ordered.filter((k) => k !== centerKind)
  return [
    { kind: sides[0], pos: 'left' },
    { kind: centerKind, pos: 'center' },
    { kind: sides[1], pos: 'right' },
  ]
}

export interface MediaAttachTriggerProps {
  /** Media kinds this model accepts — drives the splayed icon stack. */
  mediaTypes: readonly MediaAttachKind[]
  /** Attach modes offered on click. One mode → click selects it directly (no
   *  dropdown); two+ → the dropdown opens so the user picks a mode first. */
  modes: readonly MediaAttachMode[]
  /** Fired when a mode is chosen (dropdown item or single-mode click). */
  onSelectMode: (modeId: string) => void
  /** Files dropped directly on the trigger. The caller still resolves the
   *  mode (open the dropdown / default to the first mode). Omit to disable
   *  per-trigger drop (the composer-level dropzone still works). */
  onDropFiles?: (files: File[]) => void
  /** Row label. When omitted, derived as "Add <mode a> or <mode b>". */
  label?: string
  /** Controlled dropdown open state (multi-mode only). Lets the caller open the
   *  mode menu programmatically — e.g. after a file is dropped on the composer,
   *  the mode still has to be picked. Omit → uncontrolled. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** When set, the pill is a PLAIN button that calls this on click (no
   *  dropdown) — used as the collapsed entry that expands into the split-panel
   *  `AttachModePicker`. Takes precedence over the `modes` dropdown. */
  onActivate?: () => void
  disabled?: boolean
  className?: string
  /** React 19 ref-as-prop — forwards to the root wrapper. */
  ref?: Ref<HTMLDivElement>
}

export function MediaAttachTrigger({
  mediaTypes,
  modes,
  onSelectMode,
  onDropFiles,
  label,
  open,
  onOpenChange,
  onActivate,
  disabled,
  className,
  ref,
}: MediaAttachTriggerProps) {
  const [dragOver, setDragOver] = useState(false)
  const dragDepth = useRef(0)

  if (mediaTypes.length === 0) return null
  // `onActivate` mode needs no `modes` (it just expands the picker).
  if (!onActivate && modes.length === 0) return null

  const tiles = arrangeStack(mediaTypes)
  const resolvedLabel = label ?? `Add ${modes.map((m) => m.label).join(' or ')}`
  const single = modes.length === 1
  const rootClass = ['klyp-MediaAttachTrigger', className].filter(Boolean).join(' ')

  // ── Per-trigger drop (composer also has a field-wide dropzone) ───────────
  const canDrop = !!onDropFiles && !disabled
  const onDragEnter = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!canDrop) return
    e.preventDefault()
    dragDepth.current += 1
    if (e.dataTransfer.types.includes('Files')) setDragOver(true)
  }
  const onDragLeave = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!canDrop) return
    e.preventDefault()
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setDragOver(false)
    }
  }
  const onDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!canDrop) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }
  const onDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!canDrop) return
    e.preventDefault()
    dragDepth.current = 0
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) onDropFiles?.(files)
  }

  const inner = (
    <>
      <span aria-hidden className="klyp-MediaAttachTrigger__stack" data-count={tiles.length}>
        {tiles.map((t) => {
          const Glyph = KIND_ICON[t.kind]
          return (
            <span key={t.kind} className="klyp-MediaAttachTrigger__tile" data-pos={t.pos}>
              <Glyph width={26} height={26} aria-hidden />
            </span>
          )
        })}
      </span>
      <span className="klyp-MediaAttachTrigger__label">{resolvedLabel}</span>
    </>
  )

  const wrapProps = {
    ref,
    className: rootClass,
    'data-disabled': disabled || undefined,
    'data-dragover': dragOver || undefined,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
  }

  // Collapsed entry → a plain button that expands into the split-panel picker
  // (no dropdown). Takes precedence over the single/multi dropdown branches.
  if (onActivate) {
    return (
      <div {...wrapProps}>
        <button
          type="button"
          className="klyp-MediaAttachTrigger__button"
          disabled={disabled}
          aria-label={resolvedLabel}
          onClick={onActivate}
        >
          {inner}
        </button>
      </div>
    )
  }

  // One mode → the trigger IS the action (no menu to disambiguate).
  if (single) {
    return (
      <div {...wrapProps}>
        <button
          type="button"
          className="klyp-MediaAttachTrigger__button"
          disabled={disabled}
          aria-label={resolvedLabel}
          onClick={() => onSelectMode(modes[0].id)}
        >
          {inner}
        </button>
      </div>
    )
  }

  return (
    <div {...wrapProps}>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger
          className="klyp-MediaAttachTrigger__button"
          isDisabled={disabled}
          aria-label={resolvedLabel}
        >
          {inner}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start">
          {modes.map((m) => (
            <DropdownMenuItem key={m.id} onAction={() => onSelectMode(m.id)}>
              <span className="klyp-MediaAttachTrigger__modeLabel">{m.label}</span>
              {m.description ? (
                <span className="klyp-MediaAttachTrigger__modeDesc">{m.description}</span>
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default MediaAttachTrigger

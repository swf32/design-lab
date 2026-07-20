import './AttachmentSlotGroup.scss'

import { AddOutline, FileImageGlyph, SwapOutline } from '@klyp/icons'
import { Button } from '@klyp/ui'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import type { ReactNode, Ref } from 'react'
import {
  AttachmentSlot,
  type AttachmentSlotKind,
  type AttachmentSlotStatus,
} from '../AttachmentSlot'
import { type MediaAttachKind, MediaAttachTrigger } from '../MediaAttachTrigger'
import type { AttachModePanel } from './AttachModePicker'

export type { AttachModePanel, AttachModePickerProps } from './AttachModePicker'
export { CANCEL_ID } from './AttachModePicker'

// =====================================================================
// AttachmentSlotGroup — Klyp brand layouter.
// =====================================================================
//
// Composes N `AttachmentSlot` CELLS into the three VideoRef layouts —
// frames / reference / list — plus the video-clip lane, the start↔end
// swap, and the add-dropzone. Pure presentational: capability resolution
// (supportsImageInput / effective max) stays at the caller; the Group
// takes the already-resolved `mode` + `max`.
//
// Tiles ARE keyed AttachmentSlot cells (`key={item.id}`) → mode / badge /
// status changes never remount the <img>/<video>. All tile / pill / badge
// / spinner / remove / status-ring styling is INHERITED from
// AttachmentSlot.scss — this file adds only the flex-row chrome.

export type AttachmentMode = 'frames' | 'reference' | 'list'

export interface AttachmentItem {
  id: string
  thumbnailUrl?: string
  media?: 'image' | 'video'
  name?: string
  fileKind?: AttachmentSlotKind
  status?: AttachmentSlotStatus
  message?: string
  /** Explicit badge override; else derived (Start / End / Ref N). */
  badge?: string
  /** Frames-mode render hint: which keyframe slot this item occupies (0 = Start,
   *  1 = End). Consumed ONLY by the frames branch — reference / list ignore it.
   *  `undefined` falls back to positional fill (back-compat). */
  slot?: number
}

export interface AttachmentSlotGroupLabels {
  /** Empty-slot PILL text — descriptive (e.g. "Start frame"). */
  start: string
  end: string
  /** Filled-tile + empty-square BADGE text — short (e.g. "Start"). */
  startBadge: string
  endBadge: string
  reference: string
  referenceUpTo: (n: number) => string
  add: string
  refIndex: (n: number) => string
  swapAria: string
  removeAria: string
  replaceAria: string
  uploadAria: (label: string) => string
  videoClip: string
}

export const DEFAULT_LABELS: AttachmentSlotGroupLabels = {
  start: 'Start frame',
  end: 'End frame',
  startBadge: 'Start',
  endBadge: 'End',
  reference: 'Reference',
  referenceUpTo: (n) => `Reference (up to ${n})`,
  add: 'Add',
  refIndex: (n) => `Ref ${n}`,
  swapAria: 'Swap start and end',
  removeAria: 'Remove',
  replaceAria: 'Replace',
  uploadAria: (label) => `Upload ${label}`,
  videoClip: 'Video',
}

/** Empty-state mode chooser config (multi-mode models). Collapsed = a pill
 *  (media icons + summary label); expanded = the split-panel `AttachModePicker`
 *  (one dashed panel per mode). Fully controlled by the container. */
export interface AttachmentSlotChooser {
  /** Collapsed pill: media kinds (icon splay) + optional summary label. */
  mediaTypes: readonly MediaAttachKind[]
  label?: string
  /** Expanded split-panel modes. */
  panels: readonly AttachModePanel[]
  /** Expanded = the mode picker is shown (pill click). For MULTI-mode this is
   *  the composer-level split-panel overlay; for SINGLE-mode there are no panels
   *  to pick, so `expanded` instead reveals the slot layout right here. */
  expanded: boolean
  onExpandedChange: (expanded: boolean) => void
  /** Only ONE attach mode (frames-only OR reference-only, and optional). The
   *  collapsed pill expands straight to the slots (no panel picker / overlay). */
  singleMode?: boolean
  /** Pick a mode (panel click). */
  onPick: (panelId: string) => void
  /** Report the mode panel a drag is over (or CANCEL_ID / null) — the composer
   *  routes its single field-level drop by this. */
  onHoverTarget?: (target: string | null, compatible: boolean) => void
  /** Back out of the chooser — Cancel block click / drop. */
  onCancel?: () => void
  cancelLabel?: string
  /** Panel id to shake (incompatible-file drop) — cleared by the host. */
  rejectedPanel?: string
  /** Warning caption for an incompatible drag over a panel. */
  incompatibleLabel?: (accepted: readonly MediaAttachKind[]) => string
}

export interface AttachmentSlotGroupProps {
  mode: AttachmentMode
  items: AttachmentItem[]
  /** Explicit cap — NEVER hardcode. `max <= 0` renders nothing. */
  max: number
  /** Frames only; default 2. */
  frameSlots?: 1 | 2
  videoClips?: AttachmentItem[]
  /** Non-media attachments (PDF / Office / text / audio) rendered as a file-card
   *  lane (each item self-resolves to a card via `fileKind`, never an <img>).
   *  On video models these are incompatible inputs; the caller supplies the
   *  per-file warning via `status: 'warning'` + `message`. Removed via `onRemove`. */
  otherFiles?: AttachmentItem[]
  /** Media-aware mode chooser for the EMPTY state of a multi-mode model
   *  (Start&End ↔ Reference). When provided AND every lane is empty, the group
   *  renders the chooser — a collapsed pill that expands into the split-panel
   *  `AttachModePicker` — INSTEAD of the bare empty pills, and crossfades to the
   *  slot layout once a slot fills. Omit → the group shows its empty pills
   *  directly (single-mode models). */
  chooser?: AttachmentSlotChooser
  /** Accepted file KINDS for the "Add" cell — renders the real format glyphs
   *  (image / video / audio / document) + widens it to 2:1, instead of a bare
   *  "+". Omit → the legacy "+" Add tile. */
  addFormats?: readonly AttachmentSlotKind[]
  /** Dynamic "Add" requirements caption — receives the FILLED counts (images,
   *  videos) so it can state remaining capacity for BOTH, e.g. "Up to 7 images
   *  or 3 videos". The cell keeps the "Add" action word above it. Omit → no
   *  caption. */
  addCaption?: (imagesFilled: number, videosFilled: number) => string
  /** Caption under the EMPTY Start/End / Reference squares when the model
   *  requires a media input (e.g. "(required)"). Omit → none. */
  requiredCaption?: string
  labels?: Partial<AttachmentSlotGroupLabels>
  /** Opens the picker (caller routes the effective mode). */
  onAdd?: () => void
  onRemove?: (id: string) => void
  onReplace?: (id: string) => void
  /** Frames two-filled → start↔end swap. Omit to hide the swap button. */
  onSwap?: () => void
  /** Frames only — files dropped on an EMPTY Start/End cell. `slotIndex` is the
   *  0-based keyframe slot the file should fill. Omit to disable per-slot drop. */
  onDropToSlot?: (slotIndex: number, files: File[]) => void
  onRemoveClip?: (id: string) => void
  disabled?: boolean
  className?: string
  /** React 19 ref-as-prop — forwards to the root. */
  ref?: Ref<HTMLDivElement>
}

export function AttachmentSlotGroup({
  mode,
  items,
  max,
  frameSlots,
  videoClips,
  otherFiles,
  chooser,
  addFormats,
  addCaption,
  requiredCaption,
  labels,
  onAdd,
  onRemove,
  onReplace,
  onSwap,
  onDropToSlot,
  onRemoveClip,
  disabled,
  className,
  ref,
}: AttachmentSlotGroupProps) {
  const reduce = useReducedMotion()
  // G2 — any mode whose effective cap is 0 renders nothing.
  if (max <= 0) return null

  const L = { ...DEFAULT_LABELS, ...labels }
  const slots = frameSlots ?? 2
  const frameLabel = (i: number) => (slots >= 2 ? (i === 0 ? L.start : L.end) : L.start)
  // Short BADGE text (filled tile + square placeholder). Pills keep the
  // descriptive frameLabel; tiles + squares use the short badge.
  const frameBadge = (i: number) =>
    slots >= 2 ? (i === 0 ? L.startBadge : L.endBadge) : L.startBadge

  const rootClass = ['klyp-AttachmentSlotGroup', className].filter(Boolean).join(' ')

  const slotNodes: ReactNode[] = []

  if (mode === 'frames') {
    // Render BY slot, not by array position. Each item carries `slot` (0 = Start,
    // 1 = End) from the composer's effective-slot derivation; a single image
    // swapped to End now visibly moves to the End cell. Build a fixed-length
    // `bySlot` so empty/filled cells render in slot order regardless of array
    // order. Defensive: items with an out-of-range / colliding / undefined slot
    // fall back to positional fill of the still-free cells (so a drifted slot
    // never drops a tile).
    const bySlot: (AttachmentItem | undefined)[] = Array.from({ length: slots })
    const leftovers: AttachmentItem[] = []
    for (const it of items) {
      const s = it.slot
      if (typeof s === 'number' && s >= 0 && s < slots && !bySlot[s]) bySlot[s] = it
      else leftovers.push(it)
    }
    for (const it of leftovers) {
      const free = bySlot.findIndex((cell) => !cell)
      if (free === -1) break // more images than slots → over-cap extras (submit guards count)
      bySlot[free] = it
    }

    for (let i = 0; i < slots; i++) {
      const it = bySlot[i]
      if (it) {
        slotNodes.push(
          <AttachmentSlot
            key={it.id}
            media={it.media ?? 'image'}
            thumbnailUrl={it.thumbnailUrl}
            name={it.name}
            badge={it.badge ?? frameBadge(i)}
            status={it.status}
            message={it.message}
            disabled={disabled}
            onRemove={onRemove ? () => onRemove(it.id) : undefined}
            onReplace={onReplace ? () => onReplace(it.id) : undefined}
            ariaLabel={it.name ?? frameLabel(i)}
          />,
        )
      } else {
        // Empty cell — ALWAYS a square (Val 2026-07-05: the little Start/End
        // pills read poorly; match the filled 80px tiles). Image glyph + short
        // Start/End badge + optional "(required)" caption. Per-slot drop wires
        // onto empty cells only (filled tiles replace via onReplace).
        const lbl = frameLabel(i)
        slotNodes.push(
          <AttachmentSlot
            key={`__empty-${i}`}
            shape="square"
            icon={<FileImageGlyph width={24} height={24} aria-hidden="true" />}
            label={frameBadge(i)}
            addCaption={requiredCaption}
            onClick={onAdd}
            onDrop={onDropToSlot ? (files) => onDropToSlot(i, files) : undefined}
            disabled={disabled}
            ariaLabel={L.uploadAria(lbl)}
          />,
        )
      }
      // Swap injection — after slot 0, whenever the 2-slot frame layout can swap
      // (≥1 filled): even Start-only / End-only can swap to the other cell.
      if (i === 0 && slots >= 2 && onSwap && (bySlot[0] || bySlot[1])) {
        slotNodes.push(
          <Button
            key="__swap"
            variant="secondary"
            size="icon-sm"
            aria-label={L.swapAria}
            isDisabled={disabled}
            onPress={onSwap}
            className="klyp-AttachmentSlotGroup__swap"
          >
            <SwapOutline width={16} height={16} aria-hidden="true" />
          </Button>,
        )
      }
    }
  } else if (mode === 'reference') {
    items.forEach((it, i) => {
      slotNodes.push(
        <AttachmentSlot
          key={it.id}
          media={it.media ?? 'image'}
          thumbnailUrl={it.thumbnailUrl}
          name={it.name}
          badge={it.badge ?? L.refIndex(i + 1)}
          status={it.status}
          message={it.message}
          disabled={disabled}
          onRemove={onRemove ? () => onRemove(it.id) : undefined}
          onReplace={onReplace ? () => onReplace(it.id) : undefined}
          ariaLabel={it.name ?? L.refIndex(i + 1)}
        />,
      )
    })
    if (items.length < max) {
      slotNodes.push(
        <AttachmentSlot
          key="__ref-add"
          shape="square"
          addFormats={addFormats}
          addCaption={requiredCaption ?? addCaption?.(items.length, videoClips?.length ?? 0)}
          icon={<AddOutline width={18} height={18} aria-hidden="true" />}
          onClick={onAdd}
          disabled={disabled}
          ariaLabel={L.uploadAria(L.add)}
        />,
      )
    }
  } else {
    // LIST — file-attachment lane; each item self-resolves to card / image / video.
    items.forEach((it) => {
      slotNodes.push(
        <AttachmentSlot
          key={it.id}
          media={it.media}
          thumbnailUrl={it.thumbnailUrl}
          name={it.name}
          fileKind={it.fileKind}
          badge={it.badge}
          status={it.status}
          message={it.message}
          disabled={disabled}
          onRemove={onRemove ? () => onRemove(it.id) : undefined}
          onReplace={onReplace ? () => onReplace(it.id) : undefined}
          ariaLabel={it.name}
        />,
      )
    })
    if (onAdd) {
      slotNodes.push(
        <AttachmentSlot
          key="__list-add"
          shape="square"
          label={L.add}
          icon={<AddOutline width={18} height={18} aria-hidden="true" />}
          onClick={onAdd}
          disabled={disabled}
          ariaLabel={L.uploadAria(L.add)}
        />,
      )
    }
  }

  // Empty across every lane → a multi-mode model shows its `chooser`
  // (MediaAttachTrigger) here instead of the bare pills; filling any slot
  // crossfades to the slot layout below. Single-mode models pass no chooser
  // and fall straight to the slot layout (empty pills).
  const allEmpty =
    items.length === 0 && (videoClips?.length ?? 0) === 0 && (otherFiles?.length ?? 0) === 0
  const showChooser = !!chooser && allEmpty
  const fade = { duration: reduce ? 0 : 0.18, ease: 'easeOut' as const }

  // Collapsed chooser pill ↔ slot layout. MULTI-mode's expanded picker is a
  // composer-level overlay (rendered elsewhere), so a multi chooser stays
  // 'collapsed' here. A SINGLE-mode chooser, once expanded, reveals the slots
  // right here (no panels to pick).
  const branch: 'collapsed' | 'slots' =
    showChooser && !(chooser.singleMode && chooser.expanded) ? 'collapsed' : 'slots'

  return (
    <motion.div
      // Height tween only matters for the chooser↔slots swap — gate it on
      // `chooser` so every other AttachmentSlotGroup consumer is untouched.
      layout={!!chooser && !reduce}
      className={rootClass}
      ref={ref}
      data-mode={mode}
      data-disabled={disabled || undefined}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={branch}
          className={branch === 'slots' ? 'klyp-AttachmentSlotGroup__lanes' : undefined}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fade}
        >
          {branch === 'collapsed' && chooser ? (
            <MediaAttachTrigger
              mediaTypes={chooser.mediaTypes}
              modes={[]}
              label={chooser.label}
              onSelectMode={() => undefined}
              onActivate={() => chooser.onExpandedChange(true)}
              disabled={disabled}
            />
          ) : (
            <>
              <div className="klyp-AttachmentSlotGroup__row">{slotNodes}</div>
              {videoClips?.length ? (
                <div className="klyp-AttachmentSlotGroup__clips">
                  {videoClips.map((clip) => (
                    <AttachmentSlot
                      key={clip.id}
                      media="video"
                      thumbnailUrl={clip.thumbnailUrl}
                      name={clip.name}
                      badge={L.videoClip}
                      status={clip.status}
                      message={clip.message}
                      disabled={disabled}
                      onRemove={onRemoveClip ? () => onRemoveClip(clip.id) : undefined}
                      ariaLabel={clip.name ?? L.videoClip}
                    />
                  ))}
                </div>
              ) : null}
              {otherFiles?.length ? (
                <div className="klyp-AttachmentSlotGroup__files">
                  {otherFiles.map((f) => (
                    <AttachmentSlot
                      key={f.id}
                      media={f.media}
                      thumbnailUrl={f.thumbnailUrl}
                      name={f.name}
                      fileKind={f.fileKind}
                      badge={f.badge}
                      status={f.status}
                      message={f.message}
                      disabled={disabled}
                      onRemove={onRemove ? () => onRemove(f.id) : undefined}
                      ariaLabel={f.name}
                    />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

export default AttachmentSlotGroup

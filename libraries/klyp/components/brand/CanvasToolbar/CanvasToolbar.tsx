import {
  // Hint marker group — best-available substitutes (see commit body)
  // - "text"  → MaximizeOutline (placeholder for future TextOutline)
  // - "arrow" → ArrowDownOutline (rotated -90deg via SCSS)
  // - "thumb" → MagicStarOutline (placeholder for future ThumbUpOutline)
  ArrowDownOutline,
  // Pointer group
  ArrowLeftOutline,
  // Marker group
  EditPencilOutline,
  FrameOutline,
  HandOutline,
  MagicStarOutline,
  MaximizeOutline,
  StickyNoteOutline,
} from '@klyp/icons'
import { ToolButton } from '@klyp/ui'
import './CanvasToolbar.scss'

import type { ComponentType, Ref, SVGProps } from 'react'

// =====================================================================
// CanvasToolbar — Klyp brand atom (Stage 3 of canvas-mvp)
// =====================================================================
//
// Floating bottom-centre toolbar for the canvas editor (CANVAS-SPEC-2026-
// 05-08 §5 — Layout/UI item 2). Houses three button groups + an accent
// CTA:
//
//   • Pointer  : Select / Pan
//   • Markers  : Sticky note / Draw / Frame
//   • Hints    : Text / Arrow / Thumb-up
//   • Primary  : + Create  (opens node-type picker)
//
// State of the active mode is owned by the parent (xyflow board page);
// this atom is purely controlled. Each mode button toggles itself off
// when re-clicked while active (mutually exclusive across all three
// groups — only one tool at a time, per spec).
//
// Composition tier: Brand atom (composes @klyp/ui ToolButton +
//                   bare HTML <button> for the accent CTA — Button
//                   primitive's `primary` variant doesn't render the
//                   pill chrome we want here, see SCSS comments).
// Spec ref:        CANVAS-SPEC-2026-05-08.md §5 (Layout) + §6 (Shortcuts).

export type ToolbarMode =
  | 'select'
  | 'pan'
  | 'sticky'
  | 'draw'
  | 'frame'
  | 'text'
  | 'arrow'
  | 'thumb'
  | null

export interface CanvasToolbarProps {
  /** Currently active mode. `null` = no tool engaged. */
  activeMode?: ToolbarMode
  /** Called when a mode button is clicked. Re-clicking the active mode passes `null`. */
  onModeChange?: (mode: ToolbarMode) => void
  /** Called when the `+ Create` accent button is clicked. */
  onCreate?: () => void
  /** Disable every interactive control (read-only / unauthorised state). */
  disabled?: boolean
  /** Forwarded ref — React 19 ref-as-prop, no `forwardRef`. */
  ref?: Ref<HTMLDivElement>
}

type IconType = ComponentType<SVGProps<SVGSVGElement>>

interface ButtonDef {
  mode: NonNullable<ToolbarMode>
  Icon: IconType
  /** Tooltip + aria-label. */
  label: string
  /** Optional keyboard hint shown alongside the label (CANVAS-SPEC §6). */
  shortcut?: string
  /** Marks the arrow button so SCSS can rotate the down-glyph -90deg. */
  rotateArrow?: boolean
}

// Group definitions are static — no allocation per render.
const POINTER_GROUP: ButtonDef[] = [
  { mode: 'select', Icon: ArrowLeftOutline, label: 'Select', shortcut: 'V' },
  { mode: 'pan', Icon: HandOutline, label: 'Pan / Move', shortcut: 'H' },
]

const MARKER_GROUP: ButtonDef[] = [
  { mode: 'sticky', Icon: StickyNoteOutline, label: 'Sticky note' },
  { mode: 'draw', Icon: EditPencilOutline, label: 'Draw' },
  { mode: 'frame', Icon: FrameOutline, label: 'Frame' },
]

const HINT_GROUP: ButtonDef[] = [
  { mode: 'text', Icon: MaximizeOutline, label: 'Text label' },
  // ArrowDownOutline is rotated -90° via SCSS (data-rotate-arrow) — there's
  // no dedicated arrow-connector outline glyph in @klyp/icons today.
  { mode: 'arrow', Icon: ArrowDownOutline, label: 'Arrow', rotateArrow: true },
  { mode: 'thumb', Icon: MagicStarOutline, label: 'Thumb up' },
]

export function CanvasToolbar({
  activeMode,
  onModeChange,
  onCreate,
  disabled,
  ref,
}: CanvasToolbarProps) {
  const renderGroup = (group: ButtonDef[], groupKey: string) => (
    <div key={groupKey} className="klyp-CanvasToolbar__group" role="group">
      {group.map((b) => {
        const isActive = activeMode === b.mode
        const tooltipLabel = b.shortcut ? `${b.label} (${b.shortcut})` : b.label
        return (
          <ToolButton
            key={b.mode}
            icon={b.Icon}
            label={tooltipLabel}
            variant={isActive ? 'subtle' : 'ghost'}
            size="md"
            isDisabled={disabled}
            data-active={isActive || undefined}
            data-rotate-arrow={b.rotateArrow || undefined}
            aria-pressed={isActive}
            onPress={() => onModeChange?.(isActive ? null : b.mode)}
          />
        )
      })}
    </div>
  )

  return (
    <div
      ref={ref}
      className="klyp-CanvasToolbar"
      role="toolbar"
      aria-label="Canvas tools"
      data-disabled={disabled || undefined}
    >
      {renderGroup(POINTER_GROUP, 'pointer')}
      <span className="klyp-CanvasToolbar__divider" aria-hidden />
      {renderGroup(MARKER_GROUP, 'markers')}
      <span className="klyp-CanvasToolbar__divider" aria-hidden />
      {renderGroup(HINT_GROUP, 'hints')}
      <span className="klyp-CanvasToolbar__divider" aria-hidden />
      <button
        type="button"
        className="klyp-CanvasToolbar__create"
        onClick={onCreate}
        disabled={disabled}
        aria-label="Create node"
      >
        <span className="klyp-CanvasToolbar__createPlus" aria-hidden>
          +
        </span>
        <span>Create</span>
      </button>
    </div>
  )
}

export default CanvasToolbar

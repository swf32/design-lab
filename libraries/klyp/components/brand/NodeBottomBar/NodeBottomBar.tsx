import './NodeBottomBar.scss'

import type { ComponentProps, ReactNode } from 'react'

// =====================================================================
// NodeBottomBar — Klyp brand molecule (Canvas Phase D, 2026-05-12)
// =====================================================================
//
// Slot-based bottom action strip for canvas nodes. Lives INSIDE the node
// body (not over it) — provides a consistent layout for the per-node
// generation toolbar: optional batch stepper, model / aspect / resolution
// chips, settings icon, and the required primary action (▶ run).
//
// Layout (mockup v6.3, design lead 2026-05-12):
//
//   [stepper] [chip] [chip] [settings] [..................] [action ▶]
//
// Cleanup C3 (design lead 2026-05-12, Audit A finding #3): single-child slot
// wrappers (`__stepper`, `__settings`, `__action`) удалены — слоты
// рендерятся inline. Только `__chips` остался обёрткой т.к. он
// variadic (2+ chip-кнопок в одном слоте требуют общего flex parent
// с собственным gap). Action автоматически пинуется к правому краю
// через `margin-inline-start: auto` на последнем child (см. .scss).
//
// Why slot-based, not prop-bag: each node varies which controls it
// renders (Image has count stepper + aspect chip; Video has model +
// resolution chips, no stepper; Assistant has model + export chip).
// Passing pre-composed React children keeps the strip dumb and lets the
// node decide its own toolbar without the molecule sprouting `hasStepper`
// / `aspectRatio` props that pollute the API.
//
// Composition tier: Brand molecule (uses canvas semantic tokens).
// Spec ref:        CANVAS-SPEC-2026-05-08.md §6 (Generate flow + chips).
// Mockup ref:      .research/canvas-research-2026-05-10/CARD-DESIGN-MOCKUP-v6.html
// Pattern ref:     NodeFrame (sibling brand atom).

export interface NodeBottomBarProps extends Omit<ComponentProps<'div'>, 'children'> {
  /**
   * Stepper slot — e.g. `[ − x1 + ]` for batch generation count.
   * Optional; omitted on nodes that don't support batching (Video, Assistant).
   * Rendered inline (no wrapper). Caller must give it its own flex layout
   * if multi-child (see ImageGenerator stepper pattern).
   */
  stepperSlot?: ReactNode
  /**
   * Chips slot — model picker, aspect ratio, resolution, etc.
   * Variadic — pass a fragment of chips. Wrapped in `__chips` so children
   * share a horizontal flex layout with intra-slot gap.
   */
  chipsSlot?: ReactNode
  /**
   * Settings icon button slot — opens the per-node settings popover (⚙).
   * Optional; rendered inline (no wrapper).
   */
  settingsSlot?: ReactNode
  /**
   * Primary action slot — the generation trigger (▶ play). Required:
   * this is the whole reason a bottom bar exists on a node. Rendered
   * inline with `margin-inline-start: auto` pinning it to the right edge.
   */
  actionSlot: ReactNode
}

export function NodeBottomBar({
  stepperSlot,
  chipsSlot,
  settingsSlot,
  actionSlot,
  className,
  ...rest
}: NodeBottomBarProps) {
  return (
    <div
      data-slot="node-bottom-bar"
      className={
        typeof className === 'string' ? `klyp-NodeBottomBar ${className}` : 'klyp-NodeBottomBar'
      }
      {...rest}
    >
      {stepperSlot}
      {chipsSlot ? <div className="klyp-NodeBottomBar__chips">{chipsSlot}</div> : null}
      {settingsSlot}
      {actionSlot}
    </div>
  )
}

export default NodeBottomBar

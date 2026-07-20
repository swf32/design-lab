import './NodeFrame.scss'

import type { ReactNode, Ref } from 'react'

// =====================================================================
// NodeFrame — Klyp brand atom (Stage 3 of canvas-mvp)
// =====================================================================
//
// Visual container for every canvas node — Text Prompt, Image Generator,
// Video Generation, Reference, Sticky, etc. Holds the title, optional
// icon + status pill, body slot, and footer slot.
//
// v3 (2026-05-12) — mockup v6.3 approved by design lead:
//   - Outer radius 12 → 20px (new `--r-panel` token, distinct from
//     the generic `--r-card` (12px) which stays for AssetCard etc).
//   - Selected border: gold → white 10% (single-accent rule — N selected
//     nodes on a busy canvas can't all be gold without diluting).
//   - 4px node-class color strip REMOVED. Class is communicated via the
//     header icon + handle-icon palette instead. Cleanup C3 (2026-05-12):
//     the now-unused `nodeClass` prop был removed (0 callers, deprecated
//     since v3 batch3).
//   - Generating state: native border goes transparent so callers can
//     wrap with `<SnakeBorder state="generating" glow>` to paint the
//     animated gold ring. Pulse keyframe retired.
//
// v2 (2026-05-11) — cinematic image-first cards. Two layout variants:
//
//   - `card-padded` (default) — content inside 16px padding with rounded
//     surface. For Text Prompt and other text-based nodes.
//   - `image-fills` — content edge-to-edge (no inner padding/border), so
//     the media itself becomes the card. For ImageGenerator (when result),
//     VideoGeneration (when result), Reference, LibraryReference.
//
// Chrome (header + footer) is hidden on idle and fades in on hover or
// when the node is `selected` — keeps the canvas cinematic instead of
// engineer-flavoured.
//
// Composition tier: Brand atom (uses canvas semantic tokens).
// Spec ref:        CANVAS-SPEC-2026-05-08.md §4 (Node Attributes), §8
//                  (Generation flow — animated border colors).
//                  EXPLAIN-RU.md section 7 (NodeFrame v2 proposal).
// Pattern ref:     ../Chip/Chip.tsx (data-attribute variant resolution).

/** Type-driven icon accent (kept for backwards compat with v1 callsites). */
export type NodeFrameVariant = 'text' | 'image' | 'video' | 'audio' | 'media' | 'marker'
export type NodeFrameState = 'default' | 'hovered' | 'selected' | 'generating' | 'error' | 'done'
/** Layout shape — v2 (2026-05-11). */
export type NodeFrameLayout = 'card-padded' | 'image-fills'

export interface NodeFrameProps {
  /** Display title shown in the header (sentence case, English). */
  title: string
  /** Type-driven accent (icon color hint). Default = `text`. */
  variant?: NodeFrameVariant
  /** Visual state. Default = `default`. */
  state?: NodeFrameState
  /**
   * Layout variant (v2). `card-padded` is the default — content gets the
   * standard 16px padding and rounded surface. `image-fills` makes the
   * body edge-to-edge so an image / video preview becomes the card.
   */
  layout?: NodeFrameLayout
  /** Optional icon slot rendered before the title. */
  iconSlot?: ReactNode
  /** Optional status pill / button slot rendered at the end of the header. */
  statusSlot?: ReactNode
  /** Optional footer slot (e.g. settings strip, action buttons). */
  footerSlot?: ReactNode
  /**
   * v3.2 (design lead 2026-05-12 punch-list Fix 5) — hides the header row entirely.
   * Used by Text Prompt nodes (mockup v6.3): just textarea + 1 handle, no
   * icon + title chrome. `title` still required for a11y (aria-label).
   */
  headerless?: boolean
  /** Body content (prompt input, output preview, etc.). */
  children?: ReactNode
  /** Forwarded ref — React 19 ref-as-prop, no `forwardRef`. */
  ref?: Ref<HTMLDivElement>
}

export function NodeFrame({
  title,
  variant = 'text',
  state = 'default',
  layout = 'card-padded',
  iconSlot,
  statusSlot,
  footerSlot,
  headerless = false,
  children,
  ref,
}: NodeFrameProps) {
  // v3.2 (design lead 2026-05-12 punch-list Fix 5): headerless mode pulls the title
  // into aria-label (no visible header text). Two render branches вместо
  // одного div + conditional attrs — biome's a11y rule `useAriaPropsSupportedByRole`
  // не понимает динамический role и валит build, если aria-label / role
  // условны на одном элементе.
  const body = (
    <>
      {children !== undefined && children !== null ? (
        <div className="klyp-NodeFrame__body">{children}</div>
      ) : null}
      {footerSlot ? <div className="klyp-NodeFrame__footer">{footerSlot}</div> : null}
    </>
  )

  if (headerless) {
    return (
      <div
        ref={ref}
        className="klyp-NodeFrame"
        data-variant={variant}
        data-state={state}
        data-layout={layout}
        data-headerless=""
        role="group"
        aria-label={title}
      >
        {body}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className="klyp-NodeFrame"
      data-variant={variant}
      data-state={state}
      data-layout={layout}
    >
      <div className="klyp-NodeFrame__header">
        {iconSlot ? <span className="klyp-NodeFrame__icon">{iconSlot}</span> : null}
        <span className="klyp-NodeFrame__title">{title}</span>
        {statusSlot ? <span className="klyp-NodeFrame__status">{statusSlot}</span> : null}
      </div>
      {body}
    </div>
  )
}

export default NodeFrame

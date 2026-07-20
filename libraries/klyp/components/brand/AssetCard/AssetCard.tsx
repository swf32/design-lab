import './AssetCard.scss'

import { CheckOutline } from '@klyp/icons/outline'
import type { ReactNode, Ref } from 'react'

import { CdnImage } from '../CdnImage'

/**
 * `<AssetCard>` — unified Tier 4 brand molecule for entity-tile surfaces:
 * Series, Episodes, Scenes, and Library assets (Character, Location,
 * Outfit, Vibe).
 *
 * Anatomy (image-bleed pattern):
 *   ┌──────────────────────────┐
 *   │ [TypePill] (chip+blur)   │ ← top of content stack
 *   │                          │
 *   │   image full-bleed       │ ← <img object-fit:cover> covers whole card
 *   │   ░░░░ mask fade ░░░░    │ ← image masked to transparent at bottom 20%
 *   │ Title (clamp 1)          │ ← overlay, container-query sized
 *   │ Description (clamp 1-2)  │
 *   │           [actionsSlot]  │ ← optional, top-right
 *   │ [dragHandle]             │ ← optional, top-left
 *   └──────────────────────────┘
 *
 * Aspect ratio is forced 3/4. Width is fluid (100% of parent). Height
 * derived via `aspect-ratio`. Container queries drive inner sizing across
 * three breakpoints (xs <200, sm 200–339, md ≥340).
 *
 * @see Creator Platform/.claude/rules/components.md
 * @see ARCHITECTURE.md sec 5 (Asset model)
 */

// ============================================================================
//  Types
// ============================================================================

export type AssetCardKind =
  | 'series'
  | 'episode'
  | 'scene'
  | 'character'
  | 'location'
  | 'outfit'
  | 'vibe'
  | 'script'
  | 'prop'
  | 'shot'

export type AssetCardStyle = 'bleed' | 'classic'

export type AssetCardProps = {
  /** Card discriminator — drives type-pill colour + default label. */
  kind: AssetCardKind

  /** Primary heading inside the card. */
  title: string

  /** Optional secondary line (clamped to 1–2 lines depending on container width). */
  description?: string

  /** Cover image URL — when omitted, a brand gradient placeholder renders. */
  coverUrl?: string

  /** Layout style. `bleed` (default) = image-full-bleed + gradient overlay. `classic` = legacy thumb+meta split. */
  style?: AssetCardStyle

  /** Optional explicit type-pill label override. Default = humanised `kind`. */
  typeLabel?: string

  /** Hide the type-pill entirely (used when surrounding context already conveys type). */
  hideTypePill?: boolean

  /** Click handler. When provided, root renders as `<button>`; otherwise `<div>`. */
  onClick?: () => void

  /** Slot for absolute-positioned drag handle (top-left). When occupied, card click is disabled. */
  dragHandle?: ReactNode

  /** Slot for absolute-positioned secondary actions (top-right). Studio context only. */
  actionsSlot?: ReactNode

  /** Slot for the favourite toggle (top-left). Independent of `dragHandle` —
   *  Library v2 surfaces use it as an always-visible bookmark affordance.
   *  When BOTH this and `dragHandle` are set, the favourite wins (drag
   *  handle hides) — drag context is for Studio surfaces where favourite
   *  doesn't apply anyway, so the collision is theoretical. */
  favouriteSlot?: ReactNode

  /** Loading skeleton state (hides text + pill, shows shimmer). */
  loading?: boolean

  /** When true, hover-actions are hidden; checkbox overlay shown top-left. */
  selectionMode?: boolean

  /** When in selection mode, current toggle state for the checkbox visual + outline. */
  selected?: boolean

  /** When in selection mode, called instead of `onClick` on root tap/click. */
  onSelectToggle?: () => void

  /** Pulse just the cover image area (keeps text/pill legible during async cover swap). */
  coverLoading?: boolean

  /** Soft-deleted entity — paints a 50% opacity wash + "Archived" chip overlay. */
  archived?: boolean

  className?: string
  ref?: Ref<HTMLButtonElement | HTMLDivElement>
}

// ============================================================================
//  Component
// ============================================================================

export function AssetCard({
  kind,
  title,
  description,
  coverUrl,
  style = 'bleed',
  typeLabel,
  hideTypePill,
  onClick,
  dragHandle,
  actionsSlot,
  favouriteSlot,
  loading,
  selectionMode,
  selected,
  onSelectToggle,
  coverLoading,
  archived,
  className,
  ref,
}: AssetCardProps) {
  const handleRootClick = () => {
    if (selectionMode) {
      onSelectToggle?.()
      return
    }
    onClick?.()
  }
  const hasClick =
    (Boolean(onClick) || (selectionMode && Boolean(onSelectToggle))) && !dragHandle && !loading
  const rootClass = typeof className === 'string' ? `klyp-AssetCard ${className}` : 'klyp-AssetCard'

  const showPill = !hideTypePill && !loading
  const resolvedLabel = typeLabel ?? humaniseKind(kind)

  const inner = (
    <>
      {/* Layer 1 — image (or placeholder when no cover). Rendered directly,
          no wrapper div, so DOM stays minimal: root → image → content →
          ::after border. The bottom-fade "gradient overlay" effect is
          done via CSS `mask-image` on the image itself (no separate DOM
          node). */}
      {coverUrl ? (
        <CdnImage
          src={coverUrl}
          alt={title}
          size="card"
          className="klyp-AssetCard__image"
          data-cover-loading={coverLoading || undefined}
        />
      ) : (
        <div
          aria-hidden
          className="klyp-AssetCard__placeholder"
          data-kind={kind}
          data-cover-loading={coverLoading || undefined}
        />
      )}

      {!loading ? (
        <div className="klyp-AssetCard__content">
          {showPill ? (
            <span className="klyp-AssetCard__typePill" data-kind={kind}>
              <span aria-hidden className="klyp-AssetCard__typePillDot" />
              <span className="klyp-AssetCard__typePillLabel">{resolvedLabel}</span>
            </span>
          ) : null}
          <h3 className="klyp-AssetCard__title">{title}</h3>
          {/* Always-rendered description preserves vertical rhythm across
              mixed-content rows — empty cards keep the type-pill anchored
              at the same Y as cards with copy. NBSP fallback so layout
              reserves a line of space without showing visible text. */}
          <p className="klyp-AssetCard__description" aria-hidden={description ? undefined : true}>
            {description ?? ' '}
          </p>
        </div>
      ) : (
        <div aria-hidden className="klyp-AssetCard__skeleton" />
      )}

      {selectionMode ? (
        <div
          className="klyp-AssetCard__selectionMark"
          data-selected={selected || undefined}
          aria-hidden
        >
          {selected ? (
            <CheckOutline width={14} height={14} />
          ) : (
            <span className="klyp-AssetCard__selectionMark__empty" />
          )}
        </div>
      ) : null}

      {favouriteSlot && !selectionMode ? (
        <div className="klyp-AssetCard__favouriteSlot">{favouriteSlot}</div>
      ) : dragHandle ? (
        <div className="klyp-AssetCard__dragSlot">{dragHandle}</div>
      ) : null}
      {actionsSlot && !selectionMode ? (
        <div className="klyp-AssetCard__actionsSlot">{actionsSlot}</div>
      ) : null}
    </>
  )

  const dataset = {
    'data-slot': 'asset-card',
    'data-kind': kind,
    'data-style': style,
    'data-loading': loading ? 'true' : 'false',
    'data-interactive': hasClick ? 'true' : 'false',
    'data-selection-mode': selectionMode || undefined,
    'data-selected': selected || undefined,
    'data-archived': archived || undefined,
  } as const

  if (hasClick) {
    // Render as <div role="button"> not <button> so nested interactive
    // children (CardActions hover-overlay buttons) produce valid HTML.
    // Native <button> inside <button> triggers React hydration errors
    // and silently breaks the inner button's click events.
    // Keyboard parity: Enter / Space mirror onClick (matches native button).
    const handleKeyDown = (e: import('react').KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleRootClick()
      }
    }
    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        role="button"
        tabIndex={0}
        onClick={handleRootClick}
        onKeyDown={handleKeyDown}
        className={rootClass}
        aria-label={title}
        {...dataset}
      >
        {inner}
      </div>
    )
  }

  return (
    <div ref={ref as Ref<HTMLDivElement>} className={rootClass} {...dataset}>
      {inner}
    </div>
  )
}

// ============================================================================
//  Helpers
// ============================================================================

const KIND_LABELS: Record<AssetCardKind, string> = {
  series: 'Series',
  episode: 'Episode',
  scene: 'Scene',
  character: 'Character',
  location: 'Location',
  outfit: 'Outfit',
  vibe: 'Vibe',
  script: 'Script',
  prop: 'Prop',
  shot: 'Shot',
}

function humaniseKind(kind: AssetCardKind): string {
  return KIND_LABELS[kind] ?? 'Asset'
}

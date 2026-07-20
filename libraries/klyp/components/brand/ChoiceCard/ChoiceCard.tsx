/**
 * ChoiceCard — square 1:1 cinematic-style card for any selection step
 * in the creation wizard (mode pick, entry pick, vibe / cast / director /
 * genre, etc).
 *
 * Visual language is taken from `<AssetCard>` (image-bleed + mask-fade +
 * inset border via ::after + content overlay at the bottom). The two
 * deliberate departures:
 *
 *   1. **Square** (1:1) instead of 3:4 — fits a 4-up grid in modal width.
 *   2. **Simpler model** — only `title`, `desc`, optional `imageUrl`, and a
 *      `state` discriminator (`'active' | 'soon'`). No kind/typePill/drag
 *      slot/loading-skeleton — those are AssetCard concerns and don't
 *      apply to selection-flow steps.
 *
 * Always renders as `<button type="button">`. Even cards in `state='soon'`
 * are clickable — the consumer (`<ChoiceScreen>`) routes that click to a
 * toast. We do NOT disable the button at the DOM level so keyboard users
 * still get focus + screen-reader announcement.
 *
 * State machinery via `data-state="active|soon"`. Wrapper-level opacity
 * for `'soon'` (NOT per-element alpha) — see `frontend.md` icon-opacity
 * rule: alpha on a wrapper renders the layer once and avoids double-up
 * on outline crossings.
 *
 * @see `_handoff/STORY-MODE-2026-05-06/CONTENT.md`
 * @see `packages/brand/src/AssetCard/AssetCard.tsx` (visual baseline)
 */

import './ChoiceCard.scss'
import type { Ref } from 'react'
import { CdnImage } from '../CdnImage'

const ROOT = 'klyp-ChoiceCard'

export type ChoiceCardState = 'active' | 'soon'

/**
 * Card kind — picks the layout entirely.
 *  - `'card'` (default): cinematic image-bleed cover with title + desc
 *    overlay (revealed on hover).
 *  - `'add'`: empty-state add tile with a centered plus glyph and a
 *    centered label below. No image, no overlay reveal — used as the
 *    "Add your own" affordance at the head of a picker grid (vibe /
 *    render / director). Once the user uploads a custom asset, the
 *    consumer flips this back to `'card'` and provides `imageUrl`
 *    so the tile picks up the regular cover treatment.
 */
export type ChoiceCardKind = 'card' | 'add'

/**
 * Visual variant — picks the artwork → text balance.
 *  - `'art'` (default): illustrated cover with strong fade region (40%
 *    of card height) so the title + desc overlay reads cleanly. Text
 *    is hidden by default and reveals on hover/focus.
 *  - `'photo'`: image-first card (vibe / world picker). Fade region is
 *    narrower (20%) and the title + desc overlay is suppressed entirely
 *    — the photograph carries the meaning, and the button's `aria-label`
 *    keeps the screen-reader announcement intact.
 */
export type ChoiceCardVariant = 'art' | 'photo'

export type ChoiceCardProps = {
  /** Stable identity — used as React key by parent screens. Not rendered. */
  id: string
  /** One-line title. Line-clamped to 1 line. Sentence case. */
  title: string
  /** Helper line under title. Line-clamped to 2 lines (3 lines on ≥260px). */
  desc: string
  /** Optional cover image URL. When absent, a branded gradient placeholder fills the image area. */
  imageUrl?: string
  /**
   * Visual + interactive state.
   *  - `'active'` (default): primary, full opacity, hover lift, focus ring.
   *  - `'soon'`: full opacity (design lead, 2026-05-07) with a corner badge, click
   *    is a no-op at the consumer; cursor stays default. The card is still
   *    focusable so screen-reader users hear it.
   */
  state?: ChoiceCardState
  /** Badge text shown when `state='soon'`. Default `'Soon'`. */
  soonBadge?: string
  /**
   * Visual variant — see `ChoiceCardVariant` doc. Default `'art'`.
   * Pass `'photo'` for image-first cards (vibe / world picker) where
   * the photograph should dominate without an overlay caption.
   */
  variant?: ChoiceCardVariant
  /**
   * Layout kind — see `ChoiceCardKind` doc. Default `'card'` (cinematic
   * cover). Pass `'add'` for the empty-state "Add your own" tile that
   * opens at the head of a picker grid.
   */
  kind?: ChoiceCardKind
  /** Required. Fires for both active and soon states. */
  onPress: () => void
  /** Override accessible label. Defaults to `title`. */
  ariaLabel?: string
  /** React 19 ref-as-prop. */
  ref?: Ref<HTMLButtonElement>
}

export function ChoiceCard({
  id: _id,
  title,
  desc,
  imageUrl,
  state = 'active',
  soonBadge = 'Soon',
  variant = 'art',
  kind = 'card',
  onPress,
  ariaLabel,
  ref,
}: ChoiceCardProps) {
  // Add-kind tile: square frame with a centered plus glyph and a centered
  // label below. No image, no overlay reveal — used as the "Add your own"
  // affordance at the head of a picker grid. Once the consumer flips
  // `kind` back to `'card'` (after upload), the regular layout below
  // kicks in and shows the user's image with the standard treatment.
  if (kind === 'add') {
    return (
      <button
        ref={ref}
        type="button"
        className={ROOT}
        data-kind="add"
        data-state={state}
        data-variant={variant}
        aria-label={ariaLabel ?? title}
        onClick={onPress}
      >
        <span className={`${ROOT}__addGlyph`} aria-hidden="true">
          <PlusGlyph />
        </span>
        <span className={`${ROOT}__addLabel`}>{title}</span>
      </button>
    )
  }

  return (
    <button
      ref={ref}
      type="button"
      className={ROOT}
      data-kind="card"
      data-state={state}
      data-variant={variant}
      aria-label={ariaLabel ?? title}
      onClick={onPress}
    >
      {imageUrl ? (
        // NOTE: `draggable={false}` + `onDragStart`/`onContextMenu` preventDefault
        // make casual download (drag-to-desktop, right-click → "Save image as…")
        // a no-op. Determined users can still pull the file from DevTools — this
        // is hostile-UX deterrence, not real DRM. CSS in `.klyp-ChoiceCard__image`
        // adds `pointer-events:none` + `user-select:none` + `user-drag:none` so
        // the click pierces to the underlying button and selection/drag gestures
        // never originate from the image element.
        <CdnImage
          className={`${ROOT}__image`}
          src={imageUrl}
          alt=""
          size="card"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : (
        <span className={`${ROOT}__placeholder`} aria-hidden="true" />
      )}
      <span className={`${ROOT}__content`}>
        <span className={`${ROOT}__title`}>{title}</span>
        <span className={`${ROOT}__desc`}>{desc}</span>
      </span>
      {state === 'soon' && <span className={`${ROOT}__badge`}>{soonBadge}</span>}
    </button>
  )
}

// Inline plus glyph for the add-kind tile. 24×24 viewBox so it stays
// pixel-snapped at the 32px display size used by the SCSS, currentColor
// so the surrounding `data-kind='add'` rules can drive its tint.
function PlusGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width={32}
      height={32}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

/**
 * `<EditorActionFab>` — Tier 4 brand molecule. Floating action button for
 * mobile editor surfaces (`/editor/...`) that opens secondary panels
 * (Library / Inspector / Compose) inside a `<MobilePanelSheet>`.
 *
 * **Why a dedicated component**
 *
 * The Studio mobile UX (Phase 1, 2026-05-07) hides the desktop right-bar at
 * `≤600px` and provides a single FAB anchor in the editor zone. The FAB
 * triggers a vaul Drawer with the same `<RightBar>` content. This molecule
 * owns the FAB visual contract: 56×56 circular surface, fixed position
 * tracking the keyboard offset (`--kb-offset`) + safe-area, optional
 * count-badge (used by Approval Queue in Phase 2 + active-filter chips).
 *
 * **Visual contract** (mirrors Material 3 FAB / Apple HIG mobile sheet
 * trigger; verified against `prompt-composer/model-picker.scss` chip-style
 * for surface tokens consistency)
 *
 *   - Size: `var(--fab-size)` (= 56px). Single value — variants do NOT
 *     change diameter.
 *   - Shape: `border-radius: var(--radius-full)` — perfect circle.
 *   - Surface: `var(--color-bg-surface-solid)` neutral (default), gold
 *     tint on hover/focus/active per `feedback_no_static_gold_borders`
 *     rule. `tone="primary"` opt-in static gold for screens that need
 *     creation prominence (sparingly — single-accent budget).
 *   - Position: `position: fixed; bottom: …; right: var(--space-16)`. Bottom
 *     offset = `composer height + space-16 + kb-offset + safe-area-bottom`,
 *     so the FAB always floats above the composer and rises with iOS
 *     keyboard.
 *   - Badge: optional `count` prop. Pin top-right corner, semantic
 *     `--color-status-danger` for unreviewed signal.
 *
 * **Anti-pattern guards**
 *
 *   - React 19 ref-as-prop — no `forwardRef`.
 *   - Tokens-only — no hex, no magic px outside `--fab-size`.
 *   - Variants via `data-*` attrs — no className stitching.
 *   - Generic icon slot (`ReactNode`) — no library type leak.
 *   - Visibility (mounted vs hidden) is the parent's concern; this
 *     molecule renders the button — caller decides when to show it.
 *
 * **Usage**
 *
 *   ```tsx
 *   <EditorActionFab
 *     aria-label="Open library and inspector"
 *     icon={<LibraryOutline />}
 *     onPress={() => setSheetOpen(true)}
 *     count={unreviewedCount}
 *   />
 *   ```
 */

import type { ReactNode, Ref } from 'react'
import { type PressEvent, Button as RACButton } from 'react-aria-components'
import './EditorActionFab.scss'

export type EditorActionFabTone = 'neutral' | 'primary'

export type EditorActionFabProps = {
  /** Icon node — typically an Iconsax outline glyph at 24×24. Required. */
  icon: ReactNode
  /** Accessible label — required, since the button is icon-only. */
  'aria-label': string
  /** RAC press handler — fires on click + Enter/Space + touch. */
  onPress?: (event: PressEvent) => void
  /**
   * Optional badge value. Renders a small pill in the top-right corner.
   * Hidden when `undefined`, `0`, or negative. Numbers > 99 render as
   * `99+` to prevent overflow.
   */
  count?: number
  /**
   * Visual tone. `neutral` (default) — surface-solid bg + border, gold on
   * hover. `primary` — static gold tint (use sparingly, single-accent rule).
   */
  tone?: EditorActionFabTone
  /**
   * `true` while the parent sheet is open — lets the FAB style itself as
   * "active" / dim while the sheet covers the screen. Caller is still
   * responsible for hiding the FAB during open if visual conflict exists.
   */
  isOpen?: boolean
  /** Disable the button — used during long-running async actions. */
  isDisabled?: boolean
  /** Forward ref to the underlying RAC `<Button>` (HTML `<button>`). */
  ref?: Ref<HTMLButtonElement>
  /** Optional className override — merged with the BEM root. */
  className?: string
}

function formatBadge(count: number): string {
  if (count > 99) return '99+'
  return String(count)
}

export function EditorActionFab({
  icon,
  'aria-label': ariaLabel,
  onPress,
  count,
  tone = 'neutral',
  isOpen,
  isDisabled,
  ref,
  className,
}: EditorActionFabProps) {
  const showBadge = typeof count === 'number' && count > 0
  return (
    <RACButton
      ref={ref}
      aria-label={ariaLabel}
      onPress={onPress}
      isDisabled={isDisabled}
      data-tone={tone}
      data-open={isOpen ? 'true' : undefined}
      className={
        typeof className === 'string' ? `klyp-EditorActionFab ${className}` : 'klyp-EditorActionFab'
      }
    >
      <span className="klyp-EditorActionFab__icon" aria-hidden="true">
        {icon}
      </span>
      {showBadge ? (
        <span className="klyp-EditorActionFab__badge" aria-hidden="true">
          {formatBadge(count as number)}
        </span>
      ) : null}
    </RACButton>
  )
}

export default EditorActionFab

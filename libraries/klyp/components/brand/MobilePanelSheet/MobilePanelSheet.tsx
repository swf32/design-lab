/**
 * `<MobilePanelSheet>` — Tier 4 brand molecule. Bottom-anchored drawer for
 * mobile editor surfaces, two-detent (peek / expand) via vaul. Houses the
 * right-bar content (Library / Inspector / Compose) on `≤600px` viewports.
 *
 * **Why vaul** (not `@klyp/ui/Sheet`)
 *
 *   `@klyp/ui/Sheet` wraps RAC `<ModalOverlay>` — focus-trap + scroll-lock
 *   + ESC are already there, but RAC does NOT have a native snap-point
 *   API. The Studio mobile UX needs a peek detent (≈30vh, quick scope
 *   toggle) and an expand detent (≈88vh, full library grid scroll). vaul
 *   ships exactly this pattern with Radix Dialog under the hood (its own
 *   focus-trap + scroll-lock — equivalent a11y, different vendor).
 *
 *   Mixing both libraries on the same overlay would double-trap focus,
 *   so MobilePanelSheet is a pure vaul wrapper. The desktop right-bar
 *   stays in the EditorShell grid (no overlay), which is why the two
 *   surfaces don't share a primitive.
 *
 * **Snap points contract**
 *
 *   `['30%', '88%']` of small-viewport-height. Mirrors the
 *   `--sheet-peek-h` / `--sheet-expand-h` tokens (semantic.css:28-29).
 *   Hardcoded strings here — vaul computes pixel values at open-time
 *   and doesn't accept `var(--…)` references. Keep tokens and constants
 *   in sync if either changes (single source of truth — token).
 *
 * **Visibility — caller's concern**
 *
 *   The sheet renders nothing in the DOM until `open === true`. Caller
 *   (route component) decides when to mount based on
 *   `useEditorBreakpoint() === 'mobile'`. Sheet does NOT no-op when
 *   media query says mobile is wrong — that's the route's responsibility.
 *
 * **A11y guarantees** (inherited from vaul / Radix Dialog)
 *
 *   - Focus trap on open, return focus on close
 *   - Scroll-lock on body
 *   - ESC closes (when `dismissible` — default true)
 *   - Outside-click / overlay-tap closes
 *   - Swipe-down past peek closes
 *   - `Drawer.Title` / `Drawer.Description` map to aria-labelledby /
 *     aria-describedby on the dialog
 *
 * **Usage**
 *
 *   ```tsx
 *   <MobilePanelSheet open={open} onOpenChange={setOpen} title="Editor panels">
 *     <Tabs>…</Tabs>
 *   </MobilePanelSheet>
 *   ```
 */

import type { ReactNode } from 'react'
import { useState } from 'react'
import { Drawer } from 'vaul'
import './MobilePanelSheet.scss'

/**
 * Snap points — vaul-canonical numeric form.
 *
 *   - `0.4` (peek)  — 40% of viewport. Quick glance at panel content.
 *                     Body does NOT scroll; drag from body snaps up.
 *   - `1`   (full)  — full content height (capped by SCSS max-block-size
 *                     97svh). Sheet covers virtually the whole screen,
 *                     leaving only the 3% peek of background as the
 *                     exit-affordance hint at the very top.
 *
 * `1` (vaul's «full content» convention per docs) reads more reliably
 * than `0.92` — vaul snaps to the natural content height of the drawer,
 * matching what the docs example uses. Previous attempts with `0.88`
 * and `0.92` reportedly capped low (design lead 2026-05-07).
 */
const SNAP_POINTS = [0.4, 1] as const
type SnapPoint = (typeof SNAP_POINTS)[number]

export type MobilePanelSheetProps = {
  /** Controlled open state. */
  open: boolean
  /** Open-state change handler. Fires on close-via-swipe / overlay / ESC. */
  onOpenChange: (open: boolean) => void
  /**
   * Accessible title — required by Radix Dialog (vaul's substrate). Defaults
   * to a sentence that screen readers can announce. Pass a more specific
   * string when caller knows the panel context (e.g. "Library panel").
   */
  title?: string
  /**
   * Optional description — paragraph announced after the title. Hide
   * visually via CSS but keep it for assistive tech if needed.
   */
  description?: string
  /**
   * Initial snap index when sheet opens — `0` for peek (default), `1` for
   * expand. Caller can force expand for e.g. "Open library full" deep-links.
   */
  initialSnap?: 0 | 1
  /** Sheet body — typically a `<Tabs>` from `@klyp/ui` with 2-3 panels. */
  children: ReactNode
}

export function MobilePanelSheet({
  open,
  onOpenChange,
  title = 'Editor panels',
  description,
  initialSnap = 0,
  children,
}: MobilePanelSheetProps) {
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[initialSnap])

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[...SNAP_POINTS]}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      // Fade overlay only after we cross from peek → expand. At peek the
      // background stays interactive-ish (low overlay alpha) so users can
      // still see what they're operating on. At expand the overlay fully
      // commits to "modal" mode.
      fadeFromIndex={1}
      // dismissible defaults to true → swipe-down past peek + tap-overlay
      // both close. modal defaults to true → background scroll-locked.
    >
      <Drawer.Portal>
        <Drawer.Overlay className="klyp-MobilePanelSheet__overlay" />
        <Drawer.Content
          className="klyp-MobilePanelSheet"
          data-snap={snap === SNAP_POINTS[1] ? 'expand' : 'peek'}
        >
          {/* Drag-affordance bar — Apple/Material standard. vaul listens
              to drag on the whole content but the visible handle teaches
              the gesture. */}
          <Drawer.Handle className="klyp-MobilePanelSheet__handle" />

          <div className="klyp-MobilePanelSheet__header">
            <Drawer.Title className="klyp-MobilePanelSheet__title">{title}</Drawer.Title>
            {description ? (
              <Drawer.Description className="klyp-MobilePanelSheet__description">
                {description}
              </Drawer.Description>
            ) : null}
          </div>

          {/* Body — scrollable when at expand snap, locked at peek so the
              user can't pull content out of the visible region.
              `data-scrollable` flips overflow rules in the SCSS. */}
          <div
            className="klyp-MobilePanelSheet__body"
            data-scrollable={snap === SNAP_POINTS[1] ? 'true' : 'false'}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

export default MobilePanelSheet

export type { SnapPoint }

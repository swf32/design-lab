# Sheet — changelog

## 2026-06-29 04:23 — close-button-and-backdrop-variants

- What: Added an opt-in top-right close (X) button via `showCloseButton` (default false, Dialog parity, rendered with `@klyp/ui/Button` + `XOutline`), and a `backdrop` prop (`blur` default / `opaque` / `transparent`) wired to `data-backdrop` on the overlay for scrim variants.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-25 15:25 — opt-in close button (Dialog parity)

- What: re-added a top-right close (X) button behind `showCloseButton?: boolean`,
  **default false**. Mirrors Dialog 1:1 — `XOutline` in a `Button`
  `variant="secondary" size="icon"`, absolute at `--space-16/--space-16`, sr-only
  "Close" label, and a `:has(> __close)` title padding-reserve so a long title
  doesn't slide under it. +`WithCloseButton` story.
- Why: design-lead — Sheet should offer the same close affordance as Dialog, but
  opt-in (most drawers don't want it). The earlier removal made it always-absent;
  now it's a control, off by default.

## 2026-06-25 15:05 — backdrop variants

- What: added `backdrop?: 'blur' | 'opaque' | 'transparent'` → `data-backdrop`.
  `blur` (default) = dim + backdrop-blur (unchanged look, nothing migrates);
  `opaque` = dim, no blur; `transparent` = no dim, no blur (still catches
  click-out). Moved the scrim background/blur out of the base `&__overlay` into
  per-variant rules. Added a `Backdrop` story with one button per option.
- Why: cross-DS — HeroUI Drawer ships `backdrop` (opaque/blur/transparent);
  some lighter side panels don't want the whole page blurred. Default stays
  blur so existing usage is untouched.

## 2026-06-25 14:40 — stories deduped

- What: collapsed the story set to 5 distinct scenes — `Sides` (all four
  edges), `Sizes` (sm/md/lg/full), `BodyShort`, `BodyScroll`, `NonDismissable`.
  Removed duplicates: per-edge `Right`/`Left`/`Top`/`Bottom` (covered by
  `Sides`), `HeaderOnly` + `HeaderBodyFooter` (covered by `BodyShort`),
  `Backdrop` (the scrim shows in every story).
- Why: the earlier pass left overlapping stories (3 header-body-footer scenes,
  4 single-edge + the combined `Sides`). One story per job.

## 2026-06-25 14:25 — SheetBody scroll region

- What: added `<SheetBody>` slot — a scrollable content region (`flex:1 1 auto`
  + `min-height:0` + `overflow-y:auto`) so header/footer stay pinned while only
  the body scrolls. Mirrors the brand `<Modal>` body recipe. Migrated stories
  off hand-rolled `<div style={{ overflowY:'auto' }}>`; added `BodyShort` +
  `BodyScroll` demo stories.
- Why: cross-DS audit (vs HeroUI `DrawerBody` / Radix Dialog scroll) — header
  and footer were slots but the body wasn't, so every consumer re-implemented
  scroll inline.

## 2026-06-25 14:25 — remove built-in close button

- What: removed the floating upper-right close button entirely — the
  `showCloseButton` prop, the `Button`/`CloseCircleOutline` render, the
  `&__close`/`&__close-label` SCSS, and the header right-padding reservation.
  Close via `<SheetClose>`, backdrop click, or Esc. Dropped `showCloseButton`
  from the two Sheet consumers (`ConversationsOverlay`, `MobileNavDrawer`) —
  both already passed `false`; no other Sheet callsite used it.
- Why: design-lead call — every live consumer disabled it; the crest was dead
  default chrome. Matches the merged brand `<Modal>` (close lives in header).

## 2026-06-25 14:25 — size prop (width preset + escape hatch)

- What: added `size?: 'sm'|'md'|'lg'|'full'` → `data-size` → `--sheet-width`
  (20/24/30rem/100%) on left/right panels; default `md`. For an exact one-off
  width, set `--sheet-width` directly. Replaced the hardcoded `width:75%` +
  `@media(min-width:640px){max-width:384px}` with the preset scale; `max-width:
  100vw` guards small screens. `ConversationsOverlay` migrated to `size="full"`.
- Why: cross-DS audit — width was a single hardcoded value that all three
  consumers overrode (216px / 100vw / default). HeroUI ships `size`, Radix
  `width`/`maxWidth`; hybrid = preset scale + `--sheet-width` escape hatch.

## 2026-06-19 — fix: invisible close-button glyph (deprecated bulk icon)

- What: the close button rendered `XBulk` from `@klyp/icons/bulk` — bulk is
  deprecated (`noIcon = () => null`), so the × was invisible and the button read
  as an empty square (only a visually-hidden "Close" label). Swapped to
  `CloseCircleOutline` from `@klyp/icons/outline` (the 15-use close-glyph
  precedent; no bare `CloseOutline` exists in the set — design lead chose the
  circle variant over adding a new glyph).
- Why: an empty close button is handoff-blocking. Same regression class as Select
  (chevron/check) and the earlier Toast bulk-icon fix.

## 2026-06-19 — handoff hardening (reduced-motion)

- What: added a `@media (prefers-reduced-motion: reduce)` gate that disables the
  scrim fade + panel slide on `[data-entering]`/`[data-exiting]` (overlay + sheet
  appear in their resting position instantly). Slides already use `translate`
  (not scale), so fix #3 didn't apply — only the missing reduced-motion gate
  (fix #5) was the gap.
- Why: handoff readiness — anything animated needs a reduced-motion gate.
- Flag (token-owner): panel `max-width: 384px` is a content-width literal with no
  token in the scale — left as-is.
- Not audited here: Mode-C dialog behaviour (focus trap / escape / return-focus /
  `aria-modal`) — flagged for a dedicated behavioural pass, not fabricated.

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: Sheet.scss — added `padding-right: calc(var(--space-16) + var(--space-32))` to `&__header` (item 1.2) and `padding-top: env(safe-area-inset-top, 0)` to `&__content[data-side='top']` (item 4.2).
- Why: 1.2 — the absolutely-positioned close button (icon-sm at `right: var(--space-6)`) overlapped a long SheetTitle, since the header only had symmetric `padding: var(--space-16)`; reserved space on the right. 4.2 — the top sheet had no safe-area inset, so the iOS notch/status bar overlapped its content; mirrors the existing bottom-variant `padding-bottom`, no-op (`env()` returns 0) off iOS.

## 2026-05-17 01:00 — promote-to-stable

- What: Status flipped `beta` → `stable` in components-registry.ts; states audit confirmed full coverage.
- Why: Referenced as part of the /referrals catalog wave 2026-05-17.

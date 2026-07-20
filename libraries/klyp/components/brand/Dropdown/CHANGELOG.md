# Dropdown — changelog

## 2026-07-03 — detail card: never height-capped, never scrolls

- What: dropped the side-card's `max-height: max(100%, 18rem)` + `overflow-y: auto` + scrollbar styling entirely — the card is always its natural content height; `positionDetail` now clamps its y to the VIEWPORT (may go negative — the card rises above a short menu) instead of the popover box.
- Why: Val 2026-07-03 — on a short menu (Image, 5 models) the card inherited the menu's height, clipped its content and grew a visible scrollbar; requirement: height always suffices, no scrollbar ever visible in this component.

## 2026-07-03 — detail card follows the hovered row + stagger scrollbar-flash fix

- What: (1) the renderDetail side-card now vertically CENTRES on the hovered/focused row and glides with it (row-rect tracking via `data-option-id` + a `--dropdown-detail-y` transform, updates on hover, menu scroll and resize), instead of sticking to the popover top; (2) the per-row stagger keyframe dropped its `translateY(8px)` rise (now fade + scale only) — the rise transiently overflowed the menu's scroll box and flashed a scrollbar/gutter on every open; (3) the card got the thin invisible-at-rest scrollbar instead of the browser default.
- Why: Val 2026-07-03 — the card must "ходить вместе с нейронками", and the model list flashed a scrollbar while its rows cascaded in (same mechanism the Popover child cascade already fixed by going scale-only).

## 2026-07-02 19:04 — renderDetail hover side-card slot

- What: opt-in `renderDetail(option)` prop — a detail card for the hovered / arrow-focused row, rendered INSIDE the menu popover as an absolutely-positioned sibling of the menu (primitive `aside` slot). Top-aligned with the menu, flips left when the right viewport edge lacks room, hidden when neither side fits and on hover-less touch devices; shows the selected option's card on open; 60ms hover-intent debounce; in aside mode the scroll moves from the popover root to the inner menu.
- Why: the composer model picker needs a 21st.dev-style model info card (Val 2026-07-02). In-popover (not a body portal) because RAC's modal popover inert-disables everything outside — a portaled card was click-dead and stacked under other popovers (live repro, Val 2026-07-03); inside, it also rides the popover's own entrance/exit as one surface.

## 2026-06-30 04:28 — promote beta → stable

- What: Promoted `/components/dropdown` from `beta` → `stable` in the registry
  (`components-registry.ts`). Tokenised the one raw value found (`width: 6px` →
  `var(--space-6)` on the `::-webkit-scrollbar`, matching `PromptField.scss`) so
  the SCSS is fully tokens-only. No visual change. Verified: hardcode grep clean,
  `@klyp/brand` typecheck + `catalog:audit` + biome lint all pass.
- Why: stable-grade earned — full state/variant/size coverage (action / single /
  multi-select × checkmark / dot / none indicator × custom / pill / pill+icon
  trigger), 11 stories, a11y via RAC Menu, reduced-motion aware, production-proven
  across every migrated callsite. Val (design lead) signed off on the promotion.

## 2026-06-28 05:00 — initial unified menu

- What: New `@klyp/brand/Dropdown` — one data-driven branded menu over
  `@klyp/ui/DropdownMenu` (RAC `Menu`). Covers action menus
  (`selectionMode="none"`), single- and multi-select (RAC-native selection +
  checkbox/radio indicator visuals reused from the primitive), grouped
  sections, descriptions, meta + shortcut slots, and a scoped per-item
  staggered reveal animation (CSS `animation-delay` off an inline `--i` index,
  reduced-motion aware). Registered on `/components/dropdown` (status: beta).
- Why: consolidate Klyp's fragmented dropdown/menu/select surfaces (ActionMenu,
  raw RAC menus, the Library multi-select filter, value pickers) onto a single
  HeroUI-shaped component, per the unified-Dropdown plan. Multi-select menus
  stay open while toggling (no `onAction` on selectable rows — avoids the RAC
  close-on-action gotcha).

## 2026-06-29 — consolidation complete + value-picker parity

- What: (1) `DropdownOption` gains optional `short` (compact value-picker trigger
  label — the one field `BrandSelectOption` had that this lacked). (2) Faster
  stagger — ~half the timing (`--duration-fast` budget, clamp 5–20ms step + 140ms
  row reveal). (3) Provider group HEADERS now join the stagger cascade (shared
  render-order `--i`); adaptive stagger step (shrinks as the list grows); 2px
  row/group gap. (4) `Popover` gained a `footer` slot + opt-in `animateHeight` /
  `staggerChildren`.
- Why: finish the unified-Dropdown sweep — every menu/select/popover callsite
  migrated (ProfileMenu, library filter, composer + audio pickers, ConversationRow
  kebab, catalog snapshots). **ActionMenu and BrandSelect are both retired
  (deleted).** The 4 stale `.klyp-BrandSelect { width:100% }` rules the migration
  left behind were repointed to `.klyp-Dropdown-pill` (TeamLead-caught regression).

## 2026-07-05 20:17 — hideChevron prop

- What: opt-in `hideChevron` prop on the built-in pill trigger — suppresses the trailing ChevronDownOutline. Default false (chevron still shown).
- Why: compact composer setting pills read cleaner with a leading glyph and no trailing chevron; the affordance is implied.

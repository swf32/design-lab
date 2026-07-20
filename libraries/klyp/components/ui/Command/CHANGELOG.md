# Command — changelog

## 2026-07-02 01:20 — fixed top anchor for dialog palettes

- What: on ≥640px viewports command dialogs no longer center vertically — the overlay `:has(> .klyp-Command__dialog)` switches to `align-items: flex-start` and the surface hangs from `--command-dialog-top` (default 16vh, knob), max-height capped accordingly. Mobile keeps the bottom sheet.
- Why: Val — with the animated list height a centered dialog grows/shrinks from BOTH ends and the search field drifts; the input must stay put («центр тяжести = search field»), growth goes downward only (Raycast/Linear register).

## 2026-07-02 00:45 — design pass (Val): borders, icon colours, spacing, height morph

- What: input row edge is now an INSET box-shadow ring (border: 0) — rest `--color-border-subtle` (matches Sidebar/composer chrome), hover `--color-border-default`, focus `--color-border-focus`; colour-only, crisp at fractional scales, zero layout shift. Symmetric icon insets via `:has()` (leading icon → `padding-inline-start: --space-8`, trailing control → `padding-inline-end: --space-6` — insets now match the vertical centering); `margin-block-end: --space-4` under the input row; group headings `4/12/2` → `8/12/4`; footer band `8/12` → `10/12` + wider hint gap; dialog surface radius `--r-panel` (20) → `--r-section` (16) — concentric formula 16 − 6 pad = 10 = the input's `--r-chip`, so the window corner harmonises with the search bar; item/input icons moved off alpha `--color-fg-muted` to the new solid `--color-fg-icon-muted` (neutral.500), selected-item icons → solid `--color-fg-on-active-nav`; list height now morphs smoothly via cmdk's `--cmdk-list-height` + `--duration-fast` transition (reduced-motion gated).
- Why: Val design review 2026-07-02 (два прохода) — кривые отступы и бордеры, радиус окна не концентричен инпуту, alpha на svg (double-composite), нет hover/focus реакции на инпуте, высота должна меняться плавно как у Popover.

## 2026-07-01 23:55 — review pass: dialog a11y, mobile sheet, footer contrast, forwardRef drop

- What: `CommandDialog` sr-only header moved INSIDE `DialogContent` (RAC `Heading slot="title"` now actually labels the dialog; previously it rendered outside the RAC Dialog and outside the portal, leaking into page flow while closed) + description wired via `useId` → `aria-describedby`; mobile ≤639px override added to the `__dialog` dual-class rule (full width + square bottom corners — the (0,2,0) `border-radius` shorthand was beating Dialog's (0,1,0) bottom-sheet reset, leaving 20px rounded corners at the viewport edge); `__footer` text `--color-fg-subtle` → `--color-fg-muted` (12px at alpha-white-30 fails AA); `CommandList` `forwardRef` → plain function (React 19 ref-as-prop, rule conformance); deleted the orphan `[data-slot='dialog-content'] &` item rule (selector never matched — nothing emits that slot); `__input-trailing` no longer sets a foreground colour (fg-muted is an alpha token — would double-composite multi-path svgs in the slot).
- Why: multi-agent review (correctness / DS-rules / a11y / design / brand-safety) with adversarial verification confirmed these on the new-code pass; the dialog-header and mobile-sheet defects were pre-existing but live via the catalog ⌘K palette.

## 2026-07-01 23:20 — input trailing slot + loading + footer primitives

- What: `CommandInput` gains an optional `trailing` ReactNode slot (rendered inside the input box after the field — clear buttons / kbd hints); new `CommandLoading` (styled cmdk `Command.Loading`, progressbar semantics) and `CommandFooter` (bottom hint band, border-top, bleeds to the surface edges via negative margins); stories +Loading +Footer, playground args/argTypes backfilled.
- Why: base pieces for the branded `CommandMenu` molecule (HeroUI-Pro Command parity — input clear/suffix, footer, loading state) kept brand-free at the ui tier.

## 2026-06-29 04:23 — optional-input-icon-drop-bulk-glyphs

- What: Made CommandInput a thin styled wrapper directly around cmdk's input with an OPTIONAL leading `icon` prop (ComponentType<SVGProps>) that is off by default, dropping the InputGroup/InputGroupAddon wrapper and the always-on SearchBulk icon; also removed the per-item CheckBulk checkmark glyph. Command window radius now derives from the input field.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-23 12:05 — item rows → shared menu-row recipe

- What: `__item` aligned to the shared menu-row recipe (ActionMenu / DropdownMenu / Select / BrandSelect): `min-height: --space-36` (36px row), 8px icon→text gap (was `--space-4`), 8/12 padding (was 4/6), radius `--radius-sm` (6) → `--r-inner-section` (8), leading `> svg` `--space-14` (14) → `--icon-size-md` (20); the dialog-context radius override and group heading were re-based to match. Surface untouched (palette is embedded in Dialog).
- Why: design-lead — every dropdown/menu surface should share one row rhythm + icon size. Inter-row gap kept tight (0/2). Blast radius: shared `@klyp/ui` primitive — all command-palette consumers get the comfier rows. Group heading padding → 4/12/2 to match the shared section-header.

## 2026-06-05 16:25 — fix-commanddialog-missing-cmdk-root

- What: `CommandDialog` now wraps `{children}` in the cmdk `<Command>` root.
  Previously `CommandInput` / `CommandList` rendered directly inside
  `DialogContent` with no cmdk context, so typing never filtered the list —
  search was dead in every modal palette (`CommandPalette` ⌘K on `/components`,
  brand `CmdKShell`). Inline `SearchPalette` was unaffected (it mounts its own
  `<Command>` root).
- Why: regression vs the canonical shadcn `CommandDialog`, where children are
  always wrapped in `<Command>`. Restores filtering + keyboard nav across all
  dialog-based palettes; also activates the `.klyp-Command` root layout/styling
  that the SCSS already expected.

## 2026-06-25 14:03 — fix dead icons, no-shift focus, palette width, magic numbers

- What: removed dead bulk icons (`CheckBulk`/`SearchBulk` = noIcon); `CommandInput` now a thin styled wrapper around cmdk's input with an OPTIONAL `icon` prop (off by default — a palette isn't a search box); ported no-shift focus (border colour + box-shadow ring, no width change) from Input/SearchField; `CommandDialog` width `min(640px, 90vw)` instead of inheriting Dialog's 384px; magic numbers → token knobs (`--command-list-max-h`, `--command-dialog-top`); input height → `--control-size-md` (40px); item `cursor: default → pointer`; root radius → concentric `--r-panel` (20) / pad `--space-10` / inner `--radius-md` (10).
- Why: dead lupa/check rendered nothing (proven — ModelPickerModal already bypassed CommandInput because of it); a stray focus rectangle appeared on click; the Cmd+K palette was cramped at 384px; token discipline + correct interactive cursor.

## 2026-06-25 15:38 — center CommandDialog, win width/radius cascade, reset CommandPalette overrides

- What: `CommandDialog` now uses Dialog's native centering (removed the `top: 33%` anchor); width `min(640px, 90vw)` and radius `--r-panel` now win via a dual-class `&.klyp-Dialog__content` (0,2,0) selector instead of losing the tie to Dialog's own rules; CommandPalette.scss stripped of its custom `__dialog`/`__list` overrides so the catalog Cmd+K palette renders straight from the primitive.
- Why: lead wants the Cmd+K palette centered and identical to the designed primitive — no catalog-local divergence.

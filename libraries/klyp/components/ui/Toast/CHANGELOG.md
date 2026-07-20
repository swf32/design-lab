# Toast — changelog

## 2026-06-29 04:23 — type-shorthand-token-migration

- What: Migrated typography to the `--type-*` font shorthands: base toast uses `--type-body`, description uses `--type-body-sm`, and the action button uses `--type-buttons-sm`, replacing the raw `--font-size-*` + `line-height: 1.4` pairs.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-16 12:00 — handoff hardening (token sweep)

- What: `Toast.scss` — replaced hardcoded values that have a semantic token:
  `font-weight: 500` → `var(--font-weight-medium)` (title + action button);
  action-button `border: 1px solid` → `var(--bw-default) solid`; close-button
  `border-radius: 9999px` → `var(--radius-full)`; both focus rings
  `outline: 2px` → `var(--bw-emphasis)` and `outline-offset: 2px` →
  `var(--bw-emphasis)`. No API, geometry, or behaviour change.
- Why: handoff readiness — every styling value a frontender reads should be a
  token so a theme change propagates. INTENTIONALLY LEFT hardcoded (no
  matching token, sonner-specific glyph geometry): the close-button circle
  `22px`, the hand-drawn × bars (`width: 10px`, `height: 1.5px`,
  `border-radius: 2px`), and `line-height: 1.4` (between `--line-height-snug`
  1.28 and `--line-height-normal` 1.5). These are flagged, not silently
  changed. Toast is a wrapper over the `sonner` library — its overlay
  enter/exit motion is owned by sonner, not this stylesheet.

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: Added a `@media (prefers-reduced-motion: reduce)` block in `Toast.scss` that disables the animation (`animation: none`) for `.klyp-Toast__icon--spin` (the loading spinner). Geometry, tokens, API, and logic are unchanged.
- Why: The loading spinner kept rotating even when the system "reduce motion" setting was enabled — a violation of prefers-reduced-motion (WCAG 2.3.3 / comfort for motion-sensitive users).

## 2026-05-28 18:55 — rename-sonner-to-toast-+-close-button-right-+-icon-dedup

- What: Renamed the component folder + files (`Sonner/` → `Toast/`, `Sonner.{tsx,scss,stories.tsx}` → `Toast.{tsx,scss,stories.tsx}`) and the catalog registry entry (`slug: 'sonner'` → `'toast'`, `name: 'Sonner'` → `'Toast'`). Export name stays `Toaster` (sonner convention) so every `import { Toaster } from '@klyp/ui'` consumer (root layout + 30+ feature files) keeps compiling. Also: switched Toaster icons to the canonical `*Outline` family after the icon dedup pass (`CheckOutline` / `CloseCircleOutline` / `InfoCircleOutline` / `DangerOutline` / `RegenerateOutline`) and rebuilt Showcase to fire on a button press instead of on mount (was dumping a wall of toasts every time anyone opened `/components/toast`). Close × moved from top-LEFT to top-RIGHT per Material / Radix / shadcn / NN/g convention (Sonner default is the outlier).
- Why: «sonner» is the npm-library name, not a Klyp UI concept — the catalog audience reads "Toast" much faster. Auto-fire on mount was bad UX for the catalog page. The new stroke-only outline icons are the single canonical visual now (no `*Stroke` shadow exports left).

## 2026-05-28 17:24 — outline-icons-and-toast-states

- What: Replaced deprecated bulk-icon stubs (`AlertTriangleBulk` / `CheckCircleBulk` / `InfoBulk` / `OctagonXBulk` / `Loader2Bulk` — all rendered `null` after the 2026-05-14 bulk-pack deprecation) with three new pure-stroke outline glyphs (`TickCircleStroke`, `CloseCircleStroke`, `DangerOutline`) plus existing `InfoCircleStroke` and `RegenerateOutline` for loading. SCSS rewritten: 12/16 padding, --r-card radius, --icon-size-md icons, per-type title colour, proper `[data-button]` action skin (12/8 padding + chip radius), `[data-close-button]` round skin. Stories: added `Showcase` story that auto-fires the full info/success-with-undo/message/error/info stack matching the design lead reference, plus a `Closable` story (`closeButton` Toaster prop).
- Why: Bulk pack was deprecated 14 days ago and every toast was rendering without an icon (silent regression). The design lead provided a fresh outline-icon set matching the canonical `outline-default` frontend.md policy (Iconsax outline, 1.5px stroke, currentColor). Switched in one pass — now sonner toasts render in the brand voice again, with explicit states (info / success+undo / message / error) reflected as catalog stories.

## 2026-05-17 02:00 — soft-shadow-and-faster-anim

- What: Swapped `--shadow-soft` for a new two-layer `--shadow-toast` token (thin near-contact 6px blur / 0.18 alpha + diffuse 44px halo / 0.22 alpha). Forced enter/exit `transition-duration` and `animation-duration` to `--duration-normal` (220ms) to override sonner's ~400ms default.
- Why: On the current thin `--space-6/--space-10` pill, the old 24px / 0.4-alpha single-layer halo read as a harsh black grub under the toast, and the enter/exit felt sluggish.

## 2026-05-17 01:00 — promote-to-stable

- What: Status flipped `beta` → `stable` in components-registry.ts; states audit confirmed full coverage.
- Why: Referenced as part of the /referrals catalog wave 2026-05-17.

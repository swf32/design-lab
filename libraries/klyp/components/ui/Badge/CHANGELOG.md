# Badge — changelog

## 2026-06-29 07:30 — gold intent bg → dedicated --color-badge-gold-bg (was iris)

- Files: `Badge.scss`
- What: `subtle` `intent='gold'` bg `var(--color-overlay-gold-15)` → `var(--color-badge-gold-bg)`.
- Why: Val — `overlay.gold-15` flipped to the iris brand accent on the 2026-06-29 swap, so the gold "Popular" badge rendered purple. The new `--color-badge-gold-bg` is a dedicated gold wash (klyp) / accent wash (unreals) — keeps the gold badge gold while accent washes stay iris.

## 2026-06-29 04:23 — solid-500-wcag-fg-tokens-type-shorthand

- What: Rebuilt the solid variant for WCAG (saturated -500 fills + white text replacing the light -800/-900 pastels) and routed outline text through the brand-aware --color-badge-*-fg semantic tokens instead of raw -700; re-tokenized the inverted and featured intents and switched typography from font-size/line-height to font: var(--type-label)/var(--type-body) shorthand.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-17 — wcag-contrast-fix (solid + outline)

- What: **Solid** variant — fills moved from `-800/-900` to the saturated `-500` step, text stays `--neutral-0` (white) for every intent incl. gray/amber/gold (Variant B). **Outline** variant — text/stroke rerouted from raw `--{hue}-700` to the brand-aware `--color-badge-{hue}-fg` semantic tokens.
- Why: the 2026-06-17 APCA scale rebuild turned `-800/-900` into light pastels, so white-on-fill solid badges failed WCAG (1.5–2.6:1) and raw `-700` outline text went light and failed on the Unreals light page (~2.3:1). `-500` fills give white text ≥5:1 in both themes; routing outline through the semantic badge-fg makes it theme-correct (klyp light `-900` on dark, unreals dark `-400/-500` on light). Subtle variant already used the semantic tokens — unchanged here (its Unreals fg values were fixed in `@klyp/tokens`).

## 2026-06-15 14:49 — disabled state + default export (audit fixes)

- What: added optional `disabled` prop → `[data-disabled]` (dims the pill via `--opacity-disabled`); added the missing `export default Badge` + `export { default } from './Badge'` in `index.ts`.
- Why: senior DS audit — a status pill on a disabled row had no inactive read despite the `--opacity-disabled` token + sibling precedent, and the default subpath import (`import Badge from '@klyp/ui/Badge'`) was broken. `capitalize` deliberately kept — the audit's "API→Api" claim is wrong (CSS `capitalize` only uppercases the first letter of each word, it never lowercases).

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: `Badge.tsx` (item 3.1) — the decorative icon wrap's `aria-hidden` is now conditional (`iconHidden = hasText || Boolean(title) || undefined`) instead of always `true`. The icon is hidden from assistive tech only when the badge already exposes an accessible name (text children, or `title` lifted onto the root via `role="img"`/`aria-label`).
- Why: an icon-only badge with no `title` previously had its only content (`aria-hidden` icon) hidden while the root had no `role="img"`/label, leaving a fully mute element. Keeping the icon exposed in that case avoids announcing nothing, while the existing DEV warning still nudges authors to supply a `title`. No public API, markup geometry, or default behavior changed.

## 2026-05-22 13:48 — token-update

- What: `--gold-400` (`#f4b86c` → `#caaa7b`, 3 usages — subtle/outline gold variants).
- Why: desaturate brand gold mid/deep stops — `gold-400` and `gold-500` were too saturated/orange next to the new Geist neutrals, made the accent shout. New muted bronze sits calmer on dark surfaces and reads as deliberate brand, not warning-orange.
- Source: handoff `2026-05-22 13:48 — gold-desaturate`.

## 2026-05-20 23:20 — fix subtle `gold`: dark wash + bright fg (rhythm parity)

- What: Subtle `gold` swapped from `gold-200` bg + `gold-800` fg to
  `--color-overlay-gold-15` bg + `gold-400` fg. Solid and outline left
  alone — they already matched the amber/blue/red pattern.
- Why: design lead 2026-05-20 23:18 — «почему этот светлый-светлый, а у
  остальных как бы бордер и фон прозрачный». Root cause: gold's
  primitive scale is light-mode-tuned (it powers the featured /
  premium gradients), so `gold-200` is a cream highlight and
  `gold-800` is a dark muted edge — the exact inverse of
  amber-200 (`#331b00`) / amber-900 (`#f2a20d`) where subtle reads as
  "dark warm pill + glowing text". Position-by-position mapping
  produced a blinding light pill with black text. Synthesizing the
  dark wash via the existing `--color-overlay-gold-15` overlay token
  (gold-300 at 15% alpha) restores the visual rhythm — same "tinted
  dark wash, bright same-hue text" character every other intent has.

## 2026-05-20 23:05 — add `gold` intent (flat, non-gradient)

- What: New `'gold'` value on `BadgeIntent` participating in all three
  fills. Subtle → `gold-200` bg + `gold-800` fg. Solid → `gold-400` bg
  (`#f4b86c`) + `neutral-1000` fg. Outline → `gold-400` stroke + text.
  Added to `COLOR_INTENTS` and the `intent` select in stories so it
  appears in the Intents grid and the `/components/badge` catalog page.
- Why: design lead 2026-05-20: «добавить вариант баджа с нашим золотым цветом
  … как обычный (amber, grey, blue), не градиентный, gold 400». The
  warm gold belonged in the regular palette alongside amber/teal, not
  only inside the metallic `featured` / `premium` gradients.

## 2026-05-20 20:50 — gold variants: dark text for contrast

- What: `&[data-intent='featured']` (line 129) and `&[data-intent='premium']`
  (line 135) `color` changed from `var(--neutral-0)` to `var(--neutral-950)`.
- Why: design lead 2026-05-20: «в бадже сделай тёмным шрифтом именно у золотых
  версий». Light text on the warm-gold gradient lacked contrast — the
  "Most popular" badge in PricingTierCard was illegible at a glance.

## 2026-05-15 — geist-v2

- What: Rewrote Badge to mirror the Vercel Geist Badge spec, verified
  against vercel.com/geist/badge via DOM inspection 2026-05-15. New API:
  11 `intent` values (gray, blue, purple, amber, red, pink, green, teal,
  inverted, **featured**, **premium**) × 2 `variant` fills (solid, subtle)
  × 3 `size` steps (sm 20px / md 24px / lg 32px). Added `icon` prop
  (rendered through an `iconWrap` element so opacity can be applied to
  the wrapper per frontend.md), dev-only a11y warn for icon-only badges
  missing `title`. Removed legacy variant taxonomy (primary/secondary/
  outline/ghost/destructive/link) and the legacy `render` clone-element
  prop. Visual specs changed to match Geist exactly:
  - radius → `--radius-full` (full pill, was `--r-chip` 10px)
  - sizes → 20 / 24 / 32px heights with 6 / 10 / 12px padding-x and
    11 / 12 / 14px fonts (were 18 / 20 / 24px / smaller paddings)
  - solid bg → palette `-900` shade for most intents (was `-700`);
    blue uses `-800`, amber uses `-700` (Geist's exact mapping)
  - subtle bg → palette `-200` shade (was `-300`); fg `-900`
  - 3 new neutral primitives added to support Geist parity (all synced
    through `pnpm tokens:build` + `pnpm tokens:handoff`):
    - `neutral.50` `#EDEDED` — off-white (Badge inverted bg / gray-subtle fg)
    - `neutral.500` `#A1A1A1` — mid-gray (Badge gray-solid bg + premium gradient platinum stop)
    - `neutral.1000` `#000000` — pure black (Badge amber-solid / featured / premium fg)
  - `featured` + `premium` gradient intents replace Geist's vendor-specific
    Trial / Turborepo: pure Klyp gold + platinum tokens, no vendor hex.
    `magenta` / `crimson` vendor-brand primitives, briefly introduced
    earlier in the same session, were removed when the rename landed.
  - `text-transform: capitalize` (Geist idiom — single-word tags)
  - no border (Geist runs `0px` — border was previously transparent)
  `featured` gradient: 5-stop polished-gold ramp
  `linear-gradient(135deg, gold-600 0%, gold-150 25%, gold-700 50%,
  gold-150 75%, gold-900 100%)` — deep edge → shine → mid → shine echo
  → dark edge. Reference: brandgradients.com/gold-gradient classic
  luxury look (previous 2-stop gold-500→gold-300 read too orange).
  `premium` gradient: 3-stop platinum → shine → mid-gold
  `linear-gradient(135deg, neutral-500 0%, gold-150 50%, gold-700 100%)`.
  Four new gold primitives added (sync via tokens:build + tokens:handoff):
  `gold.150` `#FCF6BA`, `gold.600` `#BF953F`, `gold.700` `#B38728`,
  `gold.900` `#AA771C`. Both use `--neutral-1000` for fg — bright gold
  needs pure-black contrast for legibility.
  All 11 intents get a 1px inset 5%-white border (`--alpha-white-05`) on
  a `::after` pseudo-element with `mix-blend-mode: plus-lighter`. This
  mirrors Figma's "Plus Lighter" blend mode and lifts the rim subtly on
  every fill (works on solid colors and gradients alike). `isolation:
  isolate` prevents the blend from leaking into the page background.
- Why: Geist palette already exists in our primitives (ported 2026-05-13),
  and the role-based variant taxonomy mixed Warm Gold (`--color-accent`)
  into a tag — which violates the single-accent rule in styles.md (gold
  reserved for primary CTAs, not for decorating chips). Intent-based
  model also lets us reach for purple/pink/teal without inventing new
  semantic aliases. Zero production callsites at rewrite time, so
  clean-break without backward-compat aliases. Full Geist parity (not
  just naming parity) chosen so future designers can lift Geist examples
  1:1 without re-mapping shades or sizes — the catalog page is meant to
  be a literal reference.

## 2026-05-15 — pre-geist-v1

- Archive: `./_archive/2026-05-15-pre-geist-v1/`
- Tokens source: `tokens@d0fd0649`
- Why: Frozen pre-Geist Badge — the role-based variant taxonomy
  (primary/secondary/outline/ghost/destructive/link) and the legacy
  `render` clone-element prop. Preserved for reference / rollback before
  the Geist-parity rewrite landed in the same commit.

# TabSwitcher — changelog

## 2026-07-02 16:35 — Item isDisabled now forwards to RAC (coming-soon pattern)

- Files: `TabSwitcher.tsx`, `TabSwitcher.stories.tsx`
- What: `<TabSwitcher.Item isDisabled>` is now actually honored — the render
  loop forwards it to the underlying RAC `ToggleButton` (it was typed via
  `RACToggleButtonProps` but silently dropped, since items are marker
  components re-rendered by the root). RAC blocks selection and sets
  `data-disabled`; the existing SCSS dim (--opacity-50 + not-allowed cursor)
  finally fires. New `DisabledSoon` story: disabled option + gray subtle
  `<Badge>Soon</Badge>` — the coming-soon pattern. Also corrected the stale
  size docblock (control ladder is 32/36/44 since the 2026-06-30 retune, not
  32/40/48).
- Why: the chat top-bar Chat/Create switcher announces the Create
  (generation-grid) mode before it exists — the tab must be visible but
  locked, with a badge naming why.

## 2026-06-30 15:22 — stroke is an inset box-shadow ring, not a real border

- Files: `TabSwitcher.scss`
- What: the root pill and the sliding `__pill` now draw their 1px stroke as an inset box-shadow ring (`box-shadow: inset 0 0 0 var(--bw-default) var(--color-border-subtle)`) instead of a real `border`. The accent tone (`data-tone='accent'`) dropped its now-inert `border-color: transparent` — its accent glow (`box-shadow: var(--fx-accent-glow-shadow)`) is unchanged and still wins over the base ring. Mirrors the DS Button change in the same pass.
- Why: Val — a real border reserves a layout box and forms a crisp double edge against the active pill / the composer panel. A box-shadow ring takes no box and composites softly. The accent inner-glow was explicitly kept.

## 2026-06-30 04:46 — sliding pill: offset-driven transform (kill viewport-FLIP lag)

- Files: `TabSwitcher.tsx`, `TabSwitcher.scss`
- What: replaced the indicator's Motion shared-layout `layoutId` FLIP with a
  SINGLE persistent `<motion.span>` (first child of the group) animated to the
  active option's **container-relative offset box** (`offsetLeft/Top/Width/Height`
  accumulated up to the root). A real tab switch springs (`PILL_SPRING`); reflow /
  resize / mount snap. Removed the `layoutAnimationReady` 200ms `setTimeout` defer
  and the per-option conditional pill. SCSS: root `position: relative` (offset
  origin); pill `inset:0 + border-radius:inherit` → `top/left:0 + box-sizing:
  border-box + explicit 8px radius` (Motion drives width/height/translate); accent
  hover-glow descendant selector → `:has()` (pill is a sibling now, not a child);
  `overflow-x: auto` → `clip` (overshoot backstop). Visual contract unchanged.
- Why: Val — inside a popover (or any animating/scrolling ancestor) the pill
  **lagged vertically behind the rest of the control**: it trailed the parent's
  entrance `translateY` / `animateHeight` morph into place instead of staying
  welded to its track. Root cause — `layoutId` FLIP measures the pill in viewport
  coords, so any ancestor on-screen movement reads as a "layout change" and the
  pill springs to catch up. Offsets are transform-independent → immune to parent
  movement, the pill only slides on a genuine selection change. Supersedes the two
  prior partial fixes for this exact bug (2026-05-28 defer-timer, 2026-05-30
  `layoutDependency` + clip) that had been lost in later refactors.

- Files: `TabSwitcher.scss`
- What: `[data-tone='accent']` active pill swapped from a flat `--color-accent` fill to the shared `--fx-accent-glow-*` treatment (accent radial glow + inset accent inner-glow + uniform inset border on `__pill`); active option label `--color-fg-inverse` → `--color-fg-primary` (the pill is a dark glow surface now, not a solid accent fill — light fg reads, inverse/dark would not). Hovering the ACTIVE tab now ramps the glow up (`__option[data-active][data-hovered] .__pill` → `--fx-accent-glow-shadow-hover`, with a box-shadow transition on the pill) — mirrors `Button variant='accent'`; inactive tabs keep the default text-only hover.
- Why: Val — same accent-glow as the new `Button variant='accent'`; one shared token definition so the moving thumb and the CTA match. Pure inset box-shadow + bg on the pill → FLIP-animates with it, crisp corners. Cascades to ViewToggle + BillingToggle.

## 2026-06-29 10:22 — accent-tone label → inverse fg (accent is light gold now)

- Files: `TabSwitcher.scss`
- What: `[data-tone='accent']` active option label `var(--color-fg-on-active-nav)` → `var(--color-fg-inverse)`.
- Why: Val — the brand accent reverted from iris (dark #755DED) to pastel gold (#FDD59A, light). White text on the light-gold accent pill dropped to ~1.4:1; the inverse fg (dark on klyp / white-on-blue on unreals — the same token SolidButton uses on the accent) reads ~13:1.

## 2026-06-29 03:36 — tone='accent' (brand-accent active pill)

- Files: `TabSwitcher.tsx`, `TabSwitcher.scss`, `TabSwitcher.stories.tsx`
- What: new `tone?: 'neutral' | 'accent'` prop (default `'neutral'`). `tone='accent'` paints the active sliding pill with `--color-accent` (iris #755DED) and flips the active option label to solid `--color-fg-on-active-nav` (white-on-iris.700 ≈ 4.62:1, AA). `data-tone='accent'` on the root; inactive options unchanged. Added a `ToneAccent` story.
- Why: Val — the chat-composer output-modality switcher (Video/Image/Text/Audio) should show the new brand accent on the active tab. Opt-in per the single-accent rule (NOT the default for every segmented control); applied only at `composer-settings-popover.tsx`. Other TabSwitchers (BillingToggle, Library filters, ModelPicker) stay neutral.
- Note: on Unreals (light) `tone='accent'` would paint blue.500 with the light-theme `fg-on-active-nav` (dark) → low contrast; deprioritised (Val: ignore Unreals) — give Unreals an override or use white there if it ever adopts the accent tone.

## 2026-06-23 16:27 — option fills wrapper (fix option-taller-than-wrapper overflow)

- Files: `TabSwitcher.scss`
- What: the option `min-height: var(--tab-switcher-option-h)` (md = 34px) →
  `min-height: 0`. The option now fills the wrapper's inner height via the
  parent flex `align-items: stretch` instead of a fixed floor.
- Why: design-lead ("кнопки внутри больше обёртки") — after the 2026-06-18
  control re-scale `--control-size-md` is 32px, but the 34px option floor stayed,
  so every md option overflowed its 32px wrapper by ~2px (visible as the inner
  buttons poking out of the segmented control). Stretch-to-wrapper is
  control-size-agnostic, so it can't drift again. `--tab-switcher-option-h` is
  kept (ModelPickerModal's search row still reads it). Verified in catalog:
  md option 34→26px, sits inside the 32px wrapper; active pill within bounds.

## 2026-06-18 14:21 — re-point md/lg after control-scale re-scale (regression fix)

- What: `&[data-size='md']` block-size `var(--control-size-lg)` → `var(--control-size-md)`; `&[data-size='lg']` `var(--space-48)` → `var(--control-size-lg)`. sm stays `var(--control-size-sm)`. Net: sm/md/lg = 32/40/48 (= control sm/md/lg).
- Why: the `feat(ds): button size scale` re-scale (tokens CHANGELOG 12:58) shifted `control.size` up a step — `--control-size-lg` went 40→48, `--control-size-md` 32→40. My 11:53 fix had md pointing at `--control-size-lg` (then 40), so after the re-scale the md switcher rendered **48px** and the composer footer (attach / settings-trigger / Generate / BrandSelect all 40) was misaligned again. Re-pointed md to `--control-size-md` (the new 40 default) — the semantically correct rung. Verified live: all 7 composer switchers + every footer control back to exactly 40.

## 2026-06-18 11:53 — fixed-outer-height (kill adaptive height)

- What: outer pill height is now set DIRECTLY per size via `block-size` (the root already has `box-sizing: border-box`, so padding + border are absorbed) instead of being derived as `option-h + 2×padding + 2×border`. New fixed ladder: `sm` = `--control-size-sm` (28px), `md` = `--control-size-lg` (40px), `lg` = `--space-48` (48px). `--tab-switcher-option-h` is kept (ModelPickerModal's search-row math reads it + it stays the option min-height floor) but no longer drives the outer height.
- Why: the derived math never landed on a clean 40 — `--bw-default` renders sub-pixel (1px token → ~0.8px used), so md measured **39.6px** in the composer, visibly shorter than the 40px settings-trigger / Generate / BrandSelect beside it. Fixing `block-size` makes every size exact regardless of border rounding (verified: all md switchers now 40.00px). Outer heights also nudged to the values the doc already promised (sm 25.6→28, lg 41.6→48).

- What: `--tab-switcher-option-h` for `data-size='md'` 30px → 34px, so the md outer pill is now 40px (34 + 2×`--space-2` + 2×`--bw-default`). `sm` (20) / `lg` (36 option-h → 42 outer) unchanged. Stale "2× --space-4 (8px)" formula comment corrected to the real `--space-2` padding.
- Why: DS-wide control-height baseline bump 36→40 (`control.size.lg`). md is the default segmented-control height and drives the chat/studio modality bar (`__modalityBar`), ViewToggle, and BillingToggle — all now 40px in lockstep with the footer controls.

## 2026-05-30 22:16 — gate-pill-flip-to-real-switches + clip-overshoot

- What: the sliding-pill `<motion.span layoutId>` now carries
  `layoutDependency={value}`, and the root's overflow guard changed from
  `overflow-x: auto` (the old "mobile escape hatch") to `overflow-x: clip`.
- Why: in the LibraryPicker toolbar, changing the NEIGHBOURING media-type
  `<BrandSelect>` (e.g. audio → image) widens its trigger (longer label +
  an added icon), which reflows the right-aligned `nowrap` toolbar and
  shifts the whole TabSwitcher sideways. Motion FLIP re-measures the pill's
  viewport box on every commit render where it moved — it can't distinguish
  a real tab switch from an ancestor reflow — so it springs the pill across
  that shift; with the active tab on the rightmost option the transient
  pushes the pill past the root's right edge, and the old `overflow-x: auto`
  rendered that as a flashing horizontal scrollbar. `layoutDependency={value}`
  gates re-projection to genuine selection changes (Motion v12 canonical
  lever, the Radix Tabs pattern), so unrelated reflows no longer animate the
  pill. `overflow-x: clip` is a defence-in-depth backstop: any residual
  spring settle (damping 44 ≈ critical but ~1.6% subcritical) is clipped
  with no scroll container and no scrollbar. overflow-y stays `visible` so
  the single-axis clip doesn't degrade to `hidden`. No shipped consumer ever
  genuinely horizontal-scrolled, so dropping the auto escape hatch is safe.
  Root cause confirmed by a 4-agent parallel investigation (BrandSelect
  width / Motion mechanism / overflow amplifier / loading-state + working
  examples).

## 2026-05-28 06:14 — defer-pill-motion-until-parent-settles

- What: the FLIP indicator pill renders as a plain `<span>` for the first
  ~200ms of each TabSwitcher instance, then swaps to the real
  `<motion.span layoutId>`. Switch is gated by a `useState` flag toggled
  via `setTimeout` in `useEffect`. Static and motion spans share the
  exact same className + slot, so the swap is visually invisible to the
  user.
- Why: when TabSwitcher mounts inside a popover / dialog / dropdown
  that's mid-`[data-entering]` CSS animation (scale + translate +
  `transform-origin` at the anchor, `--duration-fast` ≈ 150ms), Motion
  measures the pill's rect WHILE the ancestor is still transforming —
  captures a bogus starting position near the anchor (e.g. the chat
  composer settings trigger button) and springs the pill from that
  bogus rect to its real slot. Visible bug: pill "flying in from
  outside the popover" on every open. A prior attempt with
  `initial={false}` made it worse — the motion.span still measured
  during the parent transform, but now the layout-change on the next
  paint (after parent settled) triggered a second spring, producing a
  double jolt. Delaying the motion.span mount until the ancestor's
  entrance animation has finished is the documented Motion pattern for
  "layout animation inside an animating parent" and avoids the bad
  measurement entirely. Cross-tab FLIP slide between options is
  unchanged once the flag flips.

- What: `data-size='md'` option-h bumped from `28px` to `30px`.
- Why: outer pill formula is now `option-h + 4 (padding) + 2 (border) = 36px`
  — matches the 36px common control height (BrandSelect trigger,
  composer attach button, settings popover trigger). After the
  preceding padding/gap shrink, md outer dropped to 34px which broke
  visual lockstep with neighbouring 36px controls. Bumping option-h
  closes the 2px gap.

## 2026-05-27 22:39 — tighten outer pill (padding/gap 4→2, radius card→chip)

- What: outer pill `padding` and `gap` reduced from `var(--space-4)` (4px)
  to `var(--space-2)` (2px); `border-radius` switched from `var(--r-card)`
  (12px) to `var(--r-chip)` (10px). `background` and `border` unchanged.
- Why: design lead — chat composer settings popover layout needs tighter
  segmented control density so 3 dropdowns + 2 TabSwitchers fit one
  panel without truncating labels. Tokens-only change keeps the rest of
  the system aligned (every consumer now reads the same tightened pill).
- Impact: outer pill height = `option-h + 4 + 2 = option-h + 6` (was
  `option-h + 10`). Existing `data-size` values (sm 20/26, md 28/34,
  lg 36/42) become outer 26/34/42 respectively — visible shrink ~4px.

## 2026-05-24 20:51 — typecheck fix (BLUR_PULSE_ACTIVE mutable array)

- What: `BLUR_PULSE_ACTIVE` keyframe array dropped its `as const`
  assertion and gained an explicit `string[]` annotation.
- Why: latest Motion type signature for `animate.filter` expects a
  mutable `UnresolvedValueKeyframe[]`, not a readonly tuple. Blocked
  `pnpm typecheck` after the recent Motion bump.

## 2026-05-24 17:16 — blur-pulse-on-activation

- What: icon + label of the activating option momentarily blur (0 → 4px → 0 over 0.3s `easeOut`) when selection lands on them. Wrapped in a new `.klyp-TabSwitcher__inner` flex layer so the filter composites once (no overlap-doubling on icon strokes). Sliding pill spring is unchanged.
- Why: the design lead wanted the FluidTabs (motion.dev reference) blur micro-pulse on top of our existing FLIP indicator — adds a "focus shift" beat that reads the selection event without slowing the pill's snap-into-place.
- How to apply: additive, no API change. Single `<motion.span>` wrapper around icon + label; fullWidth ellipsis chain re-threaded (`__inner` flexes `1 1 0` with `min-width:0` under `[data-fullwidth]`). `MotionConfig reducedMotion="user"` already at root → users with reduced motion skip the keyframe array automatically.

## 2026-05-23 — icon-only mode

- `iconOnly?: boolean` prop on root — visually hides option labels (kept in DOM for the accessible name) and wraps each option in `@klyp/ui/Tooltip` so the label surfaces on hover/focus with a 300ms delay.

Why: `/library` toolbar needed a compact filter strip mirroring Magnific/Mage — the previous secondary sub-rail ate ~220px of horizontal chrome before any assets rendered.

How to apply: pair with `<Item icon={...}>` on every child. The icon size auto-bumps one step (sm 14→16 / md 16→18 / lg 18→20) and option padding collapses to `--space-8` so the pill stays square-ish without forcing manual sizing.

## 2026-05-22 19:55 — backfill-pre-2026-05-20

Single rollup of public-API and visible changes that landed without changelog entries between primitive creation (`1d8cb345`, 2026-05-04) and the previous entry (`2026-05-20 21:44 — badge-option-4px-padding`). One consolidated record per design lead — no per-commit fan-out, no fabricated "Why" lines for other people's commits.

**API additions:**

- `Item.icon` — optional Iconsax outline glyph rendered before the label, sized per `size` variant (sm 14 / md 16 / lg 18), color inherits via `currentColor` — `c336e56e` (2026-05-13).
- `shape='pill'` — fully-rounded outer + inner radius variant, used by `<BillingToggle>` Monthly/Annual; default `shape='card'` keeps `--r-card` corners — `596efaa0` (2026-05-21).
- `fullWidth` — slot-based layout: outer pill stretches to parent, options share equal-width slots with ellipsis truncation; consumer in `<ModelPickerModal>` category row — `244d64dc` (2026-05-22).

**Visible refactors:**

- `1d8cb345` (2026-05-04) — initial primitive: segmented control with Motion FLIP sliding thumb (`<motion.span layoutId>` shared-layout animation). v8 → v9 rewrite history is preserved in the TSX header comment.
- `e4cbce09` (2026-05-12) — Phase 5: `apps/docs` Storybook deleted; `.stories.tsx` types codemod'd to `__shared/stories-types`. Visual contract unchanged.
- `9954c3d8` + `dbe2228b` (2026-05-13) — radii consolidated 9 → 5 semantic aliases; option corner radius re-aligned to the chat-composer v9 ramp.
- `dc525f79` (2026-05-16) — focus ring border-width swept `--bw-emphasis` → `--bw-default` (global thin-ring sweep).

## 2026-05-22 19:15 — stories-coverage-all-api

- What: nine new stories — `ShapePill`, `ShapePillSizes`, `WithBadge`, `MixedBadge`, `BillingToggleLook`, `IconAndBadge`, `FullWidth`, `FullWidthLongLabels`, `DisabledItem`. No `.tsx`/`.scss` changes — visual contract untouched.
- Why: catalog stories had to cover every public API flag. Previous file showed only size + icon + option-count permutations; `shape='pill'`, `fullWidth`, `badge`, and per-item `isDisabled` were invisible on `/components/tab-switcher`.

## 2026-05-20 21:44 — badge-option-4px-padding

- What: option with `[data-has-badge]` now has 4px padding on top, bottom, and right (left stays at `--tab-switcher-padding-x`). `height` → `min-height` so the badge-bearing option can grow and the sibling stretches to match.
- Why: the design lead — badge inside the inner pill should sit with 4px breathing room on R/T/B (uniform with the outer pill gutter).

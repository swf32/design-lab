# MeshButton — changelog

## 2026-06-26 17:15 — align width prop with Button (fixedWidth → fluidWidth)

- What: replaced `fixedWidth` with `fluidWidth` to match Button's naming AND
  default. **Behaviour change:** the default is now FIXED (was fluid) — the
  state-machine button locks to the widest label unless you opt into
  `fluidWidth`. Internally the plumbing still keys off a derived
  `fixedWidth = !fluidWidth`, so only the public prop changed. Migrated the
  two state-machine callsites (referral-hero-a, pricing-referral-card) —
  both already passed `fixedWidth`, so they just drop it. Stories + docs
  updated.
- Why: the asymmetry (MeshButton fluid-default `fixedWidth` vs Button
  fixed-default `fluidWidth`) was confusing; both components now expose the
  same toggle the same way. No callsite relied on the old fluid default.

## 2026-06-26 17:07 — static iconLeft/iconRight + playground

- What: static mode now renders `iconLeft` (prefix) and the new `iconRight`
  (suffix) as real slots with mirrored optical padding compensation
  (`data-icon-left/right`, per-size padding-left/right). Previously static
  icons only came through freeform children and `iconLeft` was
  state-machine-only. State-machine mode unchanged (morphing icon stays
  left; `iconRight` ignored there). Stories: added `args`/`argTypes` so the
  catalog Playground renders for MeshButton, plus a `PrefixSuffix` showcase.
- Why: parity with Button's prefix/suffix icons + a working playground (lead
  request).

## 2026-06-26 17:02 — fill prop + slot truncation

- What: added `fill` prop (slot-based width — stretches to the section,
  overrides the default `flex-shrink:0`). Under `fill`, a string label
  truncates with an ellipsis (string/number children wrapped in
  `klyp-MeshButton__text`; freeform icon+text children keep the existing
  single-line clip). `fill` passes through to the non-klyp `SolidButton`
  fallback too (SolidButton gained the same `fill` + ellipsis content).
- Why: parity with Button's slot-based `fill`/truncation (design lead) — the
  button can now live in a width-constrained section without the caller
  hand-rolling overflow handling.

## 2026-06-18 12:58 — full size range (xs/sm/md/lg/xl)

- What: added `data-size='xs'` (24px, mesh-blur 4px, icon 14px) + `data-size='xl'` (56px, mesh-blur 12px, icon 24px) to complete the ladder; `lg` font base→`--type-buttons-lg`; extended `ICON_SIZE_BY_BUTTON_SIZE` map with xs/xl. Default stays md (now 40). Sizes story + prose updated. Mesh/goo/state-machine untouched.
- Why: DS-wide button size scale extended — see `@klyp/tokens` CHANGELOG 2026-06-18.

## 2026-06-17 16:03 — control-height-36-to-40 (DS baseline)

- What: `data-size='md'` height 36px → 40px (the lg control baseline). sm (32) / lg (44) and the coarse-pointer touch floor unchanged. Stories "Sizes" prose updated (md 36px → 40px).
- Why: DS-wide control-height baseline bump 36→40 (`control.size.lg`; see @klyp/tokens CHANGELOG). md is the default button height used by the prompt-composer Submit and across the app; bumped so all lg controls stand 40px.

## 2026-06-12 — useid-goo-filter

- What: Goo `<filter>` id is now useId-unique per instance (`klyp-MeshButton-goo-<useId>`), passed into `MeshButtonGooFilter` and consumed in SCSS via the inline `--mesh-goo` var with the old static id as fallback.
- Why: duplicate static `<filter id>`s across N mounted buttons are Safari resolution roulette (last-parsed definition wins, re-resolved per paint) and broke Yandex Browser on many-instance pages. Ported from the parallel Safari-clip session (e5e5531) — the clip part of that commit was superseded by the reviewed `__meshInner` rework, the id part wasn't.

- What: Split the mesh into a rounded clip wrapper + an inner blur layer to stop blobs/blur halo leaking past the rounded corners on iOS/Safari. DOM: `__mesh` (was the filtered layer) is now a clip wrapper — `border-radius: inherit; overflow: hidden;` + a self-mask `mask: linear-gradient(#000 0 0)`; the goo filter + `blur()` moved to a new inner child `__meshInner` that holds the 4 blobs. TSX (both static + state-machine branches) wraps the blobs in `__meshInner`. Stale goo-filter comment referencing the removed `clip-path` updated.
- Why: design review — on iOS/Safari `overflow: hidden + border-radius` on an ancestor does NOT clip a COMPOSITED (filtered) descendant, so the mesh blobs spilled outside the button's rounded border (Chromium clipped fine). A self-mask on the clip wrapper forces WebKit to flatten the subtree and apply the rounded clip; placed on `__mesh` (not the host) so the host's drop `box-shadow` isn't masked away. Avoids `clip-path: inset() round`, which was removed earlier for forcing Chromium's aliased 1-bit clip raster.

## 2026-05-25 22:35 — tone-tint-down-to-10

- What: Tone tint mix `20% → 10%`.
- Why: design lead 2026-05-25 — 20% felt too saturated; 10% reads as a subtle undertone instead of a wash.

## 2026-05-25 22:30 — tone-tinted-background

- What: Host `background: var(--color-bg-surface)` → `color-mix(in srgb, var(--mesh-color-c2) 20%, var(--color-bg-surface))`. Surface now tinted 20% with the tone's primary blob colour — gold gets warm-amber undertone, neutral gets cool-silver, purple gets violet, blue gets navy. Works per-tone automatically since `--mesh-color-c2` re-maps via existing `[data-tone='X']` blocks (gold-300 / silver-300 / purple-700 / blue-700). Disabled state override (`--color-bg-surface-solid`) unchanged — dead buttons stay neutral.
- Why: design lead 2026-05-25 — wanted each tone's background to read as that colour family at rest, not as a generic dark surface. Mesh blobs read more cohesive over a matching tint than over a neutral dark.

## 2026-05-25 22:20 — hover-border-1px-15

- What: Hover/pressed `::before` ring `background --alpha-white-20 → --alpha-white-15`. Width stays 1px at both rest and hover (reverted the 2px-on-hover from 22:15). `padding` removed from `::before` transition (no longer animates). Rest state (1px, 5% white) unchanged.
- Why: design lead 2026-05-25 — 2px on hover felt too heavy; keep ring at 1px both states, only alpha ramps 5% → 15%.

## 2026-05-25 22:00 — remove-mesh-clip-path-and-bump-hover-border

- What: Two edits resolving the design lead's "pixel-aliased border + weak hover contrast" feedback. (1) **Removed `clip-path: inset(...)` on `.__mesh`** (was line 253). Mesh now relies on host's existing `overflow: hidden` + `border-radius` + `isolation: isolate` (lines 62, 74, 92) — the AA-correct Skia SkRRect clip path and the canonical fix for the iOS Safari composited-children leak (WebKit bug 68196, closed Sep 2022, activates via `isolation: isolate`). (2) **Hover border alpha `--alpha-white-10` → `--alpha-white-20`** (line 391) — `::before` ring now ramps 5% rest → 20% hover for stronger activation feedback. Goo filter chain, all 4 blobs, palette per tone, `::after` gold glow, sizes, content layer, state machine (still consumed by CopyableLink in production) — unchanged.
- Why: design lead 2026-05-25 — pixel stair-steps visible on the rounded border on desktop Chrome + hover border too subtle. Root cause of the aliasing was the `clip-path: inset(...)` added across 4 commits 2026-05-23 (19:19 → 20:25 → 21:05) trying to fix iOS halo bleed; Chromium Skia renders `clip-path` via 1-bit clip stack (no sub-pixel AA, [Imperial Violet 2009](https://www.imperialviolet.org/2009/09/02/anti-aliased-clipping.html), [Chromium #40846656](https://issues.chromium.org/issues/40846656) — still open). With `isolation: isolate` already on the host since pre-session, the iOS halo concern is handled WITHOUT clip-path — WebKit bug 68196 fix activates via the stacking context. Multi-agent audit (architecture / production patterns / browser-bug state) confirmed: clip-path is the bug, removing it is the fix, no replacement workaround needed unless iOS halo bleeds again on a specific device — then escalate to `-webkit-mask: linear-gradient(#000)` or inner unstyled clip div.

## 2026-05-23 21:35 — revert-filter-region-clamp

- What: Removed `x="0" y="0" width="100%" height="100%"` from `<filter id="klyp-MeshButton-goo">` — restored SVG spec default region (-10% / 120%). Goo filter primitives, `clip-path` on `.__mesh`, `::before` border, all other geometry — unchanged.
- Why: design lead 2026-05-23 — dark wedge-shaped voids visible inside the rounded corners (purple-tone screenshot). Root cause: the 19:19 region clamp killed blur halo coverage in the corners. `feGaussianBlur stdDeviation=5` at the bbox edge convolves with off-region samples treated as transparent black → alpha quartered in corners → `feColorMatrix 0 0 0 16 -7` alpha-clamp (threshold ~0.44) kills the remainder → fully transparent corner wedges → dark `--color-bg-surface` shows through. The iOS halo-bleed concern that motivated the clamp is already handled by `clip-path: inset(...) round` on `.__mesh` (added 20:25) — it clips the rasterised filter output regardless of filter region. Multi-agent research (3 parallel) confirmed: default `-10%/120%` exists specifically so halos can extend; clamping is the canonical "container should be larger than its contents" violation from Lucas Bebber's original goo article.

## 2026-05-23 21:05 — clip-path-inset-hides-aliasing-under-border

- What: `__mesh` clip-path `inset(0 round var(--r-chip))` → `inset(var(--bw-default) round calc(var(--r-chip) - var(--bw-default)))`. Clip rectangle shrunk by 1px on each side, corner radius reduced by 1px to match. iOS goo-bleed scope (clip on `__mesh`, not host) preserved.
- Why: design lead 2026-05-23 — visible pixel stair-steps on rounded corners on desktop Chrome after the iOS clip fix (screenshot). Root cause is architectural: Chromium's Skia renders `clip-path` via a 1-bit clip stack (no sub-pixel AA on the edge — [Imperial Violet 2009](https://www.imperialviolet.org/2009/09/02/anti-aliased-clipping.html), [Chromium #40846656](https://issues.chromium.org/issues/40846656)), and our goo `feColorMatrix` alpha-clamp produces a hard-edged silhouette by design. Hard raster + 1-bit clip = aliased arc. Canonical "hide aliasing under the border" pattern: shrink the clip by `--bw-default` so the seam sits behind the host's `::before` 1px gradient-border, which opaquely covers it. Multi-agent research (3 parallel) ranked this as the cheapest fix that doesn't regress iOS, doesn't add a mask rasterisation pass (option B), and doesn't touch the SVG filter chain (option C — risk of disturbing the tuned hard-light + plus-lighter blend balance).

## 2026-05-23 20:50 — border-width-back-to-1px

- What: Reverted `::before` inset border `--bw-emphasis → --bw-default` (2px → 1px).
- Why: design lead 2026-05-23 — 2px felt too heavy on the rounded geometry; reverting to 1px. Hover brighten (5% → 10%, from 20:35) preserved.

## 2026-05-23 20:42 — border-width-2px

- What: `::before` inset border width `--bw-default → --bw-emphasis` (1px → 2px) via the `padding` property of the mask-composite gradient-border. Mask geometry, `background` alpha (5% rest / 10% hover from 20:35), `mix-blend-mode: plus-lighter`, `border-radius: inherit` — unchanged.
- Why: design lead 2026-05-23 — 1px rim disappeared into the dark surface at typical viewing distances; 2px gives the button a more confident edge while staying inside the chip radius (10px) so corners still read cleanly.

## 2026-05-23 20:35 — hover-border-brighten

- What: `::before` inset border background animates `--alpha-white-05 → --alpha-white-10` on `data-hovered` / `data-pressed`. Added `transition: background` to `::before`. Resting state, mask geometry, `mix-blend-mode: plus-lighter`, 1px width — all unchanged.
- Why: design lead 2026-05-23 — on hover the rim was static at 5% alpha while everything else (content opacity, text colour, inset gold glow, icon scale) reacted. Doubling to 10% on hover gives the border a subtle pulse that reinforces the activation feedback without competing with the gold glow underneath.

## 2026-05-23 20:25 — ios-corner-clip-scope-to-mesh

- What: Moved the `clip-path: inset(0 round var(--r-chip))` from the host `.klyp-MeshButton` (added 19:19 below) onto the `.klyp-MeshButton__mesh` wrapper. Reverted focus-visible back to `outline + outline-offset` (the box-shadow ring substitution is no longer needed when host has no clip-path). SVG filter region clamp (`x=0 y=0 100%×100%` from 19:19) preserved.
- Why: 19:19 host-level clip-path made the 1px `::before` inset border (drawn via mask-composite on the host's perimeter) clip against the rounded geometry — anti-aliased pixels at the corners got shaved → visible border disappeared (design lead 2026-05-23 regression). Scoping clip-path to the mesh wrapper isolates the iOS goo-bleed fix to the blob layer, leaving `::before` (border) and `::after` (hover glow) un-clipped on the host. Net effect: rounded-corner halo bleed still fixed on iOS, border restored on desktop.

## 2026-05-23 19:19 — ios-corner-clip-fix

- What: 3-part fix for goo mesh bleeding past the button's rounded corners on iOS Safari. (1) Added `clip-path: inset(0 round var(--r-chip))` next to the existing `overflow: hidden` + `isolation: isolate` — compositor-level geometric clip that WebKit honours even when descendants are composited (filter / mix-blend-mode / animated transform). (2) Clamped the SVG goo filter region to `x="0" y="0" width="100%" height="100%"` (was spec-default `-10%/120%`) — kills the 10% halo margin that lets blurred blob silhouettes escape the bbox before the parent clip kicks in. (3) Replaced focus-visible `outline + outline-offset` with a layered `box-shadow` ring (base drop shadow → 2px surface gap → 1px `--color-ring`) — box-shadow renders outside clip-path on a separate compositor layer; `outline` under clip-path can be cropped on some WebKit versions. Base drop shadow, inset border (`::before`), hover glow (`::after`), mesh palette, animations — all unchanged.
- Why: the design lead reported on mobile that gradient halos visibly bled past the rounded corners across most placements (screenshot 2026-05-23). Root cause is the well-known WebKit composited-children + border-radius clipping leak (Bugzilla #68196 canonical-FIXED 2022, but the filter+blend+animation edge case still leaks on iOS 17/18). Multi-agent research (3 parallel) converged on `clip-path` + filter-region clamp as the lightest fix that doesn't promote the button to a new GPU layer (which would re-rasterise the SVG filter every animation frame and tank battery).

## 2026-05-20 20:55 — base-shadow-deeper

- What: base drop-shadow geometry `0 3px 8px → 0 5px 12px`. Color (`--alpha-black-20`) and inset gold glow on `::after` unchanged. Disabled override (`box-shadow: none`) unchanged.
- Why: design lead 2026-05-20 — wanted the button to sit higher off the surface (bigger offset + softer/wider blur for stronger lift).

## 2026-05-17 00:50 — state-swap-durations-unified-and-halved

- What: icon swap duration `0.15s → 0.1s`; label swap duration `0.2s → 0.1s`. Both equal now. Easing (`easeInOut`), y-distances, scale/blur/opacity values, width spring — all unchanged.
- Why: design lead 2026-05-17 — icon and label were swapping at different speeds (icon faster), reading as ragged. Asked for unified speed + 2× snappier. Picked 0.1s as the unified value (= label/2, exact 2× faster; icon also faster going 0.15 → 0.1).

## 2026-05-17 00:52 — state-swap-flicker-fix

- What: 4-part fix for visible flicker on idle ↔ success transitions. (1) Both `<AnimatePresence>` instances (`BadgeIcon` + `BadgeLabel`) switched from default `mode='sync'` → `mode='wait'` — sequential exit-then-enter eliminates the simultaneous overlap of cross-fading children. (2) `layout` prop removed from `BadgeLabel`'s outer width-animating `motion.span` — it was double-driving the same width animation alongside the explicit `animate={{ width }}`. (3) `position: absolute ↔ relative` morph removed from `BadgeLabel`'s inner `motion.div` (`position` is a discrete CSS property motion can't interpolate; the snap caused parent reflow). Inner div now permanently `position: absolute, inset: 0` inside the width-locked span. (4) `labels` object memoised in `MeshButtonAnimated` to stop identity churn on parent re-renders.
- Why: design lead 2026-05-17 — even after y-distance tightening (00:38), the referrals `Copy link → Copied` swap visibly flickered / showed double labels. Two parallel code-review agents converged on the same root causes (AnimatePresence sync overlap + `layout`/`animate` double-drive + discrete `position` morph).

## 2026-05-17 00:38 — state-swap-y-distances-tightened

- What: state-machine icon swap `y` reduced `±40 → ±14`; label swap `y` reduced `±20 → ±8`. All other animation params (scale, blur, duration, easing, width spring) unchanged.
- Why: motion.dev demo values were tuned for a much taller demo badge; on our 20px icon slot and 14px text the original ±40 / ±20 looked like a scrolling ticker on idle ↔ success transitions (first visible on referrals `Copy link` → `Copied`).

## 2026-05-16 23:23 — purple-blue-tones-plus-silver-neutral

- What: `MeshButtonTone` extended with `'purple'` and `'blue'`; `'neutral'` reworked from gold-inherit to fully silvery (4 cool greys). Gold hot-spot blobs (c1/c2/c4) override per tone via `&[data-tone='…']`, silver counterpoint blob (c3) preserved across all tones. Hover glow auto-tints because `::after` reads `--mesh-c2`.
- Why: the design lead needed non-gold MeshButton for surfaces where gold competes with the brand CTA (e.g. referrals Withdraw); silver neutral resolves the previous no-op `tone='neutral'` that visually equalled gold.

## 2026-05-16 20:25 — solid-5-border-1px

- What: `::before` inset border switched from 1px gradient (white 3% → 10%) to solid `--alpha-white-05` at 1px (`--bw-default`). `mix-blend-mode: plus-lighter` retained.
- Why: the design lead asked for a flatter frame at hairline width; `plus-lighter` already redistributes the 5% warmly over mesh hot-spots and coolly over dark zones, so a uniform alpha still reads alive.

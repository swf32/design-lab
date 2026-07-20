# Button — changelog

## 2026-07-02 15:34 — glow prop (accent variant glow colour swap)

- What: new `glow?: 'accent' | 'neutral'` prop (default `'accent'`, `variant='accent'` only) — `'neutral'` swaps the glow treatment (radial bg + inset inner-glow) from the brand accent to white-alpha, reading as a silver/gray glow on the dark surface. Renders as `data-glow`, threaded through all three render branches; SCSS refactored to local `--btn-glow-*` vars (same pattern as `--btn-ring`) fed by three new tokens `--fx-neutral-glow-{bg,shadow,shadow-hover}` (accent recipe with `white` in place of `{color.accent}`, ring unchanged; follows the `card-inset-glow-silver` white precedent). `ButtonGlow` exported from the barrel; `glow` argType + `AccentGlow` story added.
- Why: Val — the accent CTA's glow needed a colour dial; first stop is a neutral (white-with-alpha, i.e. gray) glow inside the same accent treatment.

## 2026-06-30 15:22 — stroke is an inset box-shadow ring, not a real border

- What: dropped the base `border: 1px solid transparent`; the variant stroke is now an inset box-shadow ring (`box-shadow: inset 0 0 0 var(--bw-default) var(--btn-ring)`). Variants set a local `--btn-ring` instead of `border-color` (primary/secondary 3%→default on hover, outline default→strong); ghost/destructive/link/accent dropped their now-inert `border-color: transparent`. Accent keeps owning `box-shadow` (the glow). No visual change to the variants at rest.
- Why: Val — a real 1px border reserves a layout box and forms a crisp "double edge" against a bordered container (the composer submit square inside the panel border). A box-shadow ring takes no box, paints over the fill, and composites softly — same look, no double edge.

## 2026-06-30 02:32 — variant='accent' (brand-accent glow CTA)

- What: new `variant: 'accent'` — the only coloured Button variant. Dark surface + brand-accent radial glow + inset accent inner-glow under a uniform inset border, all from the shared `--fx-accent-glow-*` tokens; border + glow brighten on hover (added `box-shadow` to the base transition). Added to `ButtonVariant` + `VARIANT_MAP` + the Variants/States stories + playground options.
- Why: Val — the system had no accent CTA (palette was all-neutral; only `link` used accent fg). Ports the chat model-pill glow into the DS as a reusable, brand-aware (`{color.accent}` → gold klyp / blue unreals) accent treatment, shared with `TabSwitcher tone='accent'`. Inset-only → crisp on rounded corners, no layout shift. Opt-in per the single-accent rule.

## 2026-06-29 03:52 — resting border 5% → 3% (primary + secondary)

- What: `primary` and `secondary` resting `border-color` `var(--color-border-subtle)` (alpha-white-05, 5%) → `var(--alpha-white-03)` (3%). Hover still bumps to `--color-border-default` (10%); outline / ghost / destructive / link unchanged.
- Why: Val — quieter resting stroke on the standard buttons. Token-based (3% alpha primitive), scoped to Button (no global `border.subtle` change). VoiceDictation mic face got the same 3% in the same pass.

## 2026-06-27 21:48 — animateWidth (fluid width via FLIP layout)

- What: new opt-in `animateWidth` prop (static mode only) — the button sizes to
  its content, clamps to its slot (`max-width:100%`), and MORPHS its width when
  the content changes, for picker-pill summaries that swap as a setting changes.
  `ButtonFluidStatic` uses Motion's FLIP `layout`: `motion.create(RACButton)`
  with `layout` on the button + `layout="position"` on the inner
  `__fluidContent` cluster, so the box + text morph TOGETHER, synchronously with
  the React commit (no measure→setState frame lag, no text distortion). Spring
  `APPLE_WIDTH_SPRING` = `{ visualDuration: 0.22, bounce: 0 }` (clean, no
  overshoot). `<MotionConfig reducedMotion="user">` auto-snaps under reduced
  motion. `__text` truncates with an ellipsis when the slot is too narrow; FLIP
  measures the post-clamp box, so it animates to the clamped width. Icons sized
  by the CSS `--icon-size-*` token scale (matches the static `> svg` branch). No
  stamp / ResizeObserver / width-state. Static (non-animate) + state-machine
  branches untouched — zero cost unless opted in. Story `AnimateWidth` +
  `animateWidth` playground argType. (Conflicting motion-vs-RAC prop types —
  `onAnimationStart` / `onHoverStart` / `onHoverEnd` / `style` — are stripped
  from the RAC passthrough.)
- Why: the chat composer's settings pill moved onto Button; the lead wants the
  pill width to float — not snap, no bounce, "Apple-like" — when the
  model/aspect/resolution summary changes, and to truncate cleanly in a tight
  footer. First impl measured a hidden stamp + sprang CSS `width`; it lagged a
  frame (text first, width after) and felt toporno — replaced with FLIP layout.

## 2026-06-26 17:07 — resizable-slot truncation story

- What: `FillTruncate` story is now interactive — a Slider resizes the slot
  (80–360px) so the ellipsis can be checked live as the label stops fitting.
- Why: easier to verify `fill` truncation than a fixed-width container.

## 2026-06-26 17:02 — rename fullWidth → fill, slot truncation

- What: `fullWidth` renamed to `fill` (slot-based width). `fullWidth` kept
  as a deprecated alias so existing callsites keep working; `data-full-width`
  → `data-fill`. New behaviour: under `fill`, the text label truncates with
  an ellipsis when the slot is narrower than the content — string/number
  children are now wrapped in `klyp-Button__text` (`overflow/ellipsis/nowrap`
  + `min-width:0`); icon-only children stay direct `> svg` so icon sizing is
  untouched. The icon-padding compensation still applies. Migrated the one
  Button callsite (DevSignInPanel). Stories: `FullWidth` → `Fill`,
  `FillTruncate` added, argType renamed.
- Why: lead approved the rename — `fullWidth` didn't convey "fill the slot
  and shrink to fit"; truncation makes the button safe in tight sections.

## 2026-06-26 16:52 — fluidWidth opt-in + corrected sparkle icon

- What: (1) added `fluidWidth` prop (state-machine only). Default stays
  FIXED — width locks to the widest state, no reflow during transitions
  (unchanged behaviour). `fluidWidth` springs the content box to the
  current state's width like MeshButton (spring 600/30), so the button
  grows/shrinks as the label changes. Content box is now a `motion.span`
  animating `width`; per-state widths measured at mount (was a single
  max). (2) Stories: `SparkleIcon` geometry corrected (was visually
  off-centre) — new 20×20 path; `fluidWidth` added to playground argTypes
  + new `FluidWidth` story.
- Why: lead wanted MeshButton's content-driven width available on Button,
  but as opt-in (fixed remains the safe default). Sparkle glyph was
  off-centre in the Generate demo.

## 2026-06-26 16:41 — optical padding compensation for icons

- What: when an icon sits on a side, that side's inline padding now tightens
  (prefix → left, suffix → right, both → both). New per-size
  `--pad-icon-side` var + `&[data-icon-left]/[data-icon-right]` rules; TSX
  sets the two attributes in both static and state-machine branches. Deltas
  match MeshButton (sm 12→10, md 16→12, lg 20→16, xl 24→20; xs 8→8 no
  change). `link` excluded (owns padding-inline:0); icon-only sizes never
  carry the attrs so their `padding:0` is untouched.
- Why: symmetric padding made the icon side read looser than the text side
  (glyphs carry built-in whitespace) — the classic "leading edge tightens"
  CTA rule. MeshButton already had it; Button didn't.

## 2026-06-26 16:34 — readable `state` select via mapping/labels

- What: the `state` playground control no longer puts a raw `undefined` in
  `options` (rendered as the literal `"undefined"`). Migrated to the
  Storybook-canonical `options` (string keys) + `mapping` ({ none:
  undefined }) + `control.labels` ({ none: '— none (static)' }) form, so
  the static-button choice shows a real name. Taught the catalog's
  `ComponentPlayground` to read `mapping` + `control.labels` (additive —
  existing stories without them are unchanged).
- Why: the empty/`undefined` option read as a mysterious "fifth state";
  this names it and makes the story migrate to Storybook cleanly.

## 2026-06-26 16:18 — align state-machine animation with MeshButton

- What: ported MeshButton's design-lead-tuned state-machine motion into
  Button (states only, no mesh/blobs/tones). Icon swap 0.15s→0.1s and
  y±40→±14; label swap 0.2s→0.1s and y±20→±8; both `AnimatePresence` now
  `mode="wait"` (was sync) for crisp sequential swaps without the
  double-ghost flicker. `ICON_ABS_STYLE` now `inset:0` + flex-centred so
  the swapping glyph sits at the optical centre instead of pinning
  top-left. Added `quietState` prop (gates success pop + error shake for
  paired input+button layouts). Stories: `StateMachineAutoFlow`,
  `StateMachineGrid`, `QuietState` added; `quietState` added to playground
  argTypes.
- Why: lead's MeshButton motion was tuned past the original motion.dev
  demo values (which read as a "scrolling ticker" on our 20px-icon/14px
  geometry); Button still used the demo values. Bring the canonical
  primitive up to the same feel.

## 2026-06-26 12:00 — prefix/suffix icons, remove loading, centre fix

- What: (1) added `iconRight` (suffix) alongside `iconLeft` (prefix) — use
  either or both in static mode. (2) removed the `loading` prop, the static
  spinner, `data-pending`, `isPending` passthrough and the spin keyframes
  entirely — the only busy affordance is now the animated `state` machine.
  (3) in `state` mode the morphing icon (spinner→check→cross) now follows
  the side you give it: `iconLeft` morphs on the left, `iconRight` on the
  right; if both are set, left morphs and right stays a static suffix.
  (4) centre fix: the locked width moved from the LABEL to the BUTTON, so
  the icon + gap + label cluster stays centred as one group and the gap is
  constant when the label length changes (was: icon pinned, text re-centred
  alone). Stories: `PrefixSuffix` added, `StateMachine` now shows left+right
  morph, `States` Processing column uses `state='processing'`, `LoadingModes`
  removed.
- Why: consumers needed trailing icons (arrows, chevrons); `loading` had
  zero callsites and duplicated the state machine; the old fixed-width label
  let the icon and text drift apart. Verified in catalog: prefix/suffix DOM
  order correct, morph side follows the prop, content centred (gaps 17/17),
  no new console errors.

## 2026-06-25 11:07 — remove isPending from public API

- What: `isPending` is now omitted from `ButtonProps` — consumers can no
  longer pass it. Busy state is driven by `loading` only; the component
  derives `isPending` from `loading` internally.
- Why: raw `isPending` gave a dim-without-spinner half-state that looked
  almost like idle — confusing, easy to misuse. `loading` is the one busy
  prop. No callsite passed it (verified), so removal is non-breaking.

## 2026-06-25 11:07 — loading consolidated onto RAC isPending + token hygiene

- What: `loading` no longer folds into `isDisabled` (which removed
  focusability) — it now routes through RAC `isPending` (focusable, press +
  hover blocked, busy announced) and dims via a new `&[data-pending]` SCSS
  rule. `isPending` passed directly is OR-merged so it works too. The
  animated `state` machine stays a separate mode (keyed on `[data-loading]`,
  full opacity). Token hygiene: `[data-disabled]`/`[data-pending]` opacity →
  `--opacity-disabled`; `text-underline-offset: 4px` → `var(--space-4)`.
- Why: cross-DS audit — three uncoordinated busy models; `loading` silently
  stripped focus. Geist/RAC norm: busy buttons stay focusable + announce.
  Verified in catalog: loading button focusable + data-pending + opacity 0.5.

## 2026-06-25 11:07 — drop legacy aliases (gold / default / cta)

- What: removed undocumented variant aliases `gold`, `default` and size
  aliases `default`, `cta` from the public API + maps. Migrated all
  callsites behaviour-preservingly: `variant='gold'` (×11, already rendered
  neutral) and `variant='default'` (×2) → `primary`; `size='default'` (×1)
  → `md`; `cta` unused. Added a header note steering icon-only use to the
  dedicated `IconButton`.
- Why: cross-DS audit — `variant='gold'` silently rendered neutral (palette
  rewrite), confusing devs who expected gold. One canonical name per
  variant/size; if a CTA truly needs gold it uses `MeshButton tone='gold'`.

## 2026-06-25 11:07 — fullWidth prop

- What: added `fullWidth?: boolean` → `data-full-width` → `width: 100%`.
  Migrated `DevSignInPanel` to the prop and deleted the per-consumer
  `& .klyp-Button { width: 100% }` overrides in Dev/Owner/Prod sign-in
  panels (Owner/Prod ones were dead — those panels render only MeshButton).
- Why: cross-DS audit — full-width was re-implemented as a SCSS override
  per consumer; HeroUI ships it as a prop. One affordance, no wrapper hacks.

## 2026-06-25 11:07 — States story → variants × states matrix

- What: reworked `States` from a single primary-only row into a
  variant × state grid (6 variants × Default/Loading/Disabled). Dropped
  the old forced `data-hovered`/`data-pressed` tiles — RAC owns those
  attributes and strips forced values, so they rendered as plain Default
  (non-functional). Hover/pressed/focus noted as live-only.
- Why: cross-DS audit — states were shown only for `primary`; consumers
  couldn't see how ghost/outline/destructive/link treat busy + disabled.

## 2026-06-25 11:07 — loading-modes story

- What: added `LoadingModes` story showing the two distinct busy UX —
  `loading` (spinner + dim, focusable) vs `state='processing'` (animated
  state-machine). Raw `isPending` not shown — it's the mechanism `loading`
  wraps, not a separate API.
- Why: cross-DS audit flagged uncoordinated "busy" models; the story makes
  the loading-vs-state distinction visible without inviting raw isPending use.
## 2026-06-24 14:57 — outline variant: no resting fill

- Files: `Button.scss`
- What: `data-variant="outline"` rest background `--color-bg-root` → `transparent`.
  It no longer reads more accented than secondary (which keeps its surface fill);
  hover/press still add a subtle surface.
- Why: design-lead — outline had an unexpected fill.
- Verified live (`/components/button`): outline bg transparent, secondary bg filled.

## 2026-06-19 — handoff hardening (barrel default re-export)

- What: `Button/index.ts` now re-exports the default (`export { default, Button }`).
  `Button.tsx` has `export default`, but the barrel only exposed the named export,
  so a default import resolved to nothing.
- Why: handoff readiness + repo canon (`frontend.md`: "Default export is the
  component"). Same gap the pilot Badge had. No code/visual change.

## 2026-06-17 23:08 — icon-square-story

- What: Added an `Icon` story exercising `size="icon-xs/sm/icon/icon-lg"` square buttons with an icon child.
- Why: The bumped icon-square (40×40) dimension was unexercised in the catalog Preview — the Sizes story only covered text sizes.

## 2026-06-17 — whole-px text scale (no half-pixel)

- What: every size now lands on a whole-px line box via the button text scale: xs 12/16, sm+md 14/18, lg **16**/20 (was 18px font), xl **18**/24 (was 20px font — the 20px size is gone). Per-size line-height set to the matched ratio (xs normal, sm/md compact, lg snug, xl normal).
- Why: base was `font-size-14 × line-height-tight(1.2) = 16.8px` → fractional line box → fractional button height (padding-driven sizes rendered at 34.8/30.8/… px). A unitless line-height is only whole for its paired font-size; the earlier even-px pass only fixed the `type.*` shorthands, not raw font-size+line-height pairings. Now all sizes are whole/even (26/32/36/46/50px outer heights).

## 2026-06-17 — destructive red + link purple

- What:
  - **destructive** now fills with `--color-status-danger-strong` (red.500 #c4363c, deep true red) + `--neutral-0` white text in both themes; hover/pressed use `filter: brightness()` instead of the `danger-muted` bg (which flips light↔dark per brand); dropped the destructive-specific `[data-disabled]` bg override (the global `[data-disabled]{opacity}` dims it).
  - **link** text recoloured from gold (`--color-accent`) to the brand-aware purple `--color-fg-accent-purple` (klyp purple.900, unreals purple.400).
- Why: destructive used `--color-status-danger` (red.900 #ffc2bd, PINK) as the fill with white text — read pink AND failed contrast (white on light pink); now a proper red, white-on-fill 5.33:1 both brands. Link moved off gold to purple per the design lead (matches MetaLabel accent); both purple values pass WCAG as text on the page.

## 2026-06-17 16:03 — control-height-36-to-40 (DS baseline)

- What: icon-button square `[data-size='icon']` 36×36 → 40×40.
- Why: DS-wide control-height baseline bump 36→40 (`control.size.lg`; see @klyp/tokens CHANGELOG). The icon button is an lg control; bumped so it matches sibling controls across the toolbar rhythm.

## 2026-06-03 18:22 — visual QA fixes (review)

- What: Button.tsx — `ButtonStateLabel`'s `useLayoutEffect` now depends on the four state-label strings instead of `[]`, so it re-measures label widths whenever the label text changes. `idleChildren` is deliberately NOT a dep (JSX children are a fresh object every parent render — depending on them would re-run 4 getBoundingClientRect + a setState per render); custom idle children are measured once at mount.
- Why: with empty deps the width was measured once at mount; editing the label live (e.g. the catalog Playground) left the locked width stale and `overflow: hidden` clipped the new, longer text.

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: Button.scss — added `color-mix(in srgb, …)` fallback lines immediately before each `color-mix(in oklch, …)` (primary hover, primary pressed, secondary pressed). Button.scss — link variant hover selector changed from `&[data-hovered]:not([data-disabled])` to `&[data-hovered]:not([data-pressed]):not([data-disabled])` so underline is suppressed while pressed, matching other variants. Button.tsx — static RACButton branch now sets `aria-busy={loading || undefined}` alongside `data-loading`.
- Why: Safari < 16.4 ignores `color-mix(in oklch)`, leaving primary/secondary hover and pressed states with no background change; sRGB fallback gives those browsers a usable progressive-enhancement value. Link variant applied hover underline even during press, inconsistent with the other variants. Loading state was not exposed to assistive tech in the static branch.

## 2026-05-14 — pre-neutral-rewrite

- Archive: `./_archive/2026-05-14-pre-neutral-rewrite/`
- Tokens source: `tokens@77e16a20`
- Why: Replace gold-gradient `primary` + bordered defaults with a neutral
  surface palette across every variant; absorb MeshButton's state machine
  (Check / Close / spinner icon swap, label width spring, shake on
  error, pop on success) into the base Button so every callsite gets
  animation hooks for free — without pulling MeshButton or the goo mesh
  into the prod bundle. State-machine width is always fixed (measures
  widest of all 4 state labels at mount) — no fluid spring branch,
  neighbouring layout never reflows. Static branch (when `state` is
  omitted) stays zero-motion-hook so legacy callsites pay no runtime
  cost. Icons inlined as SVG to avoid `@klyp/icons` dep in `@klyp/ui`
  tier.


# BouncyAccordion — changelog

## 2026-06-29 04:23 — rebuilt-on-shared-ui-accordion-engine

- What: Rebuilt as a thin data-driven skin over @klyp/ui Accordion (RAC DisclosureGroup) instead of a hand-rolled disclosure: dropped the local useState/useId open-state, the ArrowUp/Down/Home/End roving focus, and the Motion height tween (AnimatePresence/useReducedMotion/HEIGHT_EASE/HEIGHT_DURATION). The separated-card look (gap + corner rounding) is now pure CSS off RAC's [data-expanded] via :has()/sibling selectors; itemHeight passes through as --bouncy-item-h; the items API and PricingFaq call-site are unchanged. Net ~-93 lines.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-18 — unified onto the @klyp/ui Accordion engine

- What: rewrote from a self-contained component (own `useState` open-set, `toggle`, arrow-key roving, `aria-*`, Motion height-tween) into a thin data-driven skin over the `@klyp/ui` Accordion (RAC DisclosureGroup). State / keyboard / aria + the smooth open/close height animation now come from RAC (the ui Accordion's `--disclosure-panel-height` CSS transition). The "separated-card" look (open row pushes a `--space-10` gap + rounds to `--r-panel`, flanking rows round adjacent corners) is reproduced in pure CSS over `[data-expanded]` + sibling/`:has()` selectors. `items` API + props (`defaultActiveIndex` → `defaultExpandedKeys`, `allowMultiple` → `allowsMultipleExpanded`, `width`, `itemHeight`) unchanged — PricingFaq call-site untouched. Dropped `motion/react`.
- Why: one accordion engine across the DS (RAC), no duplicate disclosure logic. Behaviour change: Up/Down arrow roving between headers is gone (RAC uses Tab; the ui Accordion never had roving either) — flagged for sign-off.

- What: cleared the blockers from an independent tech / design / UX audit
  and promoted `beta → stable` in the catalog registry.
  - **Height auto (P0):** `expandedHeight` prop removed. Rows now animate
    `height → 'auto'` (motion) instead of a fixed 160px cap. Long answers
    no longer clip under `overflow: hidden`. Added a `LongAnswers` story
    with multi-sentence copy that previously would have been truncated.
  - **Reduced-motion (P0):** every transition is gated on
    `useReducedMotion()` — the height tween + panel blur/opacity collapse
    to `duration: 0`, and the CSS margin/radius/colour transitions are
    killed under `@media (prefers-reduced-motion: reduce)`.
  - **Answer contrast (P0):** the panel body no longer sits at
    `opacity: 0.5` (~45% white ≈ 2.3:1, sub-AA). It paints at
    `--color-fg-primary` full strength; only the entrance blur/fade is
    animated.
  - **aria-controls (P1):** now set only while the row is open, so it
    never references the unmounted (AnimatePresence-exited) panel id.
  - **Token-correct muting (P1):** idle title moved off
    `opacity: 0.5`-on-`fg-primary` to the semantic `--color-fg-muted`
    token (lifts to `--color-fg-primary` on hover/active). Reads as
    enabled on touch where there is no hover.
  - **De-hardcoded values (P1):** chevron `20px` → `--space-20`; the four
    animated corner radii (`'20px'` literals in the motion object) moved
    to CSS `data-top-round` / `data-bottom-round` transitions on
    `--r-panel`; the `10px` active gap → `data-active` + `--space-10`.
    Motion now only animates `height`.
  - **Arrow-key nav (P1):** Up/Down move focus between headers, Home/End
    jump to first/last (WAI-ARIA APG roving focus).
  - **allowMultiple prop (P2):** opt-in multi-open (internal `Set<number>`
    state) for side-by-side answer comparison; default stays single-expand.
  - **Empty guard (P2):** `items=[]` renders `null` instead of an empty
    `<ul>`.
  - Catalog summary + tags rewritten (dropped the stale "spring-bouncy /
    glass icons" wording — both were removed 2026-05-24).
- Why: the design lead asked for a tech + design + UX audit before
  promoting it to a signed-off stable reference; all three lenses returned
  NOT READY on the same blockers (clipping answers, no reduced-motion,
  sub-AA body text). Fixed before flipping the status.
- Known follow-ups (not blocking): the name "BouncyAccordion" no longer
  bounces (kept for slug/call-site compat — rename is a separate decision);
  a dedicated `--color-fg-secondary` (~70%) token could give the answer a
  softer-than-primary level without dropping below AA, but adding a colour
  token needs design-lead review.

## 2026-05-24 16:00 — a11y + dead-weight cut

- a11y (real bug-fix, not optimisation):
  - Trigger row is now a real `<button type="button">` with
    `aria-expanded`, `aria-controls`, `id`. Tab / Enter / Space work
    out of the box; before this the `<li>` carried `onClick` and was
    not focusable — keyboard users + screen-reader users had no way
    in. WAI-ARIA APG for the accordion pattern.
  - Panel is now `role="region"` with `aria-labelledby` pointing back
    at the trigger. Screen reader announces the open answer as a
    landmark connected to the question.
  - `:focus-visible` ring on the trigger via existing `--bw-emphasis`
    / `--color-fg-primary` tokens.
- Dead weight removed (~35KB of inline SVG out of `@klyp/brand`):
  - `variant: 'demo' | 'faq'` prop deleted. `variant='faq'` was the
    only one used in production (PricingFaq). The component is now a
    single style — what was `variant='faq'`.
  - 6 Nucleo glass-icon JSX exports
    (`BouncyAccordionGlassIcon1..6`) and the
    `BOUNCY_ACCORDION_DEMO_ITEMS` preset deleted. They lived only in
    the Skiper103 demo stories; PricingFaq + /components/faq never
    touched them. Brand barrel cleaned accordingly.
  - `item.icon` slot deleted along with the icons — no consumer used
    it after the FAQ swap.
- Misc:
  - Click-outside-collapses-everything removed (the root `onClick=
    setActiveItem(null)` that was sitting on a full-bleed
    `width:100% height:100%` div would swallow clicks in the
    surrounding section). Close-by-clicking-active-row still works.
  - `motion.p` panel → `motion.div` (the panel can host ReactNode,
    not just text — `<p>` would break for nested block content).
  - PricingFaq stopped passing `variant='faq'` / `width='100%'` —
    both gone (variant deleted, `width` default is now `'100%'`).
- What stays the same:
  - Visual chrome: dark-canvas row, 5% white hairline (box-shadow),
    18px title at 0.5 → 1 opacity on hover/active, 15px answer at
    0.5, tween easeOut 0.25s, 10px margin gap on expand, 20px
    corner radii on first/last/active/adjacent.

## 2026-05-24 15:45 — drop fixed `<ul>` height (siblings push correctly)

- What: `<ul>` no longer sets `height` inline — only `width`. The list
  now flows with its children so when a row expands the accordion
  grows and pushes whatever sits below it (e.g. the "Choose your
  plan" CTA on `/pricing`) downward. Browser layout reflow runs each
  animation frame, so the push is smooth in step with the row's
  tween-easeOut height change.
- Why: design lead 2026-05-24 — on `/pricing` the expanded FAQ row was
  overlapping the CTA below because the fixed-height `<ul>` (leftover
  from the Skiper103 demo composition) didn't grow with its children.
  Reserve-space wasn't an option because it would leave a permanent
  gap when everything is collapsed.

## 2026-05-24 15:30 — absorbed Faq molecule (deduped)

- What: `@klyp/brand/Faq` deleted. It had become a thin wrapper around
  `BouncyAccordion(variant='faq')`. Consumers:
  - `apps/web/src/features/pricing/pricing-faq.tsx` (`PricingFaq`)
    now imports `BouncyAccordion` directly + owns the section + h2
    chrome in a new `pricing-faq.scss`.
  - Brand barrel: `Faq`, `FaqItem`, `FaqProps` exports removed.
  - Catalog registry: `slug: 'faq'` entry removed.
- Why: design lead 2026-05-24 — two near-identical components in the catalog
  were just noise. Single canonical FAQ accordion = this one with
  `variant='faq'`.

## 2026-05-24 15:15 — 5% white hairline (box-shadow, not border)

- What: Each row now carries `box-shadow: 0 0 0 1px
  var(--color-border-subtle)` (= 5% white). Drawn as box-shadow on
  purpose:
  - Doesn't eat row padding the way `border` would.
  - Stacked rows in the collapsed state share their hairlines edge-to-
    edge, so visually it reads as one continuous outline around the
    whole group.
  - When a row expands and pushes its 10px margin gap, the hairline
    naturally renders on all 4 sides of every now-separated group
    (top-cluster, the active row itself, bottom-cluster) — exactly the
    "border on every detached block" effect the design lead asked for.
- Why: design lead 2026-05-24 — wanted the 5% white outline that splits into
  three rings when a row opens.

## 2026-05-24 15:00 — fix vertical centring + darken bg to root

- What:
  - Row content now vertically centred inside the item. Previously the
    row was `padding-top: 10px` + `height: fit-content` which parked
    icon/title/chevron at the top of the (taller) item. Row now sets
    `height: ${resolvedItemHeight}px` inline (from props) +
    `align-items: center` so the title sits in the middle of the
    collapsed strip and stays put when the item expands (description
    slides in below).
  - Default row background back to `--color-bg-canvas` (#121212)
    after a brief detour through `--color-bg-root` (#0f0f0f). Hover
    still lifts to `--color-bg-surface` (#141414).
- Why: design lead 2026-05-24 — pointed out the text was glued to the top of
  the row and wanted a darker default.

## 2026-05-24 14:45 — row colour darker (canvas → surface on hover)

- What: Row background swapped from `--color-bg-surface` (#141414) to
  `--color-bg-canvas` (#121212). Hover now lifts to
  `--color-bg-surface` (#141414) instead of `--color-bg-surface-hover`
  (lighter neutral-700).
- Why: design lead 2026-05-24 — wanted darker default with hover sitting at
  #141414 exactly. Both values come from existing primitives —
  `neutral-925` and `neutral-900` — no new tokens introduced.

## 2026-05-24 14:30 — drop spring, switch to tween easeOut

- What: Replaced spring (`stiffness: 300, damping: 20`) with `type:
  'tween', duration: 0.25, ease: 'easeOut'` on the row animate. No
  overshoot/bounce anymore — height + margin + radii ease in/out
  linearly. Class/slug stays `BouncyAccordion` /
  `bouncy-accordion` for source-compat.
- Why: design lead 2026-05-24 — wanted to see the FAQ + demo without the
  bounce.

## 2026-05-24 14:00 — variant='faq' + Faq molecule now wraps this

- What: New `variant: 'demo' | 'faq'` prop. `'demo'` keeps the
  Skiper103 look (300×120 list, 45/93 row heights, 14px medium title
  at 0.75 opacity). `'faq'` switches to Geist-ish typography (560
  wide, 64/160 rows, 18px title at 0.5 → 1 on hover/active, 15px
  answer at 0.5, 20×20 chevron, generous padding). Variant chosen at
  call-site; `width`/`itemHeight`/`expandedHeight` props still
  override per-instance.
- Why: `@klyp/brand/Faq` now wraps this with `variant='faq'` — that
  swaps `/pricing` and `/components/faq` from the static `<Faq>`
  ruled-list to the bouncy aesthetic. Per design lead 2026-05-24.

## 2026-05-24 13:30 — generalise + FAQ-style preset

- What: `icon` is now optional on `BouncyAccordionItem` — icon slot is
  skipped entirely when omitted. New props: `width` (default `300`),
  `itemHeight` (default `45`), `expandedHeight` (default `93`) so the
  component can stretch into FAQ-style rows with multi-line answers.
  The "Click on Items to expand & collapse" hint + downward gradient
  line is removed — it was demo chrome, not part of the component
  contract. Added a new story `FAQ style (no icons)` rendering our
  canonical FAQ items at `width=560, itemHeight=56, expandedHeight=140`.
- Why: the design lead wants to use it as the FAQ accordion (no icons, our tokens,
  wider rows). The hint was decorative for the Skiper demo only.

## 2026-05-24 12:00 — initial port from skiper103

- What: New `@klyp/brand` molecule. Spring-bouncy accordion with glass
  icons, adapted 1:1 from Skiper103 (skiper-ui.com) — single-expand,
  fixed expanded height (93px), 10px gap around active item, 20px
  corner radii on first/last/active/adjacent items. Ships 6 Nucleo
  glass icons inline (book-open, award, calendar, cart, code-editor,
  wallet-content) with prefixed `<defs>` ids so multiple instances
  don't collide. Description appears with blur-in fade via
  AnimatePresence.
- Why: the design lead asked for the Skiper103 visual as a brand-tier component to
  evaluate the look in our catalog. Source obtained from the
  `Wastetoken/app-builder` GitHub mirror; adapted to motion/react +
  @klyp/icons outline chevron + SCSS/BEM/tokens (Tailwind + lucide
  banned in Klyp).

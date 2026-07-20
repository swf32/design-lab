# Popover — changelog

## 2026-07-03 — clip root overflow while the height morph tweens

- What: `PopoverHeightMorph` stamps `data-morphing` on the popover root for the tween's lifetime (Motion onAnimationStart/Complete, imperative attribute); the SCSS clips the root's overflow only during that window.
- Why: mid-glide the content is transiently taller than the animating box, so the root's `overflow-y: auto` flashed a scrollbar/6px gutter for a frame on every modality tab switch in the composer settings (Val 2026-07-03).

## 2026-06-29 04:23 — replace-arrow-with-stagger-height-footer

- What: Removed the `arrow` prop (OverlayArrow SVG + all `data-arrow`/`__arrow` SCSS) and added three opt-in motion props: `staggerChildren` (CSS `:nth-child` cascade via a new `--popover-stagger-step` calc'd off `--duration-instant`, capped at 10 rows) and `animateHeight` (a Motion `PopoverHeightMorph` wrapper that tweens the real `height` using `useLayoutEffect` + `ResizeObserver`, reduced-motion-gated). Also added a fixed `footer` slot rendered outside the height-morph box; absent props emit no `data-*` attrs so existing consumers render unchanged.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-28 20:52 — `animateHeight` prop + AnimatedHeight story

- What: new opt-in `animateHeight?: boolean` (default `false`). When `true`, the popover GLIDES between content heights when its content changes height WHILE open (e.g. the composer settings panel changing height as you switch modality tabs) instead of jumping. Mirrors `Button`'s `animateWidth` mechanism on the height axis — a `__heightBox` (Motion `motion.div`) animates the REAL `height` property via a tween (`HEIGHT_MORPH`, same shape/timing as Button's `WIDTH_MORPH`) to the natural content height that a nested `__heightInner` measuring element provides, re-measured in a `useLayoutEffect` after every render. Default path adds ZERO motion hooks (extracted `PopoverHeightMorph`, off the static branch) and emits no `data-animate-height` attr, so existing consumers are byte-for-byte unchanged. Coexists with RAC positioning (root sizes to the box → RAC repositions), the `klyp-Popover-in/out` entrance/exit, and `staggerChildren` (combined path redirects the cascade to the inner rows). `prefers-reduced-motion` → instant via `useReducedMotion` (same gate as Button). New `AnimatedHeight` story toggles a short↔tall panel with `animateHeight` on.
- Why: content-driven height changes (modality tab switch in the composer settings popover) jumped to the new height; this makes them glide, using the same proven technique Button already uses for width — capability + story only, not enabled on any real consumer.

## 2026-06-25 12:50 — `arrow` prop + WithArrow story

- What: new optional `arrow` prop renders an OverlayArrow (two-shape SVG, à la Tooltip) that tracks the trigger edge and rotates per `placement`; arrow fill matches the solid/glass surface. Root switches to `overflow: visible` when `arrow` is set so the tip isn't clipped (documented: arrow = short non-scrolling content). New `WithArrow` story demos 8 placements (top/bottom/left/right + start/end alignments), like the React Aria Popover docs.
- Why: the design lead — wanted an arrow state showing all directions/placements.

## 2026-06-25 12:30 — Solid+Glass share confirmation content; menu states

- What: Solid and Glass now render IDENTICAL content (a confirmation popover — heading + body paragraph + two DS Buttons on one row, via DialogTrigger + Dialog + `close`), differing only in `surface`, so the tabs are a direct solid-vs-glass comparison. Removed the old model-picker (Solid) and account-menu-with-personal-email (Glass). ScrollableHistory's menu items gained real hover/focus/press states via a RAC `style` render-prop (`menuItemStyle`) instead of a dead inline object.
- Why: the design lead — wanted both surface tabs to show the same content; disliked the Glass account-menu (esp. the real email); menu rows read as ugly stateless buttons; and the catalog lacked a "lots of text + two actions in a row" example.

## 2026-06-25 12:10 — renamed PopoverSurface → Popover

- What: component, folder, files, `klyp-PopoverSurface` BEM class, `PopoverSurfaceProps` type, barrel export, `@klyp/brand/PopoverSurface` subpath, and catalog slug (`popover-surface` → `popover`) all renamed to `Popover`. Callsites updated: BrandSelect, AdvancedFilterPopover, ComposerSettingsPopover, model-picker, series.index, composer-settings-popover.
- Why: the design lead — the bare `Popover` primitive was retired, so this is now the sole popover; the `Surface` suffix is redundant. (RAC's `Popover` stays aliased as `RACPopover` inside the component — no collision.)

## 2026-06-25 11:53 — realistic story content

- What: stories rewritten from generic "Item one/two/three" to real use-cases — Solid = model picker (sections + meta), Glass = account menu (header + actions + sign-out), ScrollableHistory = recent-conversations list demoing the `scrollbar` prop.
- Why: the design lead — the filler demo didn't show what the surface is for; content now mirrors the documented profile-menu / model-picker / history-menu use cases.

## 2026-06-24 10:26 — sole popover surface (ui/Popover composite retired)

- What: `Popover` is now the single popover surface in the repo. The
  parallel `@klyp/ui/Popover` composite (RAC `DialogTrigger`+`Dialog` shim with
  legacy Base-UI `render`/`side`/`align` compat + unused `Header/Title/Description`
  parts) was deleted, and its 4 live consumers — `composer-settings-popover`
  (/chat), brand `ComposerSettingsPopover`, brand `model-picker`, `series.index`
  filter menu — were migrated to `RAC DialogTrigger + Button + Popover +
  Dialog` (the pattern `AdvancedFilterPopover` already shipped). Orphan
  `generate-settings-popover` removed.
- Why: teamlead flagged two popover stacks doing the same job; consolidating on
  the healthier surface removed 10 `!important` overrides (callsites fought the
  composite's hardcoded `width:18rem` / padding / radius) and dropped dead code.
- Note: `Popover` source unchanged — it was already at parity (passes
  `placement`/`offset`/`maxHeight` through to RAC, `--r-card` radius, 60vh scroll,
  solid/glass `surface`). Callsites keep bespoke width/tint via two-class
  overrides (`&__x.klyp-Popover`), no `!important`.

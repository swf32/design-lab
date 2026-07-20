# SidebarMenuButton — changelog

## 2026-07-02 04:35 — revert: accent glow + hover-intent delays → neutral instant states

- What: The hover/active treatment went back to the pre-experiment look —
  hover = neutral `--color-bg-surface-hover` wash, active = solid
  `--color-bg-surface-solid`, fg/icon stay white, everything INSTANT (the
  100/75ms hover-intent delays and the `--fx-accent-glow-*` layer are
  removed). Icon scale(1.15) + hover-Lottie stay. The component unification
  itself (geometry, sizes, collapse, tooltip, link rendering) is unchanged.
- Why: Val — live check: the delayed glow «ощущается как будто зависает»;
  wants the plain default button highlight back. Component refactor stays.

## 2026-07-02 04:05 — rework to the production AppSidebar mechanics + accent glow

- What: Full rework into THE canonical sidebar nav-row (breaking; previous
  version archived below). Geometry: fixed square icon slot = row height
  (`--smb-size`, `size="md"` 36px desktop rail / `size="lg"` 40px mobile
  drawer), gap 0, label/badge collapse to zero width via `data-collapsed` —
  the AppSidebar no-jump mechanic. Visuals: hover/active paint the Button
  `accent` glow (`--fx-accent-glow-bg` radial + `--fx-accent-glow-shadow`
  inset ring/inner-glow over surface-solid) on one ::before layer with
  hover-intent delays (in 100ms / out 75ms; active snaps); the icon slot
  recolours to `--color-accent`; Lottie playback + icon scale(1.15) stay
  instant. API: dropped `variant="toggle"` / the aria-toggle props; added
  `size`, `tooltip` (built-in right-side RAC Tooltip while collapsed),
  `forceHovered` (static hover mirror for docs), `to` + `linkComponent`
  (router-agnostic link rendering), `lottieSize`. Stories rewritten with
  playground `args`/`argTypes`.
- Why: Val — unify: the production AppSidebar rows, the mobile drawer rows,
  and the ProfileMenu sign-in row all hand-maintained copies of this anatomy;
  one canonical component now owns geometry + the new glow treatment, and the
  copies migrate onto it.

## 2026-06-03 18:22 — visual QA fixes (review)

- What: SidebarMenuButton.scss — collapsed `&__label` / `&__badge` now get `flex: 0 0 0`.
- Why: `max-width: 0` alone left `flex: 0 1 auto`, which still reserved a sliver of flex width and pushed the icon ~1-2px off the 40px slot centre when collapsed; `flex: 0 0 0` makes them contribute zero width so the icon truly centres.

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: Comment-only fix (3.1). Updated the `disabled` JSDoc in SidebarMenuButton.tsx and the "Visual states" header in SidebarMenuButton.scss to match actual code: the row stays at opacity 1 (readable) with subtle fg and cursor not-allowed, and only the icon dims to opacity 0.3 — no longer the old "opacity .5" wording. No code, markup, or public API changed.
- Why: The docs claimed the disabled row used opacity 0.5, but the implemented rules (`&[data-disabled='true']` keeps `opacity: 1`, only `__icon` drops to `opacity: 0.3`) diverged from the comments, misleading consumers.

## 2026-07-02 — pre-glow-unification

- Archive: `./_archive/2026-07-02-pre-glow-unification/`
- Tokens source: `tokens@58108a1`
- Why: preserving the 2026-05-16 anatomy (40px rows, gold-wash hover, toggle
  variant) before the breaking glow-unification rework — see the 04:05 entry.

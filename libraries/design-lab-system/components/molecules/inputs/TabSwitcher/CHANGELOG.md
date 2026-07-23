# Changelog

## 0.5.0 — 2026-07-23

- Added: `iconSize` controls all option icons independently from button size and touch-target geometry.
- Visual: Design Lab Cards/List and Light/Dark selectors now use compact 12px icons.

## 0.4.0 — 2026-07-23

- Added: explicit text-only, icon-and-text, and icon-only option content contracts.
- Accessibility: icon-only options require an accessible label at the TypeScript API boundary.
- Changed: Cards/List uses the segmented presentation; compact toggle remains intended for paired modes such as Light/Dark.
- Visual: preview and stories now use canonical icon assets instead of Unicode glyphs.

## Unreleased

- Accessibility: Phone layouts expand every segmented and toggle option to a minimum 44px touch target.
- Visual: Mobile labels and icon glyphs use a readable size without changing desktop density.
- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/molecules/inputs/TabSwitcher`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.3.2 — 2026-07-19

- Changed: Colocated production styles in `TabSwitcher.scss`; catalog-only CSS now lives in `TabSwitcher.preview.tsx`.

## 0.3.1 — 2026-07-19

- Added: semantic `description`, `aliases`, `useWhen`, and `avoidWhen` manifest metadata for AI retrieval.

## 0.3.0 — 2026-07-16

- Added: optional authored catalog motion that demonstrates a selection change on card hover or keyboard focus.
- Accessibility: reduced-motion users keep the static baseline preview.

## 0.2.0 — 2026-07-16

- Fixed: `small` and `medium` now produce distinct geometry for both segmented and toggle variants.
- Visual: toggle now uses a single moving thumb beneath transparent option hit areas instead of selected-button styling.
- Changed: size stories now cover the complete `variant × size` matrix.

## 0.1.0 — 2026-07-16

- Added: one generic mutually exclusive selector with segmented and compact toggle variants.
- Added: typed arbitrary string values, text or icon labels, sizes, disabled options, and accessible labels.
- Added: real Workbench controls and focused stories for variants, sizes, and disabled state.
- Accessibility: exposed selected state with `aria-pressed` inside a named control group.

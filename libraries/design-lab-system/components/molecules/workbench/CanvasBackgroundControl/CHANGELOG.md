# Changelog

## Unreleased

- Changed: Removed the mobile-only four-pixel growth; collapsed and expanded control geometry is now identical across viewport widths.
- Changed: The control now rests as one selected background swatch and reveals all modes on pointer hover or keyboard focus using the small Tab Switcher geometry.
- Fixed: Collapsed dark grid, light grid, and solid swatches now share one exact position; hidden flex gaps no longer offset later options.
- Changed: Touch interaction now uses a first tap to reveal, a second tap to select or open the picker, and an outside tap to collapse.
- Accessibility: Focus disclosure matches hover disclosure, and reduced-motion preferences remove the expansion transition without hiding the choices.
- Changed: Enlarged the three canvas background samples into 22px circular swatches and replaced the bespoke solid-color popover with the shared embedded Color Picker.
- Visual: rebuilt the catalog preview as the segmented grid-and-solid mode switcher with production diagonal swatches and card-hover mode handoff; removed the always-open picker composition from the thumbnail.
- Changed: declared catalog preview motion for mutually exclusive mode selection.
- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/molecules/workbench/CanvasBackgroundControl`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.5.2 — 2026-07-19

- Changed: Colocated production styles in `CanvasBackgroundControl.scss`; catalog-only CSS now lives in `CanvasBackgroundControl.preview.tsx`.

## 0.5.1 — 2026-07-19

- Fixed: isolated the legacy Canvas color popover class names from the reusable Color Picker contract.

## 0.5.0 — 2026-07-16

- Visual: catalog preview now shows dark grid, light grid, solid mode, and the compact color-picker composition.

## 0.4.0 — 2026-07-16

- Fixed: dark grid tokens are neutral charcoal values without a green cast.

## 0.2.0 — 2026-07-16

- Added: executable Workbench stories for background modes and solid color editing.

## 0.3.0 — 2026-07-16

- Changed: composed the shared `TabSwitcher` for mutually exclusive Canvas modes instead of maintaining another segmented-control implementation.

## 0.2.0 — 2026-07-16

- Changed: localized control labels through the shared i18n provider.
- Changed: Canvas mode now participates in a persisted, component-wide preference.
- Changed: light and dark grids now use dedicated semantic grid tokens.

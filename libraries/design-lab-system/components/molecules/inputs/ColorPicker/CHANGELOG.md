# Changelog

## Unreleased

- Changed: Palette now uses a viewport-aware portal so it remains reachable in scrolling rails and
  on mobile without increasing the scroll area.
- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/molecules/inputs/ColorPicker`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.1.1 — 2026-07-19

- Changed: Colocated production styles in `ColorPicker.scss`; catalog-only CSS now lives in `ColorPicker.preview.tsx`.

## 0.1.0 — 2026-07-19

- Added: controlled and uncontrolled color selection with custom trigger composition.
- Added: spectrum input, preset palette, HEX editing, reset, outside dismissal, and Escape handling.
- Accessibility: the trigger exposes dialog state and every preset has a readable color name.

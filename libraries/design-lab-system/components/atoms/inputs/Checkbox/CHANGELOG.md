# Changelog

## Unreleased

- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/atoms/inputs/Checkbox`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.2.1 — 2026-07-19

- Changed: Colocated production styles in `Checkbox.scss`; catalog-only CSS now lives in `Checkbox.preview.tsx`.

## 0.2.0 — 2026-07-19

- Visual: optically centered the checked and indeterminate marks in the catalog preview.

## 0.1.0 — 2026-07-16

- Added: accessible, token-driven Checkbox with small and medium sizes.
- Added: checked, indeterminate, disabled, label, and description states.

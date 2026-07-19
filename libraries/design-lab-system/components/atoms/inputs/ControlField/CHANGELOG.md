# Changelog

## Unreleased

- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/atoms/inputs/ControlField`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.1.1 — 2026-07-19

- Changed: Colocated production styles in `ControlField.scss`; catalog-only CSS now lives in `ControlField.preview.tsx`.

## 0.1.0 — 2026-07-16

- Added: labeled control wrapper with text, select, boolean, and color compositions.

# Changelog

## Unreleased

- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/molecules/workbench/StoryCanvas`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.1.1 — 2026-07-19

- Changed: Colocated production styles in `StoryCanvas.scss`; catalog-only CSS now lives in `StoryCanvas.preview.tsx`.

## 0.1.0 — 2026-07-16

- Added: full-width story header and token-driven specimen stage.

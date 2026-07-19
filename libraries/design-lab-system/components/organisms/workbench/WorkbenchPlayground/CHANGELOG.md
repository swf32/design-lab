# Changelog

## Unreleased

- Added: Configurable start/end controls rail for full-route typed Component Playgrounds.
- Responsive: Canvas remains first and controls move below it on phone layouts.
- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/organisms/workbench/WorkbenchPlayground`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.1.1 — 2026-07-19

- Changed: Colocated production styles in `WorkbenchPlayground.scss`; catalog-only CSS now lives in `WorkbenchPlayground.preview.tsx`.

## 0.1.0 — 2026-07-16

- Added: reusable Workbench Playground with Canvas, controls rail, shared background preferences, and event feedback.
- Added: none, compact, and comfortable Canvas padding policies; comfortable is the default.

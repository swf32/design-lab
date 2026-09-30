# Changelog

## Unreleased

- Changed: The fullscreen React and Vue concept Playgrounds now render this same Canvas and background control. The `dl-workbench-playground--fullscreen` class owns stage padding and tool placement; an empty `label` hides the optional eyebrow.
- Fixed: Canvas tools identify themselves to the shared inspector so they are not selected as product content.
- Changed: Light-grid foreground uses the shared semantic token so it remains readable in both application themes.
- Added: the shared Canvas appearance control can switch arbitrary source token themes independently from its background.
- Changed: `controls` is optional; when omitted the controls rail is not rendered and the Canvas fills the width.
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

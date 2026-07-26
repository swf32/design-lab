# Changelog

## Unreleased

- Added: The root now exposes an explicit `dl-code-block--expanded` state for composed emphasis and styling.
- Added: `collapsedLines` shows a compact source preview with accessible expand and collapse actions while preserving full-source copying.
- Added: `code-only` removes header chrome and floats Copy and disclosure actions inside the source surface.
- Visual: catalog preview now shows real monospace source with a copy action; card hover transitions to the copied state.
- Added: `previewMotion` metadata for the copy feedback state transition.
- Added: `copyOnClick` turns the complete code fragment into an accessible copy target.
- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/molecules/data-display/CodeBlock`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.1.1 — 2026-07-19

- Changed: Colocated production styles in `CodeBlock.scss`; catalog-only CSS now lives in `CodeBlock.preview.tsx`.

## 0.1.0 — 2026-07-16

- Added: fenced source presentation with language label and optional copy action.
- Added: internal overflow for long lines and token-based dark/light styling.
- Accessibility: copy status is exposed through the action's accessible name and visible label.
- Fixed: copy falls back to a temporary selection when the modern Clipboard API is unavailable or denied.

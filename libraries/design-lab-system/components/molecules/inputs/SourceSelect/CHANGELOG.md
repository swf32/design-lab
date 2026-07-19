# Changelog

## Unreleased

- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/molecules/inputs/SourceSelect`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.4.1 — 2026-07-19

- Changed: Colocated production styles in `SourceSelect.scss`; catalog-only CSS now lives in `SourceSelect.preview.tsx`.

## 0.4.0 — 2026-07-19

- Visual: made the full-width catalog specimen border-box aware so its own padding and border remain inside the shared card safe area.

## 0.3.0 — 2026-07-16

- Changed: production source-selector and menu styles are now owned by the Library stylesheet so context stories render the same component as the application.

## 0.2.0 — 2026-07-16

- Changed: moved interface copy to the shared i18n dictionary.

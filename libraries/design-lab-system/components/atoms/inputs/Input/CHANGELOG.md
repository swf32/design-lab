# Changelog

## Unreleased

- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/atoms/inputs/Input`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.4.1 — 2026-07-19

- Changed: Colocated production styles in `Input.scss`; catalog-only CSS now lives in `Input.preview.tsx`.

## 0.4.0 — 2026-07-19

- Visual: reorganized the catalog preview into aligned text/search and textarea columns with shared label and bottom guide lines.
- Visual: removed the invented search-copy transition; preview motion now changes focus treatment without changing field anatomy or content.

## 0.3.0 — 2026-07-16

- Visual: removed the redundant component name and variant legend from the catalog preview.
- Added: token-driven preview motion that transfers focus from text entry to search and reveals a query on card hover or focus.
- Accessibility: reduced-motion users keep the deterministic focused-text baseline.

## 0.2.0 — 2026-07-16

- Visual: replaced the abstract catalog thumbnail with a recognizable text, search, and textarea specimen using the shared Search icon asset.

## 0.1.0 — 2026-07-16

- Added: native text, search, and textarea variants with three shared sizes.
- Added: label, helper, error, character-count, and adornment composition.
- Accessibility: associated descriptions, invalid announcements, visible focus, and distinct read-only and disabled semantics.

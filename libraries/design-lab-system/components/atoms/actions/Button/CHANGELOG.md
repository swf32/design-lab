# Changelog

## Unreleased

- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/atoms/actions/Button`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.3.1 — 2026-07-19

- Changed: Colocated production styles in `Button.scss`; catalog-only CSS now lives in `Button.preview.tsx`.

## 0.3.0 — 2026-07-16

- Visual: catalog preview now shows larger labeled primary, secondary, and icon-only button treatments.

## 0.2.0 — 2026-07-16

- Added: small, medium, and large sizes.
- Added: danger variant, loading, full-width layout, and leading/trailing slots.
- Added: focused Variants, Sizes, Full width, Loading, and composition stories.
- Accessibility: loading now disables the button and exposes `aria-busy`.

## 0.1.0 — 2026-07-16

- Added primary, secondary and ghost variants.

# Changelog

## Unreleased

- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Visual: Tightened the vertical rhythm, title scale, identity gap, navigation width, and Workbench inset after reviewing the header in its production context.
- Visual: Rebuilt the header hierarchy around a stronger title, quiet source metadata, structural dividers, and responsive utility placement.
- Changed: Back navigation now uses the production Button component with the canonical Arrow Left icon and a 40px minimum target.
- Accessibility: Added a visible keyboard focus treatment and reduced-motion handling for the directional hover cue.
- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/molecules/workbench/ModuleHeader`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.1.1 — 2026-07-19

- Changed: Colocated production styles in `ModuleHeader.scss`; catalog-only CSS now lives in `ModuleHeader.preview.tsx`.

## 0.1.0 — 2026-07-16

- Added: module summary and workbench navigation compositions.

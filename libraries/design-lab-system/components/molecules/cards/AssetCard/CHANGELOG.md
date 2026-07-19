# Changelog

## Unreleased

- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/molecules/cards/AssetCard`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.3.1 — 2026-07-19

- Changed: Colocated production styles in `AssetCard.scss`; catalog-only CSS now lives in `AssetCard.preview.tsx`.

## 0.3.0 — 2026-07-18

- Added: native button navigation, persistent selected styling, and `aria-current` semantics for deep-linked assets.

## 0.2.1 — 2026-07-16

- Fixed: rendered icons now use a restrained 48×48px optical size instead of filling the preview area.

## 0.2.0 — 2026-07-16

- Added: real previews for canonical TSX and SVG icons through the safe local icon renderer.
- Added: automatic type-icon fallback when a preview cannot be rendered.

## 0.1.0 — 2026-07-16

- Added: token-driven catalog card for icon, image, video, and fallback assets.
- Added: safe local raster preview, extension metadata, and long-path clipping.

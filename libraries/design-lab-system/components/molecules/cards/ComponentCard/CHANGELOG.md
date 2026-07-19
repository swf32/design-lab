# Changelog

## Unreleased

- Added: Optional lifecycle status badge using the production Chip component.
- Visual: Status sits with the overlaid component name without creating another interactive target.
- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/molecules/cards/ComponentCard`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.5.1 — 2026-07-19

- Changed: Colocated production styles in `ComponentCard.scss`; catalog-only CSS now lives in `ComponentCard.preview.tsx`.

## 0.5.0 — 2026-07-19

- Visual: replaced the separate metadata footer with a bottom gradient overlay containing only the component name.
- Visual: removed the border and all card-level hover changes, including lift, fill, and shadow.
- Visual: set every card corner to the semantic 12px card radius and reduced catalog grid spacing to 4px.
- Changed: source entry and variant count remain accepted for compatibility but are no longer rendered.
- Accessibility: retained the explicit keyboard focus outline while keeping pointer hover visually stable.

## 0.4.0 — 2026-07-19

- Visual: added a shared token-driven safe area around authored catalog previews so full-width specimens remain visibly inset from card edges.

## 0.3.0 — 2026-07-16

- Added: optional `previewAnimated` state that activates authored preview motion on pointer hover and keyboard focus.
- Accessibility: motion activation remains opt-in and respects the global reduced-motion contract.

## 0.2.0 — 2026-07-16

- Added: executable selection and catalog-context stories.

## 0.1.0

- Added default, hover and selected states.

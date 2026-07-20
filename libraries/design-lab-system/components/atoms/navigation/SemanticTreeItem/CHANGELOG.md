# Changelog

## Unreleased

- Added: Page entity kind with the shared Pages icon.
- Added: Wireframe entity kind with the shared Wireframes icon.
- Added: Independent `onExpandedChange` callback separates folder disclosure from label selection while preserving the previous fallback behavior.
- Fixed: Folder disclosure no longer triggers navigation when the consumer provides the dedicated callback.
- Accessibility: Mobile disclosure, color, label, and action targets now use a 44–48px touch geometry with larger row text.
- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/atoms/navigation/SemanticTreeItem`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.5.1 — 2026-07-19

- Changed: Colocated production styles in `SemanticTreeItem.scss`; catalog-only CSS now lives in `SemanticTreeItem.preview.tsx`.

## 0.5.0 — 2026-07-19

- Added: optional icon coloring through the shared Color Picker.
- Added: optional hover/focus More action with a future-actions menu slot.
- Changed: separated disclosure, color, label selection, and row actions into valid interactive targets.
- Visual: increased semantic indentation so adjacent tree levels read more clearly.
- Accessibility: each affordance now has its own accessible name and keyboard target.

## 0.4.0 — 2026-07-19

- Visual: made the full-width catalog specimen border-box aware so it remains visibly inset inside the shared card safe area.

## 0.3.0 — 2026-07-16

- Added: asset entity presentation and selectable virtual folder support for the `All` filter.
- Changed: folders can be active independently of their expanded state.

## 0.2.0 — 2026-07-16

- Changed: production tree-row styles are now owned by the Library stylesheet.
- Fixed: long entity labels shrink and truncate without widening the tree.

## 0.1.0 — 2026-07-16

- Added: semantic entity kinds, nested indentation, selection, and folder disclosure.

# Changelog

## Unreleased

- Changed: all automatic Story handoff uses one structural source printer that keeps short JSX compact and expands long props, arrays, objects, nested values, and sibling examples with stable indentation.
- Fixed: Story handoff now analyzes the actual rendered React examples and their canonical Component and icon imports instead of depending on manually duplicated source strings.
- Visual: Story source code now rests at 0.2 opacity and returns to full opacity on hover, focus-within, or expanded disclosure.
- Changed: Removed mobile-only header padding and title-gap changes; Story chrome is viewport-invariant.
- Fixed: Removed the extra top padding previously reserved for Canvas tools; the compact background control now overlays the stage without shifting Story content.
- Added: Optional shared Canvas background controls and a copyable, three-line-collapsed source footer for Story handoff.
- Changed: Canvas background control now floats at the stage top-right; the source footer has no outer padding and uses headerless CodeBlock chrome.
- Changed: Header no longer reserves 72px; story metadata sits beside the title and source handoff includes example usage rather than only an import.
- Visual: rebuilt the catalog preview around the token-driven checker stage and quiet story header bars instead of unrelated control specimens.
- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/molecules/workbench/StoryCanvas`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.1.1 — 2026-07-19

- Changed: Colocated production styles in `StoryCanvas.scss`; catalog-only CSS now lives in `StoryCanvas.preview.tsx`.

## 0.1.0 — 2026-07-16

- Added: full-width story header and token-driven specimen stage.

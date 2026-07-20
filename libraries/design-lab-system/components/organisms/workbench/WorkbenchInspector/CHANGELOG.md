# Changelog

## Unreleased

- Changed: selecting a target pins its copyable code popover until another target is selected or the selection is dismissed.
- Fixed: inspection consumes pointer and click activation before interactive product content can navigate or change state.
- Added: active Inspector mode quietly outlines every explicitly marked Component root and named slot.
- Fixed: copyable slot HTML no longer leaks internal `data-dl-*` inspection attributes.
- Fixed: nested SVG and DOM content inside a named slot resolves to that slot instead of a raw element.
- Changed: the first surface click after a pinned selection only dismisses its popover; a later click creates the next selection.
- Visual: doubled active-mode Component overview outlines from 1px to 2px.

## 0.1.0 — 2026-07-20

- Added: reusable Component, slot, and authored-element inspection for referenced workbench surfaces.
- Added: shared purple dashed Workbench Action at the viewport bottom end.
- Added: copyable TSX, HTML, and SCSS handoff through Inspector Code Popover.

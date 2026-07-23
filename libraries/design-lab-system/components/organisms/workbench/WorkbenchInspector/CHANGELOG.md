# Changelog

## Unreleased

- Added: Inspector-only Hard Mode forces neutral gray backgrounds on discovered Component, slot, and asset boundaries, doubles their identity outlines, and exposes a neutral-to-red toggle above Inspect without changing reviewed source or shareable state.
- Added: Design Lab's own application shell now mounts the same Inspector with a component-only compile-time pass, allowing the product UI to audit real Library Component roots against uncolored raw application gaps without wrapping every shell DOM host or adding a second registry.
- Changed: unpinned hover preview popover is lighter glass with stronger blur and `pointer-events: none`, so it no longer blocks moving the eyedropper to the next target; click still pins it for copy interaction.
- Added: a raw `<img>`/`<video>`/`<source>` host whose `src`/`poster`/`href` resolves to a locally imported asset now hands off the exact resolved import and usage under a new teal `asset` identity, instead of only the SCSS fallback. Works whether or not the element is inside a manifest slot.
- Changed: selecting a target pins its copyable code popover until another target is selected or the selection is dismissed.
- Fixed: inspection consumes pointer and click activation before interactive product content can navigate or change state.
- Added: active Inspector mode quietly outlines every automatically discovered Component root and manifest-declared slot.
- Fixed: nested SVG and DOM content inside a named slot resolves to that slot instead of a raw element.
- Changed: the first surface click after a pinned selection only dismisses its popover; a later click creates the next selection.
- Visual: doubled active-mode Component overview outlines from 1px to 2px.
- Changed: Component and slot identity now comes from automatic manifest-aware TSX instrumentation instead of authored DOM attributes.
- Changed: Component and slot handoff copies the exact authored callsite and referenced imports.
- Changed: raw-element styles now come from the Node SCSS/CSS source analyzer rather than browser CSSOM.
- Fixed: source handoff preserves `$variables`, `@use` / `@import`, mixin calls, nesting, percentages, and CSS custom-property expressions.

## 0.1.0 — 2026-07-20

- Added: reusable Component, slot, and authored-element inspection for referenced workbench surfaces.
- Added: shared purple dashed Workbench Action at the viewport bottom end.
- Added: copyable TSX, HTML, and SCSS handoff through Inspector Code Popover.

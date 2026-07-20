# Changelog

## Unreleased

- Changed: removed authored Inspector attributes in favor of automatic source instrumentation.

## 0.2.0 — 2026-07-20

- Added: every state node now pairs real desktop and portrait mobile Wireframe renderings.
- Added: two-finger and trackpad pinch zoom around the gesture midpoint while visible zoom buttons remain available.
- Fixed: authored columns and rows receive collision-safe minimum spacing as node geometry grows.
- Fixed: touch gestures stay inside the Canvas instead of zooming the browser page.
- Visual: moved the transformed grid to an infinite viewport background and reduced its contrast.

## 0.1.0 — 2026-07-20

- Added: directed nodes, labeled edges, arrowheads, pan, zoom, and reset controls.
- Accessibility: nodes are keyboard buttons with explicit selected state.
- Responsive: mobile keeps graph interaction inside the Canvas without document overflow.
- Changed: Nodes now render real inert 16:9 screens with explicit Preview state actions.
- Fixed: The grid now belongs to the transformed graph world and moves with pan and zoom.
- Visual: Extended and softened the transformed grid so it remains continuous without competing with screen nodes.

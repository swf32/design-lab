# Changelog

## Unreleased

- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/atoms/navigation/SidebarTab`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.4.1 — 2026-07-19

- Changed: Colocated production styles in `SidebarTab.scss`; catalog-only CSS now lives in `SidebarTab.preview.tsx`.

## 0.4.0 — 2026-07-19

- Visual: replaced the miniature sidebar composition with component-only collapsed and expanded Sidebar Tab specimens using the canonical Components icon.

## 0.3.5 — 2026-07-18

- Visual: added a 2px gap between the tab icon and label.

## 0.3.4 — 2026-07-18

- Fixed: restored the shared fixed height for collapsed and expanded tabs; the hidden label keeps its layout space.

## 0.3.3 — 2026-07-18

- Fixed: removed the fixed tab height so the reduced vertical padding changes the rendered tab height.

## 0.3.2 — 2026-07-18

- Fixed: active tabs now retain their hover surface and full opacity when pointed at.
- Visual: reduced vertical tab padding from 8px to 4px.

## 0.3.1 — 2026-07-18

- Visual: reduced the navigation icon from 24px to 20px in collapsed and expanded tabs.

## 0.3.0 — 2026-07-16

- Visual: catalog preview now places tabs in their vertical sidebar context and exposes the active-edge treatment.

## 0.2.0 — 2026-07-16

- Added: optional controlled expanded state for deterministic context stories.
- Fixed: active treatment stays visible inside the clipped application sidebar.
- Accessibility: current navigation destination now uses `aria-current="page"`.

## 0.1.0

- Added collapsed and expanded navigation states.

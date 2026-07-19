# Changelog

## Unreleased

- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/organisms/shell/AppSidebar`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.6.2 — 2026-07-19

- Changed: Colocated production styles in `AppSidebar.scss`; catalog-only CSS now lives in `AppSidebar.preview.tsx`.

## 0.6.1 — 2026-07-19

- Visual: replaced the Settings footer icon geometry with the supplied rounded gear artwork.

## 0.6.0 — 2026-07-19

- Added: persistent Settings footer action with a reusable Settings icon asset.
- Changed: Settings selection is application-level state and does not extend the project module taxonomy.
- Visual: the authored preview now uses the same code-native icons as the production sidebar.

## 0.5.4 — 2026-07-19

- Fixed: the application theme transition no longer overwrites the navigation grid transition later in the stylesheet cascade.

## 0.5.3 — 2026-07-19

- Fixed: restored the grid-track transition using explicit collapsed and expanded column values, allowing the Directory Panel width to interpolate.

## 0.5.2 — 2026-07-18

- Fixed: the shell now interpolates its sidebar-width value, so the Directory Panel and its contents receive intermediate widths during disclosure.

## 0.5.1 — 2026-07-18

- Fixed: pointer disclosure now notifies the application shell, keeping the adjacent Directory Panel in the same width transition.

## 0.5.0 — 2026-07-16

- Changed: the integration shell now interpolates both navigation tracks together, preventing the Directory Panel from snapping during sidebar disclosure.
- Accessibility: navigation motion is removed when reduced motion is requested.

## 0.4.0 — 2026-07-16

- Visual: catalog preview now depicts the real logo, navigation items, active treatment, disclosed labels, and add action instead of generic bars.

## 0.3.0 — 2026-07-16

- Added: controlled expanded presentation for behavior and integration stories.
- Changed: sidebar visuals are owned by the library component stylesheet.

## 0.2.0 — 2026-07-16

- Changed: module labels and accessible names now resolve through the shared i18n provider.

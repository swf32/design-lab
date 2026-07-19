# Changelog

## Unreleased

- Fixed: Folder disclosure now expands or collapses the tree without also selecting the folder or navigating the application.
- Accessibility: Mobile toolbar, search, tree, and footer geometry now use readable touch density.
- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/organisms/shell/DirectoryPanel`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.7.1 — 2026-07-19

- Changed: Colocated production styles in `DirectoryPanel.scss`; catalog-only CSS now lives in `DirectoryPanel.preview.tsx`.

## 0.7.0 — 2026-07-19

- Added: configurable search with ancestor-aware result disclosure.
- Added: icon color overrides with source-scoped localStorage persistence and controlled callbacks.
- Added: configurable future item actions using the Semantic Tree Item menu slot.
- Changed: real folders start collapsed by default while virtual and top-level rows remain visible.
- Visual: increased indentation between semantic tree levels.

## 0.6.0 — 2026-07-16

- Added: independent folder selection with active treatment and module-filter callback.
- Added: virtual `All` folder support without filesystem disclosure behavior.

## 0.5.0 — 2026-07-16

- Changed: width disclosure is synchronized with Application Sidebar through the shared parent navigation grid.
- Preserved: direct resize still updates and persists the total navigation width without transition lag.

## 0.4.0 — 2026-07-16

- Visual: catalog preview now depicts source identity, module toolbar, nested semantic entities, selection, scrollbar, and filesystem status.

## 0.3.0 — 2026-07-16

- Added: representative and dense content fixtures for semantic navigation.
- Visual: tree scrolling now uses a quiet token-driven scrollbar with stable gutter.

## 0.2.0 — 2026-07-16

- Changed: loading, empty, action, and accessibility copy now resolves through i18n.

# Changelog

## Unreleased

- Changed: Added authored semantic retrieval metadata for MCP and CLI search.

- Changed: Workbench stories now render automatically from the adjacent story module.
- Breaking: Canonical filesystem and URL path moved to `components/organisms/dialogs/CreateProjectDialog`; no legacy redirect is retained.
- Changed: Category is derived from the component directory; the package barrel export remains automatic.

## 0.2.1 — 2026-07-19

- Changed: Colocated production styles in `CreateProjectDialog.scss`; catalog-only CSS now lives in `CreateProjectDialog.preview.tsx`.

## 0.2.0 — 2026-07-16

- Changed: all product copy now resolves through the shared i18n provider.

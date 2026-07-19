# Directory Panel

Resizable semantic navigation for the active module and selected source.

The source header and local-filesystem footer remain fixed. The semantic tree between them owns vertical scrolling, uses a quiet token-driven scrollbar, and clips long entity names without changing panel width.

The panel does not own an independent hover width. Application Sidebar and Directory Panel divide one navigation width in their parent shell. When the application rail discloses labels, both grid tracks interpolate together; when the resize handle moves, the shared navigation width changes directly and is persisted by the application.

Folders are both disclosure controls and module filters. Selecting a folder updates the right-hand module view even when the same click also expands or collapses its children. `All` is a code-owned virtual folder above the filesystem tree; it resets filtering without creating an `All/` directory on disk.

The default presentation starts with real folders collapsed, so only virtual and top-level folders are visible. Search, icon coloring, remembered colors, and future item actions are enabled by default and can be disabled independently with `searchEnabled`, `coloringEnabled`, `persistItemColors`, and `actionsEnabled`. Search reveals matching descendants and their ancestor folders without mutating disclosure state. Color overrides are stored by source, entity kind, and canonical path.

## Stories

`Content states` covers representative, empty, and loading data. `Dense project tree` is a content-stress context story with realistic component categories, nesting, long labels, and enough rows to expose overflow, scrollbar, clipping, disclosure, and focus defects. `Resizable width` isolates the resizing behavior. `Optional navigation capabilities` proves that the new UX affordances remain configurable rather than becoming hidden application assumptions.

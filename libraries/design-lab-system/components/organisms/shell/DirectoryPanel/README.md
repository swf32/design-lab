# Directory Panel

Resizable semantic navigation for the active module and selected source.

The source header and local-filesystem footer remain fixed. The semantic tree between them owns vertical scrolling, uses a quiet token-driven scrollbar, and clips long entity names without changing panel width.

Header, toolbar, search, tree rows, and footer keep one density across viewport widths. The application may place the panel inside a mobile drawer, but the component does not enlarge itself there.

The panel does not own an independent hover width. Application Sidebar and Directory Panel divide one navigation width in their parent shell. When the application rail discloses labels, both grid tracks interpolate together; when the resize handle moves, the shared navigation width changes directly and is persisted by the application.

Folders expose two deliberate actions: the disclosure button expands or collapses children without navigation, while the label selects the folder and updates the right-hand module view. `All` is a code-owned virtual folder above the filesystem tree; it resets filtering without creating an `All/` directory on disk.

Expandable semantic containers are not limited to filesystem folders. A module may expose typed document or group nodes when those distinctions matter, while `viewControl` provides an optional module-owned switch between alternate projections of the same discovered entities. The panel never invents a taxonomy or converts every container into a fake folder.

When a deep link selects a nested container or entity, the panel automatically expands the typed container ancestors of `selectedFolderPath`, so the active location stays visible after reload.

The default presentation starts with real folders collapsed, so only virtual and top-level folders are visible. Search, icon coloring, remembered colors, and future item actions are enabled by default and can be disabled independently with `searchEnabled`, `coloringEnabled`, `persistItemColors`, and `actionsEnabled`. Search reveals matching descendants and their ancestor folders without mutating disclosure state. Color overrides are stored by source, entity kind, and canonical path.

At phone widths, source, toolbar, search, tree rows, and footer switch to touch density. The tree remains the only scrolling region and every folder disclosure target is at least 44 CSS pixels.

## Stories

`Content states` covers representative, empty, and loading data. `Dense project tree` is a content-stress context story with realistic component categories, nesting, long labels, and enough rows to expose overflow, scrollbar, clipping, disclosure, and focus defects. `Resizable width` isolates the resizing behavior. `Optional navigation capabilities` proves that the new UX affordances remain configurable rather than becoming hidden application assumptions. `Typed token hierarchy` covers folder, token-document, token-group, and token semantics with an optional view switch.

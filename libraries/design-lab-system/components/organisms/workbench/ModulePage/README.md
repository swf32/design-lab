# Module Page

Canonical layout surface for catalog and graph modules inside `WorkspaceStage`. The scroll variant
owns document-like module scrolling; the canvas variant reserves the remaining height for a graph
or other bounded interactive surface. Insets and header rhythm remain viewport-invariant; only the
content composed inside the surface may choose a responsive layout. It is not a production Page entity.

The System also owns optional catalog presentation classes for content inside the surface:
`dl-module-page__groups` (with `--assets` spacing), `dl-module-page__grid` (with `--components`,
`--assets`, `--palette`, or `--screens` columns), and `dl-module-page__empty`. The application
supplies items, grouping, filtering, and empty-state copy. A replacement System can restyle these
catalog layouts without editing route views.

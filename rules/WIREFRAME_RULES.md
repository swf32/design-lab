# Design Lab Wireframe rules

This file is the shared source of truth for humans, Codex, Claude, and other agents creating or changing page-level Wireframes.

## Purpose

A Wireframe explores different UX and layout directions for one product problem before a Page contract is approved. It is not merely a low-fidelity screenshot. It must support review of:

- layout directions — materially different information architecture or composition;
- states — meaningful product conditions and data snapshots inside a layout;
- controls — reversible ways to explore conditions without editing source;
- user flow — explicit actions and transitions between states.

Layout, state, and flow are independent axes. Do not encode a layout change as a state, duplicate the same state for every layout, or treat a visual comparison as a production Page.

## Canonical hybrid directory

Every Wireframe is a directory under `<project-or-library>/wireframes/<category-path>/<WireframeName>/`.

It starts with:

- `wireframe.json` — machine-readable manifest, controls, state snapshots, and user-flow graph;
- `<WireframeName>.wireframe.tsx` — typed renderer composed from real Library Components and local exploratory blocks;
- `<WireframeName>.wireframe.scss` — optional adjacent styles imported by the renderer;
- `README.md` — intent, review questions, and usage notes;
- `CHANGELOG.md` — append-only history.

The JSON manifest is the source of truth for structure and graph semantics. TSX is the source of truth for rendered layout. Do not duplicate layouts, state values, controls, or flow edges in a central application registry.

## Manifest contract

`wireframe.json` contains:

- `schemaVersion`, `id`, `name`, `status`, and `description`;
- `entry`, `docs`, and `changelog`;
- stable `layouts[]` with `id`, `name`, `description`, and the UX hypothesis being tested;
- stable `controls[]` using supported `radio`, `boolean`, and `range` kinds;
- stable `states[]` with complete serializable control-value snapshots;
- `defaultLayout` and `defaultState`;
- `flow.nodes[]`, each referencing one state and owning authored Canvas coordinates;
- `flow.edges[]`, each naming the user action that causes a transition.

Supported lifecycle values are `draft`, `review`, and `approved`. Approval means a direction can graduate into a Page; it does not turn the Wireframe itself into a Page.

`renderWireframe` (the function `entry` exports) must stay a plain, Hook-free function: the catalog card, the fullscreen screen view, and the user-flow Canvas all call it directly as an ordinary function, repeatedly, to build a preview per state — not once through JSX. Calling a Hook directly in its body attaches it to whatever fiber happens to be rendering, with an unstable call count across renders, and will eventually crash the surrounding view (see [`PAGE_RULES.md`](PAGE_RULES.md), where this exact mistake in a Page renderer produced a permanently blank app). Any local interactive state belongs in a nested component mounted through JSX inside the returned tree, never inline in `renderWireframe` itself.

Every referenced layout, state, node, and edge id must exist and be unique. State values must satisfy the declared control types and ranges. Every non-terminal state should participate in at least one authored transition.

`wireframe.json` may also define the same optional semantic-retrieval fields `component.json` supports — `aliases`, `useWhen`, `avoidWhen` — so MCP and CLI `designlab_search`/`designlab_browse` can surface a reusable layout direction by intent (e.g. "split auth layout") without an agent guessing its directory name. These fields are never required for discovery; when absent, the gateway falls back to the first paragraph of the adjacent `README.md`. A resolved Wireframe entity also reports `compositionUses`, the list of Library Component symbols the renderer actually imports — derived from static analysis of `<WireframeName>.wireframe.tsx`, the same mechanism `uses`/`usedBy` already uses for Components, never authored by hand.

## Layout directions

A Wireframe exists to compare meaningfully different UX approaches. Each layout must test a named hypothesis such as comparison-first, recommended-choice focus, or guided configuration.

Do not create cosmetic variants that only change color, radius, decoration, or arbitrary spacing. A layout direction must change at least one of:

- information priority;
- grouping or order;
- navigation or progressive disclosure;
- density or comparison model;
- action placement;
- responsive composition.

The same state snapshot must render across every compatible layout so reviewers can compare structure without accidental data changes. Mobile is a deliberate composition of the same layout hypothesis, not a scaled-down desktop screenshot.

## States and dev mode

States are stable product snapshots with human-readable names and complete values. Controls may temporarily produce a custom state; when values exactly match a saved snapshot, the runtime restores that state identity.

Dev mode is a floating, dismissible production surface outside the Wireframe content. It provides:

- back navigation, Screen/User flow switching, and share-link copying;
- the active Project or Library product mode when that source declares multiple modes;
- saved state selection;
- layout selection;
- typed controls;
- a reset path;
- the current derived/custom state label.

Dev mode never consumes permanent Page layout space. All touch targets are at least `44px`, it has a keyboard path, and it cannot rely on hover or drag.

Product modes come only from the active Wireframe source token files and remain independent of the Design Lab interface theme. One mode creates no redundant control; two or three modes use `TabSwitcher`; four or more use a visible `RadioButton` group. The selected mode is part of the shareable URL and scopes the fullscreen screen, catalog preview, desktop/mobile flow previews, and established Library Components without recoloring the Dev mode shell.

The closed Wireframe route has no permanent toolbar, title bar, Tab Switcher, status pill, or back button over the product screen. The quiet translucent Dev mode trigger is the only review navigation/control action outside the screen or flow content. A separate compact Inspector action may sit at the bottom end for developer handoff; it must not contain review navigation or state controls. Clipboard writing must include a manual selectable-link fallback because an IP-hosted HTTP deployment may not expose the secure Clipboard API.

Control semantics:

- `radio` selects one value from explicit options;
- `boolean` renders a Checkbox;
- `range` renders a Slider with min, max, and step;
- `visibleWhen` may progressively reveal a control based on another value.

## User-flow Canvas

The user-flow Canvas visualizes causality, not merely screen order.

- Nodes reference saved states.
- Every state node pairs the real adjacent Wireframe screen in an inert desktop 16:9 viewport with a portrait mobile viewport from the same renderer at full LOD zoom; at medium zoom only desktop renders; at far zoom a metadata card (title, description, eyebrow) replaces live previews. Do not author separate node thumbnails or `*.preview.tsx` stand-ins.
- Directed edges name the exact user action that moves between nodes.
- Selecting a node updates the current state.
- Activating Preview opens that state in the current layout.
- Screen actions dispatch stable action ids and update state through authored flow semantics.
- Authored coordinates preserve graph topology. The Canvas enforces a minimum gap between expanded node columns and within-column rows so responsive screen pairs cannot overlap.
- Pan and zoom are enhancements; visible buttons and keyboard navigation provide equivalent access.
- Two-finger and trackpad pinch zoom around the gesture midpoint inside the Canvas and must not scale the browser page.
- The low-contrast grid is visually infinite. Its viewport background position and size derive from the same pan/zoom transform as nodes and edges, so it has no finite boundary.

The graph must remain legible without relying on color alone. Edges use arrowheads and labels, selected nodes expose `aria-pressed`, and the Canvas respects reduced motion. Mobile may simplify node density but must not hide transitions or require horizontal document scrolling.

## Runtime and URLs

The Wireframe route is derived from its canonical directory: `/wireframes/<wireframe-path>`. It renders as a fullscreen review surface outside the normal Design Lab shell.

Selected layout, state, view (`screen` or `flow`), product mode, and serializable control values live in the query string. Copying the URL restores the same review context.

Only a discovered Wireframe entity directory opens fullscreen. Category folders such as `product` remain semantic Directory Panel destinations and open a filtered Wireframes catalog; they must never fall through to a missing-renderer screen.

The Wireframes catalog uses the same adjacent renderer in an inert 16:9 `WireframeScreenPreview`. A `WireframeCard` follows the Component Card hierarchy: the real screen is primary, while the page name and lifecycle sit in a bottom gradient. Catalog and flow previews must never be separately drawn interpretations of the page.

The application discovers `wireframe.json` recursively and loads the adjacent manifest-declared renderer through a build-time module glob. It must not add entity ids to a hand-written switch.

## Reuse and inspection

Use production Components from the active Library for established controls and patterns. Repeated review-shell patterns such as dev panels, graph Canvases, inspectors, and toolbars belong in the Library as production Components with manifests, previews, stories, documentation, and changelogs.

Exploratory local blocks are allowed when they are the subject of layout evaluation. They must use Library tokens and remain visibly subordinate to established Components. Do not promote a one-off layout block into a Component merely to satisfy purity.

Dev mode controls describe test conditions and entitlements, not actions the product user should perform. A target action such as choosing team seats, quantity, sorting, or checkout options belongs in the rendered screen. Its value may remain in saved-state snapshots and deep links without being exposed as a Dev mode control.

Wireframes use the same production `WorkbenchInspector` as Component Playgrounds. It is anchored at
the viewport bottom end, scopes pointer/touch selection to the screen or flow stage, and uses the
purple dashed `WorkbenchAction` trigger. Component roots and named slots retain their purple and
pink identities; an `<img>`/`<video>` host whose `src`/`poster` resolves to a locally imported asset
gets a teal identity instead, whether or not it sits inside a manifest slot; other raw exploratory
blocks expose authored source SCSS/CSS. The review build derives Component calls from normal
imports, slots from Component manifests, asset imports from the same static-import analysis, and
raw host locations from the Wireframe TSX automatically. A Wireframe author must not add inspection
attributes or duplicate source fragments. Active Inspector mode gives every discovered Component
root a quiet purple dashed outline, every manifest-declared slot a quiet pink dashed outline, and
every resolved asset host a quiet teal dashed
outline. Selecting a target consumes the product activation and pins the copyable handoff popover;
it must never navigate, submit, or mutate the reviewed screen. Once pinned, the next surface click
only dismisses the popover; selecting another target requires a subsequent click.

## Verification

Before marking a Wireframe ready for review:

1. Verify every layout against at least three materially different saved states.
2. Exercise every control, conditional control, screen action, node, and edge.
3. Copy and reopen a deep link.
4. Check desktop, `375px` mobile, and mobile landscape without document overflow.
5. Verify keyboard selection, visible focus, reduced motion, every source product mode, and independence from the Design Lab interface theme.
6. Confirm automatic API/navigation discovery and zero manifest diagnostics.
7. Run formatting, tests, and the production build.

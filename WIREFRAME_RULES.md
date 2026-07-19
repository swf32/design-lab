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

Every referenced layout, state, node, and edge id must exist and be unique. State values must satisfy the declared control types and ranges. Every non-terminal state should participate in at least one authored transition.

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

- saved state selection;
- layout selection;
- typed controls;
- a reset path;
- the current derived/custom state label.

Dev mode never consumes permanent Page layout space. All touch targets are at least `44px`, it has a keyboard path, and it cannot rely on hover or drag.

Control semantics:

- `radio` selects one value from explicit options;
- `boolean` renders a Checkbox;
- `range` renders a Slider with min, max, and step;
- `visibleWhen` may progressively reveal a control based on another value.

## User-flow Canvas

The user-flow Canvas visualizes causality, not merely screen order.

- Nodes reference saved states.
- Directed edges name the exact user action that moves between nodes.
- Selecting a node updates the current state.
- Activating Preview opens that state in the current layout.
- Screen actions dispatch stable action ids and update state through authored flow semantics.
- Pan and zoom are enhancements; visible buttons and keyboard navigation provide equivalent access.

The graph must remain legible without relying on color alone. Edges use arrowheads and labels, selected nodes expose `aria-pressed`, and the Canvas respects reduced motion. Mobile may simplify node density but must not hide transitions or require horizontal document scrolling.

## Runtime and URLs

The Wireframe route is derived from its canonical directory: `/wireframes/<wireframe-path>`. It renders as a fullscreen review surface outside the normal Design Lab shell.

Selected layout, state, view (`screen` or `flow`), and serializable control values live in the query string. Copying the URL restores the same review context.

The application discovers `wireframe.json` recursively and loads the adjacent manifest-declared renderer through a build-time module glob. It must not add entity ids to a hand-written switch.

## Reuse and inspection

Use production Components from the active Library for established controls and patterns. Repeated review-shell patterns such as dev panels, graph Canvases, inspectors, and toolbars belong in the Library as production Components with manifests, previews, stories, documentation, and changelogs.

Exploratory local blocks are allowed when they are the subject of layout evaluation. They must use Library tokens and remain visibly subordinate to established Components. Do not promote a one-off layout block into a Component merely to satisfy purity.

The shared Playground/Page Inspector contract should be reusable on Wireframes. Component roots and named slots retain their purple and pink identities; raw exploratory blocks expose authored CSS.

## Verification

Before marking a Wireframe ready for review:

1. Verify every layout against at least three materially different saved states.
2. Exercise every control, conditional control, screen action, node, and edge.
3. Copy and reopen a deep link.
4. Check desktop, `375px` mobile, and mobile landscape without document overflow.
5. Verify keyboard selection, visible focus, reduced motion, light mode, and dark mode.
6. Confirm automatic API/navigation discovery and zero manifest diagnostics.
7. Run formatting, tests, and the production build.

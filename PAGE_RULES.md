# Design Lab Page rules

This file is the shared source of truth for humans, Codex, Claude, and other agents creating or changing Pages. `AGENTS.md` and `CLAUDE.md` point here for every Page creation or modification task; do not create a competing entity contract elsewhere.

## Purpose

A Page is the finalized, production-composed screen for one product route. It is the graduation point of the Wireframe → Page pipeline described in `WIREFRAME_RULES.md`: a Wireframe compares layout directions before commitment, while a Page is the single committed composition a developer can copy and ship.

A Page must:

- render exclusively from real Library Components and Component-owned tokens, never exploratory local blocks;
- expose review states as data/domain snapshots of one committed layout, not competing layout directions;
- carry a hand-off-ready inspector identical in contract to the Component Playground and Wireframe inspector;
- optionally record which Wireframe direction it graduated from, and describe its navigation to other Pages through one shared flow graph;
- surface an authored intended production route as hand-off metadata, without ever letting that route override Design Lab's own reserved navigation.

If a screen still needs layout comparison, it belongs in `wireframes/`, not `pages/`. Moving a Wireframe layout into a Page is a deliberate authoring action, not an automatic conversion; Design Lab never mutates a Wireframe's files when a Page is created.

## Canonical hybrid directory

Every Page is a directory under `<project-or-library>/pages/<category-path>/<PageName>/`. Category and nesting are semantic filesystem folders above the Page directory, the same convention used by Components and Wireframes; category is never authored inside the manifest.

It starts with:

- `page.json` — machine-readable manifest: identity, lifecycle, intended route, controls, state snapshots, provenance, and the flow graph;
- `<PageName>.page.tsx` — typed renderer composed only from real Library Components;
- `<PageName>.page.scss` — optional adjacent styles imported by the renderer, using Library tokens;
- `README.md` — intent, review questions, and usage notes;
- `CHANGELOG.md` — append-only history.

The JSON manifest is the source of truth for identity, route, control/state data, provenance, and the flow graph. TSX is the source of truth for the rendered composition. Do not duplicate control values, state snapshots, or flow edges in a central application registry; all of it is discovered from the manifest the same way `wireframe.json` and `component.json` are discovered today.

Example tree:

    pages/
    └── checkout/
        └── Checkout/
            ├── page.json
            ├── Checkout.page.tsx
            ├── Checkout.page.scss
            ├── README.md
            └── CHANGELOG.md

## Manifest contract

`page.json` contains:

- `schemaVersion`, `id`, `name`, `status`, and `description`;
- `entry`, `docs`, and `changelog`;
- `route` — the author's intended production path (for example `/billing`, `/`), optionally with `routeParams[]` for dynamic segments. This is hand-off metadata for the developers who copy the Page, not a literal Design Lab route; see Routing below for exactly how and when it is mirrored;
- `derivedFromWireframe` — optional `{ sourceId, wireframeId, layoutId, stateId }` pointing at the Wireframe direction and saved state this Page graduated from, resolved for display but never required for discovery;
- `controls[]` — the same typed control registry as Wireframe (`radio`, `boolean`, `range`, with `visibleWhen`), but describing domain/data conditions such as authentication, subscription tier, or permission level rather than layout variants;
- stable `states[]` with complete serializable `controls[]`-value snapshots, following the same snapshot-identity rule as Wireframe states: a custom control combination that exactly matches a saved snapshot resolves to that snapshot's identity;
- `defaultState`;
- `flow.nodes[]`, each referencing one state owned by this Page and carrying authored Canvas coordinates, exactly like a Wireframe flow node;
- `flow.edges[]`, each naming the user action that causes the transition and pointing `to` one of two target kinds:
  - `{ kind: "state", stateId }` — an internal transition to another state of this same Page;
  - `{ kind: "page", pageId, condition? }` — a cross-Page navigation edge. `condition` is an optional `{ controlId, value }` pair that makes the destination depend on this Page's current control value, for example a Profile action that targets an Auth Page when `authenticated` is `false` and a Profile Page when it is `true`. Two edges from the same action node with complementary conditions express a branch; an edge with no `condition` is the unconditional default;
- `diagnosticsAcknowledged[]` — `{ code, entityRef?, reason, acknowledgedAt }`, the only mechanism that suppresses a diagnostic from blocking a "ready" hand-off view. See Page card and diagnostics acknowledgement below.

There is no `layouts[]` and no variants field: a Page has exactly one composition. A Page never authors an edge to a Wireframe; that direction of the relationship is discoverable only through `derivedFromWireframe` on the target Page.

`page.json` deliberately has no API/backend schema. States and controls stay mock-first by default: an author who needs a real network call wires it directly in `<PageName>.page.tsx` as ordinary code. Design Lab does not model that connection, require a schema for it, or attempt to visualize live request/response data; it is an unmanaged escape hatch, not a contract.

Supported lifecycle values are `draft`, `review`, and `approved`. `approved` means the Page is the current production contract for its route; it does not lock the file from further changes, it only signals hand-off readiness.

Every referenced control, state, node, and edge id must exist and be unique. State values must satisfy the declared control types and ranges. Every `flow.edges[]` target must resolve: a `state` target must exist in this Page's own `states[]`, and a `page` target must resolve to a discovered Page in the same source; an unresolved target is a diagnostic on the linking Page, not a broken render. `derivedFromWireframe`, when present, must resolve to a real Wireframe/layout/state combination in the same source; a stale reference is a diagnostic, not a crash, exactly like the manifest-parse-error and schema-version-unsupported isolation already guaranteed for `component.json` and `wireframe.json`.

## Composition

A Page renders only real Library Components and their composition slots. Unlike a Wireframe, it must not contain exploratory local blocks: by the time a screen becomes a Page, every visual decision should already resolve to an existing Component, or that gap is itself a signal to go add the missing Component first.

Product copy, layout structure, and interaction logic live in the Page renderer exactly as they would in the shipped application; a Page is not illustrative. States capture the domain/data conditions a Page must render correctly (empty, loading, error, populated, unauthenticated, permission-limited, and so on), not alternative layouts. If two states would require materially different information architecture, that comparison belongs in a Wireframe, and the Page keeps only the direction it committed to.

## Routing

A Page carries two distinct route identities that must never be confused:

1. Its canonical Design Lab filesystem path, `/pages/<category-path>/<PageName>`, which always resolves and always opens the Page card described below.
2. Its authored `route` field — the path the Page is meant to occupy once shipped, chosen entirely by the author to match the real product's information architecture.

Opening full-screen review from the Page card mirrors the authored `route` whenever that path does not collide with a Design Lab reserved top-level module segment (`components`, `wireframes`, `pages`, `tokens`, `palette`, `assets`, `fonts`, `rules`, `decisions`, or any other reserved module id). Mirroring the authored route is what makes the review surface feel like browsing the real site instead of a design tool.

When the authored `route` does collide with a reserved segment, Design Lab silently falls back to the filesystem-path-based full-screen URL for that Page and raises `page-route-conflicts-reserved-module` as a diagnostic on the Page. This never blocks saving the manifest, and it never lets an authored route shadow or break a Design Lab module: reserved routes always win.

`routeParams[]`, when present, name the dynamic segments of `route` (for example `:invoiceId` in `/billing/:invoiceId`) purely as hand-off documentation; Design Lab does not resolve or substitute real values for them.

## Page card and diagnostics acknowledgement

Unlike a Wireframe, opening a Page from the catalog does not drop the reviewer straight into full-screen review. It first opens a **Page card**: a dedicated overview showing the Page's description, its available actions/transitions (derived from `flow.edges[]`), and its current diagnostics. An explicit action on the card opens the full-screen review surface described in Runtime and URLs below.

Diagnostics are listed on the Page card grouped by code. Each diagnostic can be individually acknowledged through an explicit action that requires a typed `reason`; acknowledging writes an entry to `diagnosticsAcknowledged[]` and the diagnostic then renders dimmed/struck-through on the card instead of disappearing, keeping the rationale visible and auditable in git history. Acknowledging a diagnostic never edits, removes, or reorders the underlying manifest data it refers to.

This is a binding authoring rule, not only UI behavior: Codex, Claude, and any other agent must never populate `diagnosticsAcknowledged[]` on the user's behalf. If a diagnostic cannot be fixed, the agent must explain why in plain language and ask the user to confirm before proposing (never silently performing) an acknowledgement. An agent that "cleans up" remaining diagnostics by acknowledging them without that explicit, per-diagnostic confirmation violates this contract.

## Dev mode and states

Pages reuse the same floating, dismissible review shell contract as Wireframes, scoped to what a committed single-layout screen actually needs:

- back navigation and share-link copying;
- the active Project or Library product mode when that source declares multiple modes;
- saved state selection and the typed `controls[]` that produce custom states;
- a reset path;
- the current derived/custom state label.

There is no layout switcher: a Page has exactly one composition. Control and product-mode rendering follow the same rule as Wireframes — one option creates no control, two or three use `TabSwitcher`, four or more use a visible `RadioButton` group — and remain independent of the Design Lab interface theme. The selected state, control values, and product mode are part of the shareable URL.

## Flow graph and sitemap

A Page owns one flow graph combining its own internal transitions and its navigation to other Pages, replacing what would otherwise be two separate mechanisms:

- **Per-Page Canvas.** Reuses the Wireframe user-flow Canvas contract: authored node coordinates, directed labeled edges, pan and pinch-to-zoom, keyboard navigation, and respect for reduced motion. It renders this Page's own `flow.nodes[]`/`flow.edges[]`, including edges whose target is another Page, shown as a named exit node the reviewer can follow into that Page's own card.
- **Aggregated sitemap.** A separate, derived catalog-level view collects every `flow.edges[]` entry of kind `page` across every discovered Page in the same source into one site-wide navigation graph. It is never separately authored: it is computed the same way `usedBy`/`usedInExamplesBy` relations are computed for Components, so it can never drift from the per-Page graphs that feed it. Because it can span an arbitrary number of Pages, it uses automatic layout instead of authored coordinates.

Selecting a cross-Page edge in review mode previews the target Page's card without a full document navigation that would drop the reviewer out of Design Lab.

## Reuse and inspection

Pages use the same production `WorkbenchInspector` as Component Playgrounds and Wireframes. Component roots and named slots keep their purple and pink identities; the review build derives Component calls from normal imports and slots from Component manifests automatically. A Page author must not add inspection attributes or duplicate source fragments.

Because a Page renders no exploratory blocks, every inspected element should resolve to a Component root or a manifest-declared slot; an inspected raw host node with no owning Component is itself a signal that a needed Component is still missing from the Library.

## Relations and diagnostics

`uses` / `usedBy` for a Page follow the same static-import rule as Components and Wireframes: normal TypeScript/TSX imports in `<PageName>.page.tsx` are the only source of the direct usage graph. Type-only imports are ignored. A Page importing a Component only used elsewhere as an example (`examplesUse`) is a contract diagnostic, matching the existing Component/Wireframe separation between production and example usage.

Known diagnostic codes for Pages, following the same isolation guarantee as Components and Wireframes (`05-entities-and-file-contracts.md`):

| Код | Значение |
|----|----|
| `manifest-parse-error` | `page.json` не прошёл `JSON.parse`; сущность остаётся видимой с id/name из пути директории. |
| `schema-version-unsupported` | `page.json` объявляет `schemaVersion` новее, чем понимает текущий сервер. |
| `page-status-missing` / `page-status-unknown` | Отсутствующий или неподдерживаемый `status`. |
| `page-entry-missing` | Заявлен `entry`, но соседний `*.page.tsx` не найден на диске. |
| `page-route-conflicts-reserved-module` | Авторский `route` совпадает с зарезервированным top-level модулем Design Lab; full-screen review откатывается на filesystem-путь. |
| `page-control-kind-invalid`, `page-control-range-invalid`, `page-control-condition-invalid` | Некорректное объявление control, аналогично Wireframe. |
| `page-state-id-invalid` | Отсутствующий или дублирующийся id в `states[]`. |
| `page-state-value-missing`, `page-state-radio-value-invalid`, `page-state-boolean-value-invalid`, `page-state-range-value-invalid` | Значение state не соответствует объявленному control. |
| `page-default-state-invalid` | `defaultState` ссылается на несуществующий id. |
| `page-flow-node-id-invalid` | Отсутствующий или дублирующийся id в `flow.nodes[]`, либо ссылка на несуществующий state. |
| `page-flow-edge-invalid` | `flow.edges[].to` не резолвится: `state`-target отсутствует в `states[]` этой Page, либо `page`-target не резолвится в существующую Page того же source. |
| `page-flow-condition-invalid` | `flow.edges[].condition` ссылается на несуществующий control или недопустимое для него значение. |
| `page-derived-from-wireframe-invalid` | `derivedFromWireframe` ссылается на несуществующий Wireframe, layout, или state. |
| `page-production-style-adhoc-value` | Стиль Page использует значение, не выраженное через Library-токен, там где production-строгость Page требует токенизированного значения. |

## Runtime and URLs

The canonical Page card route is derived from its directory: `/pages/<page-path>`. It opens inline in the normal Design Lab shell, not full-screen, and shows description, actions, and diagnostics as described above.

Full-screen review opens from an explicit action on the card. Its URL mirrors the authored `route` (see Routing above) unless that route conflicts with a reserved segment, in which case it falls back to `/pages/<page-path>`. Selected state, control values, and product mode live in the query string so a copied URL restores the same review context, matching the Wireframe convention. Category folders remain semantic Directory Panel destinations that open a filtered Pages catalog and must never fall through to a missing-renderer screen.

The application discovers `page.json` recursively and loads the adjacent manifest-declared renderer through a build-time module glob, the same mechanism already used for Components and Wireframes. It must not add entity ids to a hand-written switch.

## Verification

Before marking a Page ready for review:

1. Verify every state renders correctly against real Components; no exploratory block remains.
2. Exercise every control, state, flow edge (internal and cross-Page, including conditional branches), and the reset path.
3. Copy and reopen a deep link, and confirm the full-screen route mirrors the authored `route` (or correctly falls back when it conflicts with a reserved module).
4. Check desktop, `375px` mobile, and mobile landscape without document overflow.
5. Verify keyboard navigation, visible focus, reduced motion, every source product mode, and independence from the Design Lab interface theme.
6. Confirm automatic API/navigation discovery and zero unacknowledged manifest diagnostics; every acknowledged diagnostic must carry an explicit, user-confirmed `reason`.
7. Run formatting, tests, and the production build.

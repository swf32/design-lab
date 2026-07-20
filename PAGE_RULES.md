# Design Lab Page rules

This file is the shared source of truth for humans, Codex, Claude, and other agents creating or changing Pages. `AGENTS.md` and `CLAUDE.md` point here for every Page creation or modification task; do not create a competing entity contract elsewhere.

## Purpose

A Page is the finalized, production-composed screen for one product route. It is the graduation point of the Wireframe → Page pipeline described in `WIREFRAME_RULES.md`: a Wireframe compares layout directions before commitment, while a Page is the single committed composition a developer can copy and ship.

A Page must:

- render exclusively from real Library Components and Component-owned tokens, never exploratory local blocks;
- expose review states as data snapshots of one committed layout, not competing layout directions;
- carry a hand-off-ready inspector identical in contract to the Component Playground and Wireframe inspector;
- optionally record which Wireframe direction it graduated from, and which other Pages it links to.

If a screen still needs layout comparison, it belongs in `wireframes/`, not `pages/`. Moving a Wireframe layout into a Page is a deliberate authoring action, not an automatic conversion; Design Lab never mutates a Wireframe's files when a Page is created.

## Canonical hybrid directory

Every Page is a directory under `<project-or-library>/pages/<category-path>/<PageName>/`. Category and nesting are semantic filesystem folders above the Page directory, the same convention used by Components and Wireframes; category is never authored inside the manifest.

It starts with:

- `page.json` — machine-readable manifest: identity, lifecycle, states, provenance, and the inter-Page navigation graph;
- `<PageName>.page.tsx` — typed renderer composed only from real Library Components;
- `<PageName>.page.scss` — optional adjacent styles imported by the renderer, using Library tokens;
- `README.md` — intent, review questions, and usage notes;
- `CHANGELOG.md` — append-only history.

The JSON manifest is the source of truth for identity, state data, provenance, and the navigation graph. TSX is the source of truth for the rendered composition. Do not duplicate state values or navigation edges in a central application registry; both are discovered from the manifest the same way `wireframe.json` and `component.json` are discovered today.

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
- `derivedFromWireframe` — optional `{ sourceId, wireframeId, layoutId, stateId }` pointing at the Wireframe direction and saved state this Page graduated from, resolved for display but never required for discovery;
- stable `states[]` with complete serializable data snapshots reviewers can switch between, following the same snapshot-identity rule as Wireframe states: a control value that exactly matches a saved snapshot resolves to that snapshot's identity instead of staying an anonymous custom value;
- `defaultState`;
- `links[]`, each naming the source action (`label`) and the target `pageId` it navigates to. A Page never authors an edge to a Wireframe; that direction of the relationship is discoverable only through `derivedFromWireframe` on the target Page.

Supported lifecycle values are `draft`, `review`, and `approved`. `approved` means the Page is the current production contract for its route; it does not lock the file from further changes, it only signals hand-off readiness.

Every referenced state id must exist and be unique. Every `links[].pageId` must resolve to a discovered Page in the same source; an unresolved target is a diagnostic on the linking Page, not a broken render. `derivedFromWireframe`, when present, must resolve to a real Wireframe/layout/state combination in the same source; a stale reference (the Wireframe or that saved state was later removed) is a diagnostic, not a crash, exactly like the manifest-parse-error and schema-version-unsupported isolation already guaranteed for `component.json` and `wireframe.json`.

## Composition

A Page renders only real Library Components and their composition slots. Unlike a Wireframe, it must not contain exploratory local blocks: by the time a screen becomes a Page, every visual decision should already resolve to an existing Component, or that gap is itself a signal to go add the missing Component first.

Product copy, layout structure, and interaction logic live in the Page renderer exactly as they would in the shipped application; a Page is not illustrative. States capture the data conditions a Page must render correctly (empty, loading, error, populated, permission-limited, and so on), not alternative layouts. If two states would require materially different information architecture, that comparison belongs in a Wireframe, and the Page keeps only the direction it committed to.

## Dev mode and states

Pages reuse the same floating, dismissible review shell contract as Wireframes, scoped to what a committed single-layout screen actually needs:

- back navigation and share-link copying;
- the active Project or Library product mode when that source declares multiple modes;
- saved state selection;
- a reset path;
- the current state label.

There is no layout switcher: a Page has exactly one composition. Product modes follow the same rule as Wireframes — one mode creates no control, two or three use `TabSwitcher`, four or more use a visible `RadioButton` group — and remain independent of the Design Lab interface theme. The selected state and product mode are part of the shareable URL.

## Inter-Page navigation

A Page's `links[]` describe real product navigation between finalized routes, not a review-only graph. Selecting a link in review mode previews the target Page without leaving the review shell; it must not perform a full document navigation that would drop the reviewer out of Design Lab. This graph is a lightweight sitemap, distinct from a Wireframe's user-flow Canvas: it has no authored node coordinates, layout branching, or state-transition semantics, because a Page has only one layout and its states are data snapshots rather than flow nodes.

## Runtime and URLs

The Page route is derived from its canonical directory: `/pages/<page-path>`. It renders as a fullscreen review surface outside the normal Design Lab shell, the same pattern Wireframes use.

Selected state, product mode, and serializable data values live in the query string so a copied URL restores the same review context. Only a discovered Page entity directory opens fullscreen; category folders remain semantic Directory Panel destinations that open a filtered Pages catalog and must never fall through to a missing-renderer screen.

The application discovers `page.json` recursively and loads the adjacent manifest-declared renderer through a build-time module glob, the same mechanism already used for Components and Wireframes. It must not add entity ids to a hand-written switch.

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
| `page-state-id-invalid` | Отсутствующий или дублирующийся id в `states[]`. |
| `page-default-state-invalid` | `defaultState` ссылается на несуществующий id. |
| `page-link-invalid` | `links[].pageId` не резолвится в существующую Page того же source. |
| `page-derived-from-wireframe-invalid` | `derivedFromWireframe` ссылается на несуществующий Wireframe, layout, или state. |

## Verification

Before marking a Page ready for review:

1. Verify every state renders correctly against real Components; no exploratory block remains.
2. Exercise every state, link, and the reset path.
3. Copy and reopen a deep link.
4. Check desktop, `375px` mobile, and mobile landscape without document overflow.
5. Verify keyboard navigation, visible focus, reduced motion, every source product mode, and independence from the Design Lab interface theme.
6. Confirm automatic API/navigation discovery and zero manifest diagnostics, including resolvable `links[]` and `derivedFromWireframe`.
7. Run formatting, tests, and the production build.

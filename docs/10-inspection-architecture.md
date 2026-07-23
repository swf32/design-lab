# Inspection architecture: the AST pipeline behind automatic discovery

This document makes the mechanism summarized in `AGENTS.md`, `02-modules.md`, `05-entities-and-file-contracts.md`, and decided in `DECISIONS.md` (D-039, D-044) concrete enough to extend safely. It does not introduce new product decisions; it explains how the existing decisions are implemented, where their edges are, and which follow-up work is already tracked in `IMPLEMENTATION-CHECKLIST.md`.

Design Lab never asks a Component or Wireframe author to add inspection markers (`data-dl-*`, source-string props, manual registration). Every Component callsite, manifest-declared slot, and raw DOM host is discovered automatically from two independent Node.js analyzers:

1. a **Babel AST transform** that runs inside the Vite pipeline and instruments JSX at compile time (`design-lab/scripts/inspectionTransform.mjs`);
2. a **PostCSS/SCSS analyzer** that runs on demand behind an HTTP endpoint and returns authored style source for a given file (`design-lab/server/services/authoredStyles.mjs`).

Both feed the same `WorkbenchInspector` handoff contract; neither reads React Fiber internals or computed CSSOM.

## 1. Component/slot discovery — Babel transform

### 1.1 Contract collection (`readContracts`)

Once per Vite plugin instantiation, `inspectionTransform.mjs` walks `libraries/**` recursively and:

- finds every `library.json` and reads `componentImport` (falling back to `${packageName}/components`);
- finds every `component.json` under that Library's `components/`, and for each one builds a `contract`:
  - `symbol` — derived from the production `entry` basename (`ComponentCard.tsx` → `ComponentCard`) and used as the package-import lookup key;
  - `name` — optional manifest display copy, falling back to a humanized symbol/directory (`ComponentCard` → `Component Card`);
  - `slots` — the set of prop keys whose `props.<key>.type === 'slot'` or `props.<key>.slot === true` (the slot name defaults to the prop key, or the string value of `slot` when a manifest wants a different exposed name).
- indexes contracts two ways:
  - `byImport: Map<componentImportSpecifier, Map<exportedSymbolName, contract>>` — used when the consuming file imports the package specifier (`@design-lab/system/components`);
  - `byEntry: Map<absoluteResolvedEntryPath, contract>` — used when the consuming file imports the Component's implementation file by a relative path (same-Library local blocks, before a package barrel exists).

This runs once at plugin creation, not per request. **There is currently no filesystem watcher that invalidates this map** when a `component.json` is added, renamed, or has its `props` edited during a dev session — restarting `npm run dev`/`vite` is the only guaranteed way to pick up a new contract. This is the same class of gap already tracked as "Add a filesystem watcher with scoped invalidation" in `IMPLEMENTATION-CHECKLIST.md` (P0); it applies to inspection contracts as much as to the entity API.

### 1.2 Which files are transformed

`designLabInspectionPlugin(workspaceRoot)` registers a Vite `transform` hook with `enforce: 'pre'`. For every module Vite processes it:

- strips any `?query` suffix from the module id;
- requires the extension to match `/\.[jt]sx$/` (`.tsx`/`.jsx` only — plain `.ts`/`.js` files are never instrumented, even if they return JSX via `createElement`);
- requires the resolved absolute path to live under `<workspaceRoot>/libraries/<sourceId>/...`
  (`sourceForFile`). Files under `design-lab/src/`, `projects/`, `node_modules`, and all other paths
  are returned untouched (`return null`).

This means Library-owned Component/Wireframe/Page/preview/story TSX receives the inspection
transform, while Design Lab's ordinary application shell does not. The temporary application
self-inspection pass from D-063 was removed after the component-reuse audit completed (D-066), so
the shell has neither a reserved runtime source id nor compile-time inspection boundaries. Review
surfaces continue to render instrumented Library code and retain the full Inspector/Hard Mode
contract.

There is no `command`/`mode` branch in `vite.config.ts`: the plugin is registered unconditionally, so `vite build` (`npm run build`) instruments the same files as `vite`/`npm run dev`. Design Lab does not currently ship a "stripped" production variant of its own bundle; the instrumented bundle _is_ the only bundle, because the review surfaces (Playground, Wireframe) are a permanent part of the product, not a build-time-only debug aid. If a future deployment mode wants a lighter bundle without inspection wrapping, that must become a new Decision — it is out of scope of this document.

### 1.3 What the Babel plugin actually rewrites (`inspectionBabelPlugin`)

Parsing uses `@babel/core` with `parserOpts: { sourceType: 'module', plugins: ['typescript', 'jsx', 'importAttributes'] }`. The visitor keeps per-file state:

- `Program.enter` collects every non-type `ImportDeclaration` into `state.imports` (`{ local, statement }`, keyed by the local binding name, value is the _original source text_ of the whole import statement) and builds `state.componentBindings: Map<localJsxIdentifier, contract>` by resolving each specifier:
  - if the import source matches a known `componentImport` and the imported symbol matches a contract name → bind by package;
  - else if the import source starts with `.` (relative) → resolve it against the real filesystem (`existingScript`, trying the literal path, then `.ts/.tsx/.js/.jsx`, then `index.*`) and look it up in `byEntry`.
  - `import type { X }` specifiers are skipped entirely (both here and in `referencedImports`), matching the "type-only imports are not a runtime dependency" contract used across the whole scanner layer.
- `JSXElement.exit` (bottom-up, so children are visited/wrapped before parents) — for every element whose _opening tag identifier_ has a bound contract:
  - for each JSX attribute whose name is a known slot name **and** whose value is a `JSXExpressionContainer` with a real expression (not `{}` empty) — the attribute's expression is replaced with `<__DLInspectionBoundary descriptor={ kind: 'slot', name, code, sourceId, file, line }>{original-expression}</__DLInspectionBoundary>`. `code` is the _exact original source text_ of that expression (`options.source.slice(start, end)`), prefixed with whichever import statements are referenced by identifier name inside that fragment (`sourceCode`/`referencedImports` — a crude but effective identifier-name regex match, not a real reference resolver);
  - the whole matched JSX element itself is wrapped the same way with `kind: 'component'`, `name: contract.name`, and `code` set to the full original JSX source of that element (including its now-slot-wrapped attributes' _original_ text, since fragment extraction happens before mutation is visible in source slicing — the wrapping only changes the AST, not `options.source`).
  - `path.node.extra.designLabWrapped = true` prevents the same physical JSX node from being wrapped twice if the visitor somehow revisits it.
- `JSXOpeningElement`/`JSXClosingElement` — for every **lower-case** tag name (a real DOM host, e.g. `div`, `button`, `input`, not a Component) the tag identifier is rewritten to `__DLInspectionHost` and an `as="<original-tag>"` plus `source={{ sourceId, file, line }}` attribute is injected. This runs independently of the component-wrapping visitor above, so a raw `<button>` inside a wrapped `<Button>` composition still gets its own host registration. Before injecting `source`, `assetHandoffCode` scans that same host's own attributes for `src`/`poster`/`href` set to a `JSXExpressionContainer`; when the expression's text matches a local import binding (`referencedImports`, the identical heuristic slots use), the resolved import statement plus a `<attr>={<expr>}` usage line is added as `source.asset`. This is what lets an author hover a bare `<img src={heroImage} />` — never declared as a manifest slot — and still see the exact package import behind it, the same way a manifest-declared icon slot already does. A literal string URL or an untracked expression produces no `asset` field at all, rather than a misleading empty one.
- `Program.exit` prepends `import { InspectionBoundary as __DLInspectionBoundary, InspectionHost as __DLInspectionHost } from '@design-lab/system/inspection'` only if `state.changed` — files with no Components and no lower-case JSX (rare, but possible for a pure-logic `.tsx` module) are returned as `null` by `transform`, meaning Vite keeps the original code as-is.

### 1.4 Known edge cases and current behavior (not yet product-contracted)

These are implementation facts, not documented guarantees. Anyone changing the transform should be aware of them:

- **Conditional rendering** (`{cond && <Button/>}`), **`.map()`-produced lists**, and **fragments** (`<>...</>`) are handled correctly _as long as the JSX element itself is a static `<Button>` node somewhere in the AST_ — Babel visits every `JSXElement` regardless of the expression it lives inside. What is **not** resolved is a Component reached only through a **variable holding a JSX value** (`const el = <Button/>; return el`) assigned outside the visited JSXElement/JSXOpeningElement shape, or a Component rendered via `createElement(Button, ...)` calls instead of JSX syntax.
- **`forwardRef`/`memo`/HOC-wrapped Components** are transparent to this transform: it only reasons about the _imported binding name_ at the JSX callsite, not the exported value's runtime type. A Component exported as `export default memo(Button)` is bound exactly the same way as a plain function component, because the plugin never inspects the Component module's own exports — only the _consumer's_ import statement and JSX usage.
- **Barrel re-exports**: `byEntry` is keyed by the _resolved_ absolute path of the relative import specifier. If a Wireframe imports from a local barrel (`./index.ts`) that re-exports a Component, the resolution stops at the barrel file itself (`existingScript` resolves `./index.ts`), and unless that exact path is a `component.json` `entry` (it normally is not, since `entry` points at the implementation file, not a barrel), the binding silently fails and the element is left uninstrumented — no diagnostic is raised. Package-level imports (`byImport`) do not have this problem because they match on the declared `componentImport` specifier, independent of any intermediate barrel file.
- **Identifier shadowing**: `state.componentBindings` is a flat per-file `Map<string, contract>` keyed by local binding name. Two different imported symbols that happen to share a local name in different scopes of the same file (e.g. re-imported under an alias inside a nested function) are not distinguished — the last `ImportDeclaration` processed in file order wins for that name across the whole file. This matches the same simplification used by the sibling `parseComponentSourceImports` scanner in `moduleEntities.mjs` (also file-level, not scope-level).
- **`referencedImports` is a textual heuristic**, not a symbol-reference resolver: it re-includes an import statement in a slot's copyable `code` fragment whenever the import's local name appears as a `\b<name>\b` substring anywhere in the slot's source text — including inside string literals or comments. This can occasionally over-include an unrelated import that happens to share a short identifier name with unrelated text in the fragment; it will never under-include a genuinely used import.
- **Slot attributes must be a non-empty `JSXExpressionContainer`.** A slot passed as a plain string literal (`leading="text"`) or as JSX children (rather than a named prop) is not slot-instrumented; only `<Component slotName={<Expr/>}>` is recognized. This matches D-039's explicit rule that "plain text children" is not automatically a slot.

## 2. Runtime registry (`libraries/design-lab-system/inspection/index.ts`)

The Babel output only produces two exported primitives that the Inspector consumes at runtime, both pure React, no DOM writes at author time:

- `InspectionBoundary` pushes one descriptor onto a React `Context` stack (`InspectionContext`), so nested boundaries accumulate an ordered list of `{ kind: 'component' | 'slot', name, code, sourceId, file, line }` from outermost to innermost.
- `InspectionHost` is a `forwardRef` that renders the real DOM tag (`as`) and, on every ref-callback invocation (mount, unmount, and any React reconciliation that hands back a new/`null` element), updates a module-level `Map<Element, InspectionMetadata>` (`inspectionRegistry`) keyed by the _actual mounted DOM node_. It also resets `InspectionContext` to `[]` for its children, so descriptors do not leak past a raw DOM boundary into further-nested unrelated hosts. Void elements (`img`, `input`, `br`, …) skip the context reset entirely since they cannot have children. Its `source` prop carries an optional `asset` string (the import-plus-usage handoff described in §1.3) alongside `sourceId`/`file`/`line`; `WorkbenchInspector.inspectElement` prefers a component/slot descriptor, then this `source.asset`, and only falls back to the SCSS lookup below when neither exists.
- `inspectionMetadataFor(element)` and `inspectionEntriesWithin(surface)` are the only two read APIs; `WorkbenchInspector` calls these on hover/click, never inspecting React internals (Fiber, `__reactProps$`, etc.) — this was an explicit constraint from D-039.

Because `inspectionRegistry` is a plain in-memory `Map`, it is **process/session scoped and not serializable**: it only exists for the lifetime of the current mounted React tree. There is no persistence, no SSR consideration (Design Lab's own app is client-rendered), and no cleanup beyond the ref-callback's own `delete` on unmount — a leak here would only matter for extremely long-lived sessions with heavy remount churn, which is not currently guarded by a test. Self-inspection reuses this same map and registers only real Library Component roots already backed by Library hosts; it does not add a DOM observer, polling loop, second registry, or raw-host wrappers to application views. While Inspector is closed, Hard Mode performs no DOM scan and applies no diagnostic attributes.

## 3. Style discovery — PostCSS/SCSS analyzer

Unlike Component/slot discovery, raw-element style handoff is **not** part of the Babel transform. It is a separate, on-demand HTTP-backed analyzer (`getAuthoredStyles`, exposed as `GET /api/sources/:id/inspection/styles?file=<entryRelativePath>`, see `11-server-api.md`):

1. `importedStyleFiles(entryPath)` parses the given TSX/JSX entry with `@babel/parser` (same plugin set as above) and collects every `import '...css'` / `import '...scss'` statement's resolved path — it does not care whether the module default-imports, side-effect-imports, or aliases the stylesheet, only that its `source.value` extension is `.css`/`.scss`.
2. For each resolved style file, `parseAuthoredStyles` parses it with `postcss` + `postcss-scss` (so `$variables`, `@use`/`@forward`/`@import`, `@include`, nesting, and `&` are preserved, not stripped as they would be by a plain CSS parser) and:
   - collects the file-level "prelude" — every `@use`/`@forward`/`@import` at-rule at the root — once per file;
   - walks every rule (`root.walkRules`), flattens nested selectors including `&` interpolation (`flattenedSelectors`/`combineSelectors`) so a nested `&__action` becomes the fully-qualified `.card__action`, and skips rules whose _own_ body (declarations/leaf at-rules/non-empty comments, not nested child rules) is empty;
   - reconstructs `authoredRuleCode` by re-wrapping the rule's own declarations back inside every ancestor selector/`@media`/`@supports` it was nested in, so the returned fragment is valid, self-contained, copy-pasteable authored SCSS — not a synthetic reconstruction from computed styles.
3. The result associates a `sourceId`/`sourceFile` pair with a flat `styles[]` list of `{ file, rules: [{ selectors, conditions, code, line }] }`.

`isInside(path, root)` guards every resolved path (both the requested entry and every discovered stylesheet) against escaping the owning source's directory — see the security section below.

The Inspector matches a raw DOM host's `source` descriptor (`sourceId`, `file`, `line` from `__DLInspectionHost`) against this response by selector match, not by exact line — a host's line number is informational context for the author, not a lookup key into the style response.

### 3.1 Why two separate mechanisms instead of one

The Babel transform mutates JSX at compile time because Component/slot identity must be resolved _before_ the browser ever sees the code — it is fundamentally a static-import-graph problem. Style authorship is answered from the _source SCSS text itself_, on demand, because:

- SCSS is not JSX and has its own nesting/selector semantics that a JSX-oriented Babel visitor cannot reason about;
- computed/CSSOM styles (what the browser resolves at runtime) are explicitly rejected as a data source by D-044 — the goal is the _authored_ rule text with variables and mixins intact, which only a source-level SCSS parser can produce;
- doing this on-demand (HTTP request per inspected element) instead of at build time avoids instrumenting every SCSS file up front for a capability only used while the Inspector is actively open.

## 4. Test coverage

- `design-lab/scripts/inspectionTransform.test.mjs` builds a throwaway workspace with a real `library.json` + `component.json` + Wireframe TSX and asserts the transform wraps a Component call and a manifest slot, preserves the Component's icon import in the slot's `code`, and never introduces `data-dl-*` attributes. It also asserts a bare `<img src={sideImage} />` host (never declared as a manifest slot) resolves the same import handoff via `source.asset`, and that a literal string `src` produces no `asset` field at all.
- The same transform suite builds a throwaway `design-lab/src/App.tsx` and asserts the application
  shell is returned untouched now that self-inspection is disabled.
- `design-lab/server/services/authoredStyles.test.mjs` asserts that `@use`, `@include`, and nested `&__action` selectors survive round-tripping through `parseAuthoredStyles`.
- `design-lab/server/services/componentRelations.test.mjs` covers the sibling static-import scanner (`parseComponentSourceImports`/`getModuleEntities`) used for the `uses`/`usedBy`/`examplesUse`/`usedInExamplesBy` relation graph — a related but distinct analyzer from the inspection transform, sharing only the `@babel/parser` dependency and the "ignore `import type`" rule. It specifically asserts: type-only imports produce no relation edge, a parse failure in one file becomes a scoped `source-parse-error` diagnostic rather than throwing, and preview-imports-production-Component is reported as a `preview-imports-component` diagnostic rather than being silently added to any relation graph.
- There is currently no automated test for the edge cases listed in §1.4 (identifier shadowing, barrel re-exports, `createElement`-based rendering, HOC-wrapped exports, or watcher-less contract invalidation). They are documented here as known behavior, not as a regression-tested contract.

## 5. Security boundary

Both analyzers are read-only and local-only (bound to `127.0.0.1:4173`, see `11-server-api.md`), but each independently guards path containment:

- `authoredStyles.mjs`'s `isInside(path, root)` rejects (via `INSPECTION_SOURCE_INVALID`, HTTP 400) any resolved entry or stylesheet path that is not inside the requesting source's own directory — this prevents a crafted `file` query parameter from reading arbitrary files on disk through relative-path traversal (`../../../etc/passwd`-style requests).
- `assetFiles.mjs`'s `assertSafeAssetPath` applies the same class of guard to `/assets` and `/asset-previews`.
- `projectTree.mjs`'s `assertInsideProject` applies it to the generic filesystem tree endpoint.

These are **three independent implementations of the same containment check**, not a shared helper — this is the exact gap already tracked as "Apply one explicit path-containment helper to every read/write route and scanner" in `IMPLEMENTATION-CHECKLIST.md` (Phase 0.3 / Gap audit P0). Any new inspection-adjacent endpoint should reuse that future shared helper rather than adding a fourth ad hoc copy.

The icon-preview renderer (`renderTsxIcon`/`sanitizeSvg` in `assetFiles.mjs`) is a related but separate concern: it never executes a `.tsx` icon as React, only regex-extracts and sanitizes its `<svg>` literal, rejecting `<script>`, event handler attributes, `href`/`xlinkHref`, and any remaining `{}` dynamic JSX expression before serving it as `image/svg+xml`.

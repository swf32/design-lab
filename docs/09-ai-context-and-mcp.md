# AI context gateway, search, MCP and CLI

## Outcome

Design Lab exposes one filesystem-backed context engine through two adapters:

```text
canonical Project / Library files
              ↓
      context gateway
        ↙           ↘
 local MCP        CLI script
   stdio       no MCP required
```

MCP and CLI never maintain separate component registries. Both call the same scanners, ranking code, entity resolver, and generated-index writer. Canonical files remain the source of truth; `.designlab/index/` is disposable output.

## Why this is better for agents

The gateway changes context collection from open-ended repository exploration into bounded retrieval:

- the agent searches intent across normalized Components, Tokens, Assets, Fonts, Wireframes, Pages, and Markdown knowledge instead of guessing a filename or component name;
- the compact search response contains only descriptions, stable refs, relevance, and matched fields;
- `get` returns one verified entity with its canonical import, public contract, documentation, discovered files, and direct production/example relations;
- the agent does not need to read unrelated previews, stories, changelogs, styles, generated files, or neighboring components just to learn whether a reusable primitive already exists;
- every adapter receives the same answer because MCP and CLI call the same gateway rather than maintaining separate indexes;
- source-relative refs and explicit relation kinds reduce hallucinated imports and prevent example-only usage from being mistaken for a production dependency.

On the current default Library, the complete `components/` source tree is about 295 KB across 184 files. A five-result CLI search is about 1.7 KB, and a complete verified `get` for Input is about 8 KB. Bytes are not an exact token count and a careful agent would not necessarily read the whole tree, but this shows the intended order of magnitude: retrieve a small candidate set and one contract instead of placing a large repository slice into model context.

This does not make `rg` obsolete. Exact symbol lookup, debugging, implementation review, and code editing still require source inspection. MCP/CLI are most valuable before that stage: choosing the correct existing entity and obtaining its contract without broad exploratory reads.

## Agent workflow

The required reuse workflow is:

1. List available sources when the active Project or Library is unknown.
2. Search by intent before creating UI or a design-system entity.
3. Compare result descriptions and relevance scores. Search intentionally does not reveal entity names.
4. Resolve the selected stable `ref`.
5. Read the verified name, import, props, variants, states, documentation, changelog, and relative source paths.
6. Create something new only when no existing entity satisfies the intent.

The hidden-name search stage prevents an agent from searching only for a guessed component name and concluding that no reusable pattern exists. It does not treat names as secret: `get` reveals them after the semantic choice.

## Stable identity

Every context entity has:

- `ref` — stable external identity in the form `<source-id>:<kind>:<entity-id>`;
- `index` — short catalog position for interactive use;
- `kind`, `source`, `path`, `description`, `status`, and tags;
- `details` — type-specific verified data.

Agents should persist and exchange `ref`, not the numeric index. An index is only stable for the same source, kind scope, and catalog revision.

## Search data

For Components, the preferred authored semantic fields in `component.json` are:

```json
{
  "description": "Select one value from a small mutually exclusive set.",
  "aliases": ["segmented control", "toggle switch", "mode selector"],
  "useWhen": ["switch between themes", "select one mutually exclusive option"],
  "avoidWhen": ["navigate between pages"]
}
```

All fields are optional for discovery. If `description` is absent, the gateway derives the first useful paragraph from the adjacent README. Props, variants, states, category, aliases, and use-cases become retrieval signals. Wireframes and Pages support the identical optional `aliases`/`useWhen`/`avoidWhen` fields on `wireframe.json`/`page.json`, so a finished composition (e.g. "split auth layout", "marketing landing page") is discoverable by intent the same way a Component is, instead of only being reachable through a Component's `usedBy` relations pointing at the Workbench.

The current deterministic fallback uses weighted lexical matching, typo-tolerant token similarity, phrase bonuses, and stop-word removal. It returns an explicit relevance score and reports the matched fields. This is not presented as an embedding model.

The next retrieval layer is a pluggable multilingual embedding provider plus lexical fallback and reranking. Embeddings remain a derived cache under `.designlab/embeddings/`.

## MCP

The local server uses stdio and is read-only. It exposes:

- `designlab_sources`;
- `designlab_search`;
- `designlab_get` — accepts one `ref`/`index`, or a `refs[]` array to resolve several entities in a single call (unresolved refs come back as individual errors, not a failed call);
- `designlab_browse` — walks canonical Component, Token, Asset, Wireframe, or Page groups one filesystem path segment at a time (e.g. every Token category, then everything under `color`, then everything under `color.accent`) by reusing the same navigation tree the Directory Panel renders. This is a second discovery path alongside `search`, for when an agent needs to see what exists at a path instead of guessing an id from a hidden-name ranked list.
- `designlab_capture_component` — first returns every token-discovered source mode and executable
  Story id for a Component, then renders either the isolated `260×150` catalog preview or one
  `600×180` Story Canvas Stage as an opaque DPR-2 PNG. Arbitrary source modes remain independent
  from the dark/light Design Lab interface surface. The tool returns exact geometry, overflow,
  console diagnostics, bytes, and a content hash next to the image. `info` derives a recommended
  interface theme for every source mode from its actual canvas/surface token luminance; rendering
  against the opposite interface surface remains allowed for contrast testing but produces an
  explicit warning.

The Settings page generates an installation-specific config containing the actual Node.js executable and absolute MCP server path. This avoids relying on an MCP client's working directory.

Start the server directly:

```sh
npm run mcp
```

## CLI fallback

The same operations are available without MCP:

```sh
npm run designlab -- sources
npm run designlab -- search "text entry with validation" --source design-lab-system --kind component
npm run designlab -- get design-lab-system:component:input
npm run designlab -- get design-lab-system:component:input design-lab-system:component:button
npm run designlab -- browse --source design-lab-system --kind token --path color.accent --depth 2
npm run designlab -- capture design-lab-system:component:button
npm run designlab -- capture design-lab-system:component:button --capture story --story sizes --source-mode light --interface-theme dark
npm run designlab -- index --source design-lab-system
```

Component capture uses the Playwright Chromium runtime. A fresh environment that does not yet have
the browser binary installs it once with `npm run capture:install-browser --workspace=design-lab`.
The renderer starts a private local API/Vite pair only when the normal Design Lab development
runtime is not already available, and shuts down only the processes it started.

`catalog` returns compact descriptions and refs. `get` returns the complete entity, or `{ entities, errors }` when given more than one ref. A `get` miss reports up to three fuzzy-matched existing refs of the same kind (`Did you mean: ...`) instead of a bare not-found. `browse` returns folders and leaf refs under one path without reading the full flat catalog. `index` atomically rebuilds `.designlab/index/context.v1.json`; deleting that file loses no user data.

`search` and `get` currently rescan canonical files on each request, so they always see the latest saved source without waiting for an index rebuild. The written `.designlab/index/context.v1.json` is presently a disposable snapshot/export, not the hot read path for search. Scoped watcher invalidation and cache-backed reads remain a performance improvement, not a correctness requirement.

## Security boundary

- The first MCP version has no create, update, delete, shell, or arbitrary file-read tool.
- Sources come only from the canonical Project and Library registry.
- Returned paths are source-relative.
- Existing scanners remain responsible for safe asset handling.
- Future write tools require a separate confirmation and diff-review contract.

## Current limitations

- Filesystem changes are rescanned on request; incremental watcher invalidation is not implemented yet.
- Embedding-based multilingual semantic retrieval is not implemented yet.
- Direct production `uses` / `usedBy` and example-only `examplesUse` / `usedInExamplesBy` are included for Components. Wireframes and Pages report a one-directional `compositionUses` (Components they import) derived the same way, but do not yet appear on the Component side as an inverse `usedInPages`/`usedInWireframes` relation. Transitive impact plus token, font, and asset usage are not indexed yet.
- Rules, Decisions, Prompts, and Docs are searchable when their canonical source directories exist, but their dedicated UI modules are not implemented.
- Remote HTTP MCP, authentication, hosted sources, and write tools are deliberately outside this slice.

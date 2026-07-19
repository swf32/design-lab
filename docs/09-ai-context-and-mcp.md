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

All fields are optional for discovery. If `description` is absent, the gateway derives the first useful paragraph from the adjacent README. Props, variants, states, category, aliases, and use-cases become retrieval signals.

The current deterministic fallback uses weighted lexical matching, typo-tolerant token similarity, phrase bonuses, and stop-word removal. It returns an explicit relevance score and reports the matched fields. This is not presented as an embedding model.

The next retrieval layer is a pluggable multilingual embedding provider plus lexical fallback and reranking. Embeddings remain a derived cache under `.designlab/embeddings/`.

## MCP

The local server uses stdio and is read-only. It exposes:

- `designlab_sources`;
- `designlab_search`;
- `designlab_get`.

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
npm run designlab -- index --source design-lab-system
```

`catalog` returns compact descriptions and refs. `get` returns the complete entity. `index` atomically rebuilds `.designlab/index/context.v1.json`; deleting that file loses no user data.

## Security boundary

- The first MCP version has no create, update, delete, shell, or arbitrary file-read tool.
- Sources come only from the canonical Project and Library registry.
- Returned paths are source-relative.
- Existing scanners remain responsible for safe asset handling.
- Future write tools require a separate confirmation and diff-review contract.

## Current limitations

- Filesystem changes are rescanned on request; incremental watcher invalidation is not implemented yet.
- Embedding-based multilingual semantic retrieval is not implemented yet.
- Relations such as `dependsOn`, `usedBy`, `tokensUsed`, and `assetsUsed` are not indexed yet.
- Rules, Decisions, Prompts, and Docs are searchable when their canonical source directories exist, but their dedicated UI modules are not implemented.
- Remote HTTP MCP, authentication, hosted sources, and write tools are deliberately outside this slice.

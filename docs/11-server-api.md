# Local HTTP API reference

The Design Lab server (`design-lab/server/index.mjs`) is a single dependency-free `node:http` server, not an Express/Fastify app. It listens on loopback only (not `0.0.0.0`); the private API port is configured by `DESIGN_LAB_API_PORT` and defaults to `4173`. Vite proxies `/api` to that port and publishes the Design Lab UI on the independent `DESIGN_LAB_PORT` (default `5317`). Neither setting changes the product application's dev-server port. There is no authentication: the security boundary is "loopback-only, local machine, single user," the same boundary already documented for MCP in `09-ai-context-and-mcp.md`.

This reference exists because no other document lists the actual routes, status codes, and error shapes. It must stay in sync with `server/index.mjs`; if a route is added, removed, or its shape changes, update this file in the same change per `AGENTS.md`.

## Conventions

- All bodies are `application/json; charset=utf-8` unless noted otherwise.
- Every path segment is `decodeURIComponent`-ed individually; asset/module path segments containing `/` are split, decoded per-segment, and rejoined, so an encoded `%2F` inside one logical path element is treated as a real separator, not literal text.
- Errors always have the shape `{ "error": { "code": string, "message": string } }`. HTTP 500 always reports the generic message `"Unexpected local server error"` regardless of the underlying error, and logs the real error server-side (`sendError` in `server/lib/http.mjs`) — clients must not rely on 500 message text.
- Unmatched routes return `404 { error: { code: "NOT_FOUND" } }`; a matched path with an unsupported method returns `405 { error: { code: "METHOD_NOT_ALLOWED" } }` — but only for methods outside `GET`/`POST`; the check happens after all route matching, not per-route, so a `PUT` to `/api/projects` yields `405`, while `PUT` to an unknown path yields `404` (method check runs before the final 404 fallthrough).
- `POST` bodies are capped at 64 KB (`readJson` in `server/lib/http.mjs`); an oversized body throws `413` before JSON parsing is attempted. Invalid JSON throws `400`.

## Endpoints

### `GET /api/health`

Liveness probe. Returns `{ "status": "ok", "runtime": "node", "revision": <number> }`. `revision` is an in-memory counter incremented on every successful `POST /api/projects` in the current process — it is not persisted and resets on server restart; it is not a substitute for the filesystem watcher described as a P0 gap in `IMPLEMENTATION-CHECKLIST.md`.

### `GET /api/projects`

Returns `{ "projects": Project[], "workspacePath": string }`. The embedded Project is rebuilt from
`design-lab/designlab.config.json` on every listing and de-duplicated against the derived registry,
so deleting registry state does not disconnect the source. `Project.available` is computed per
request by an `fs.access` check against `path`; other registered Projects whose directories were
deleted still appear with `available: false` rather than disappearing silently.

### `GET /api/sources`

Returns `{ "sources": (Library | Project)[], "workspacePath": string }`. Sources are Libraries (discovered by scanning `libraries/*/library.json`) concatenated before Projects (from the registry) — this ordering is implicit, not declared in the response, so a consumer must not assume alphabetical or creation order.

### `POST /api/projects`

Body: `{ "name": string }` (2–80 characters after trimming). Creates a new Project at `projects/<slugified-name>/` (see `projectRegistry.mjs` `slugify` — Unicode-normalized, non-letter/digit runs become `-`, lower-cased; empty result falls back to `design-system`). Scaffolds `components/`, `tokens/`, `palette/`, `fonts/`, `assets/{icons,images,videos}/`, `docs/`, plus `project.json`, `tokens/base.tokens.json`, `fonts/fonts.json`, and `docs/README.md`. Returns `201 { "project": Project }`.

Errors: `400 INVALID_PROJECT_NAME`, `409 PROJECT_DIRECTORY_EXISTS` (a same-slug directory already exists on disk — this is a directory collision, not a registry-id collision, so two visually different names that slugify identically will collide).

### `GET /api/onboarding/scan`

Query: `?mode=attach|managed&name=<optional-name>`. Builds the same setup plan used by the CLI for
the configured workspace root. This route is read-only: it scans package manifests, lockfiles,
framework evidence and candidate Component/Token/Asset/Font/Page/Wireframe roots, then returns the
proposed versioned config and an explicit `changes` receipt. `moveFiles` and `deleteFiles` are empty.

Errors: `400 SETUP_MODE_INVALID`, `400 SETUP_NAME_INVALID`, `404 SETUP_ROOT_NOT_FOUND`.

### `POST /api/onboarding/apply`

Body: `{ "name": string, "mode": "attach" | "managed", "confirmed": true }`. Rebuilds the plan
server-side, writes the integration folder and bounded `AGENTS.md` pointer, then registers the
attached/managed source. The UI's final `Connect project` action sends the explicit confirmation;
a prior scan alone never grants it. Returns `201` with the applied result and registered `project`.

Errors: `409 SETUP_CONFIRMATION_REQUIRED` when `confirmed` is absent/false,
`409 SETUP_DIRECTORY_OCCUPIED` when a non-Design-Lab `design-lab/` folder already contains files,
plus the scan validation errors above.

### `GET /api/projects/:projectId/tree` and `GET /api/sources/:sourceId/tree`

Two routes, identical handler (`getProjectTree`). Query: `?module=<moduleId>` (defaults to `home`). Tokens additionally accept `&view=tokens|files`: `tokens` returns the logical token hierarchy, while `files` returns typed filesystem folder → token document → token group → token navigation. Both are derived from the same normalized catalog and neither contains a registered taxonomy. For `wireframes`, `pages`, `components`, `tokens`, and `assets`, the handler delegates to semantic navigation (`getModuleNavigation`, folders + typed entities, not raw implementation files). Module roots resolve through source mounts; the response includes legacy `rootPath` plus `rootPaths` for multi-root sources. Other known module ids fall back to a raw recursive scan with the same mount resolver where applicable. Unknown module ids return `400 UNKNOWN_MODULE`.

### `GET /api/sources/:sourceId/modules/:moduleId`

The main entity endpoint. Returns the shape documented per-module in `05-entities-and-file-contracts.md` and produced by `getModuleEntities` (`server/services/moduleEntities.mjs`):

| `moduleId` | Result shape |
|---|---|
| `components` | `{ kind: "components", folders, modes, themeVariables, families, components: Component[] }` — each Component carries normalized `implementation` (`platform`, `technology`, `adapter`, `locator`, `contract`, `capabilities`), optional explicit `familyId`, `import`, `files[]`, and `relations` (`uses`/`usedBy`/`examplesUse`/`usedInExamplesBy`/`diagnostics`). Strong framework evidence can discover a Component without `component.json`. |
| `wireframes` | `{ kind: "wireframes", folders, modes, themeVariables, wireframes: Wireframe[] }` — each Wireframe carries the full manifest plus `diagnostics[]` and `files[]` |
| `tokens` | `{ kind: "tokens", files, modes, tokens: Token[] }` |
| `palette` | `{ kind: "palette", modes, colors: Token[] }` (derived by filtering `tokens` to `type === "color"`, not a separate palette store) |
| `fonts` | `{ kind: "fonts", modes, typography: Token[], families }` (missing `fonts.json` returns an empty-but-valid shape, not an error) |
| anything else | `{ kind: moduleId, entities: [] }` — a deliberate placeholder for not-yet-implemented modules (e.g. `pages`), not a 404 |

Every module scan is **stateless and rescans the filesystem on every request** — there is no server-side cache for this endpoint. A broken/unparseable `component.json`, `wireframe.json`, or `page.json` is localized to that entity as `manifest-parse-error`; neighboring entities remain available.

All filesystem-backed module shapes use the same mount identity rule. One configured root exposes
paths relative to that root. Multiple roots of the same kind expose source-relative paths including
their mount (`packages/vue/src/Card.vue`) so routes and entity ids remain unambiguous. Mount config
accepts relative paths only and rejects escaping/ambiguous paths with `SOURCE_*` errors.

### `GET /api/sources/:sourceId/components/:componentId/handoff`

Returns the exact discovered implementation source as `{ componentId, familyId, platform,
technology, path, language, source, provenance, warnings }`. `:componentId` may contain `/`. The
route is read-only, resolves only Components that advertise the `handoff` capability, and confines
the source path to one configured Component mount. Native handoff includes an
explicit warning that source discovery is not proof of a successful platform build/render.

Errors: `404 COMPONENT_NOT_FOUND`, `409 COMPONENT_HANDOFF_UNAVAILABLE`,
`409 COMPONENT_SOURCE_UNAVAILABLE`, `400 COMPONENT_SOURCE_OUTSIDE_SOURCE`, or
`404 COMPONENT_SOURCE_NOT_FOUND`.

### `GET /api/sources/:sourceId/inspection/styles?file=<entryRelativePath>`

Returns the authored-SCSS handoff described in `10-inspection-architecture.md`: `{ sourceId, sourceFile, styles: [{ file, rules: [{ selectors, conditions, code, line }] }] }`. `file` is required and must be relative to the source root and resolve inside it — `400 INSPECTION_FILE_REQUIRED` if missing, `400 INSPECTION_SOURCE_INVALID` if it (or any of its imported stylesheets) resolves outside the source directory. `404 SOURCE_NOT_FOUND` if `sourceId` does not exist.

### `GET /api/sources/:sourceId/assets/:assetPath` and `GET /api/sources/:sourceId/asset-previews/:assetPath`

Both stream a binary body (`sendBuffer`, not JSON) with `Cache-Control: no-store`. `:assetPath` may contain `/`.

- `assets/...` serves the raw file with a strict allow-list content type (`avif/gif/jpeg/jpg/png/svg/webp` only — video files and `.tsx` icons have **no** raw-serving content type and return `415 ASSET_PREVIEW_UNSUPPORTED` from this route, even though they are valid discovered assets in the `components`/`assets` module payload).
- `asset-previews/...` is the *rendered* preview path used by `AssetCard`: `.tsx` icons go through `renderTsxIcon` (regex-extract the `<svg>` literal, then `sanitizeSvg`), `.svg` files go through `sanitizeSvg` directly, everything else with a known image content type is passed through unchanged. Both routes resolve through configured Asset mounts and return `400 ASSET_PATH_OUTSIDE_SOURCE` for an escaping or ambiguous path, and `404 ASSET_NOT_FOUND` for a missing file.
- SVG/TSX sanitization rejects (`422`) content without exactly one `<svg>...</svg>` root (`ICON_SVG_ROOT_REQUIRED`), content containing `<script>`, `<foreignObject>`, `<iframe>`, `<object>`, `<embed>`, `<use>`, any `on*=` handler, or any `href`/`xlinkHref` (`ICON_PREVIEW_UNSAFE`), and any remaining dynamic `{}` JSX expression after the TSX-specific static prop rewriting pass (`ICON_PREVIEW_DYNAMIC_JSX`).

### `GET /api/entities?projectId=<id>&module=<moduleId>`

A thin legacy-shaped wrapper: `{ revision, entities: <same tree as getProjectTree(...).tree> }`. Despite the generic name, this returns the **raw directory tree**, not the normalized per-module entity list from `/modules/:moduleId` — `IMPLEMENTATION-CHECKLIST.md` explicitly tracks this as unfinished ("`/api/entities` возвращает первичное файловое представление, но ещё не нормализованные сущности"). New integrations should prefer `/api/sources/:id/modules/:moduleId`, not this route. `400 PROJECT_REQUIRED` if `projectId` is omitted.

### `GET /api/integrations/mcp`

Static-ish info payload for the Settings page: the absolute Node executable path, absolute MCP server script path, a ready-to-paste `mcpServers` config block, and CLI usage examples (`getIntegrationInfo`, `server/services/integrationInfo.mjs`). Does not touch the filesystem beyond resolving `import.meta.url`; always returns `200`.

## What is intentionally not here

- **MCP** (`designlab_sources`/`designlab_search`/`designlab_get` over stdio) and the **CLI** (`npm run designlab -- ...`) are separate adapters over the same `contextGateway`, not HTTP routes — see `09-ai-context-and-mcp.md`.
- Mutations currently include project/setup creation and the narrow Page/Wireframe manifest PATCH
  routes implemented in `server/index.mjs`. General Token/Component CRUD and deletion are not
  implemented yet.
- There is no filesystem watcher or push channel (SSE/WebSocket); every read endpoint is pull/rescan-on-request. This is the same gap tracked in `IMPLEMENTATION-CHECKLIST.md` §0.4.

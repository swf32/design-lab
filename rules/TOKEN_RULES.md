# Design Lab token rules

This file is the shared source of truth for creating or changing design tokens in a Project or Library.

## Canonical source

Tokens live in canonical `tokens/**/*.tokens.json` files. The filesystem and token documents are the source of truth; generated CSS, search indexes, resolved mode maps, and palette views are derived and rebuildable.

The recommended Design Lab-native leaf contains `type` and `value`. The read-only compatibility
layer also accepts DTCG-style `$type` / `$value` leaves, including inherited group `$type` and
`$root`. A document may use a top-level `tokens` wrapper or an unwrapped token tree. Do not mix leaf
dialects in one document unless preserving an existing source requires it; Design Lab reads the
supported leaves but reports a warning.

A token's dotted path is derived from JSON nesting and is its semantic identity. Do not duplicate
the path, category, resolved values, or usages in a second registry. Exact `{token.path}` references
may cross documents inside the same source. Broken, ambiguous, circular, duplicate-path, orphaned
mode, and reference-type diagnostics remain scoped to their documents/tokens and must not hide the
rest of the module. Reading never rewrites a source dialect; format conversion requires a separate
explicit migration with a reviewed diff.

Token identity, storage, and JSON dialect are separate discovered facts. `color.accent.primary` may
be stored in `semantic/core.tokens.json` without the filename becoming part of the token name.
Directory Panel must expose this honestly through separate Tokens and Files views as specified in
`docs/14-token-architecture.md`; it must never render filesystem folders, token documents, and JSON
groups as one indistinguishable kind of folder. Folder and layer names are author-owned data, never
hardcoded taxonomy.

## Semantic metadata for agents

Every semantic or component token in the default `design-lab-system` Library must have a concise
English `description` that explains its role rather than restating its value. A self-explanatory
primitive may omit a description when the prose would only repeat its exact path and literal value.
User Libraries may omit descriptions or author them in their working language.

Leaf tokens may also define:

- `aliases` — common names an author or agent may search for;
- `useWhen` — concrete interface intentions the token satisfies;
- `avoidWhen` — visually plausible but semantically wrong uses;
- `tags` — stable domain vocabulary not already present in the token path or type.

These fields improve MCP and CLI retrieval but are not required for basic filesystem discovery. Never create a separate token-search registry.

## Modes and themes

Author semantic metadata on the base token. Theme and mode overrides replace values only and inherit the base identity, description, aliases, and usage guidance. Do not duplicate descriptions inside each mode unless a future schema explicitly supports mode-specific semantics.

All semantic roles must resolve in every supported mode. Components consume semantic token roles, not mode-specific literals.

## Color, typography, and palette

Colors are tokens. Describe the semantic job of a color such as surface, readable text, selection, success, warning, or danger; do not describe only its hue or HEX value. Status colors must not be used decoratively without the corresponding meaning.

Typography values such as family, size, line height, weight, and letter spacing are tokens. Font-family files and availability live in `fonts/`, while typography tokens express how the interface uses those families.

Palette is a visual and semantic view over color tokens. It may group and explain them, but it must never duplicate their color values as a second source of truth.

## CSS identity

A leaf token's dotted path also names its generated CSS custom property: `corner.surface` becomes `--corner-surface`, by replacing every `.` with `-`. `build-tokens.mjs` applies this rule when generating `tokens/generated/tokens.css`, and MCP/CLI `get` derive the identical `cssVar`/`cssUsage` (`var(--corner-surface)`) from the same path so the two can never drift apart. Do not author a separate CSS variable name field; the dotted path is the only identity a token needs.

## Verification

After changing tokens:

1. regenerate token outputs;
2. verify every supported mode resolves;
3. check affected Components in dark and light modes;
4. search the changed intent through MCP or CLI and confirm the correct token ranks without exposing a separate metadata registry.

# Token architecture

Design Lab separates three facts that are often accidentally mixed together:

1. **Token name** — the name used by code and references, for example `color.accent.primary`.
2. **Storage** — the document that contains the token, for example
   `tokens/semantic/core.tokens.json`.
3. **Dialect** — how the JSON leaf is written, for example `value/type` or `$value/$type`.

These facts come from the same discovered source files. They are not copied into a second registry
and are never maintained by hand in application code.

## Supported source layouts

Every source stays inside the canonical `tokens/**` boundary. Inside it, all of these layouts are
valid:

### One document

```text
tokens/
└── system.tokens.json
```

### Several documents

```text
tokens/
├── color.tokens.json
├── space.tokens.json
└── typography.tokens.json
```

### Nested folders or authored layers

```text
tokens/
├── foundation/
│   ├── color.tokens.json
│   └── space.tokens.json
├── semantic/
│   └── roles.tokens.json
└── product/
    └── controls.tokens.json
```

Folder names are completely author-owned. Design Lab does not recognize or require names such as
`primitives`, `semantic`, `components`, `foundation`, `alias`, or `product`. It discovers whatever
directories and documents exist.

### Supported JSON dialects

The current adapters read:

- Design Lab-native `value` / `type` leaves;
- DTCG-style `$value` / `$type` leaves;
- wrapped documents with a top-level `tokens` object;
- unwrapped token trees;
- inherited DTCG group `$type` and `$root`;
- Design Lab theme overrides and cross-document exact references.

An unknown dialect is not guessed. Its document remains visible with a scoped diagnostic until a
matching adapter is added. This is how the system stays extensible without pretending that every
arbitrary JSON object has the same meaning.

## Token name does not silently depend on a filename

By default, JSON nesting defines the token name. Moving `color.accent.primary` from
`core.tokens.json` to `brand.tokens.json` therefore does not silently rename the token or break its
references. An adapter for a format with collection- or namespace-scoped identities may provide
that scope explicitly; Design Lab must not infer it from familiar folder names.

The normalized entity keeps both values:

```text
name:    color.accent.primary
stored:  semantic/core.tokens.json
```

This is not duplicated authored information. Both fields are derived from one source document:
the first from JSON nesting, the second from the filesystem.

## Two honest navigation views

The Tokens module provides two projections over the same normalized catalog.

### Tokens

Shows only the logical token hierarchy:

```text
color
└── accent
    └── primary
```

The left tree and the Token column use the same identity: `color.accent.primary`. File splitting is
irrelevant in this view.

### Files

Shows storage without pretending every level is a folder:

```text
semantic/                    folder
└── core.tokens.json         token document
    └── color                token group
        └── accent           token group
            └── primary      token
```

Rows keep distinct kinds and icons for folder, token document, token group, and token. The table
shows both the canonical token name and `Stored in`, so the user never has to guess which path is
being displayed.

Neither view owns another index. Both are generated on request from the same normalized catalog.

If a format allows one logical path to contain both its own value and child tokens, the value is
shown as a `$root` leaf under that logical group. If two documents declare the same logical path,
the Tokens projection keeps both declarations visible under a conflict group identified by their
source documents; it never drops one declaration or invents a winner.

## Creation contract

The future Create Token flow must remain simple:

1. choose or enter the token name;
2. choose type and value;
3. optionally choose a target document when storage placement matters;
4. preview the exact JSON diff;
5. write through the adapter that owns the selected document.

When opened from Files, the selected document is the default target. When opened from Tokens or
All, the source's write adapter proposes a target instead of hardcoding a repository-wide filename.
Design Lab must preserve the selected document's dialect and must never rewrite unrelated token
documents during creation.

Writing is unavailable until the source dialect has a write adapter. Read compatibility does not
silently imply safe write compatibility.

## Invariants

- `tokens/**` is the only discovery boundary.
- No layer, folder, document, group, or token name is registered in application code.
- Filesystem folders are storage; JSON groups define logical nesting unless an adapter explicitly
  defines another identity rule.
- UI, API, MCP, CLI, generated outputs, validation, and future writes use one normalized catalog.
- Search metadata remains adjacent to token leaves and is optional for discovery.
- Moving or splitting documents must not rename logical tokens unless the source format explicitly
  defines document- or collection-scoped identities.
- Unknown or invalid documents remain visible with diagnostics and never hide valid documents.

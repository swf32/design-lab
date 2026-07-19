# Design Lab token rules

This file is the shared source of truth for creating or changing design tokens in a Project or Library.

## Canonical source

Tokens live in canonical `tokens/**/*.tokens.json` files. The filesystem and token documents are the source of truth; generated CSS, search indexes, resolved mode maps, and palette views are derived and rebuildable.

A leaf token must contain `type` and `value`. Its dotted path is derived from JSON nesting and is its semantic identity. Do not duplicate the path, category, resolved values, or usages in a second registry.

## Semantic metadata for agents

Every token in the default `design-lab-system` Library must have a concise English `description` that explains its role rather than restating its value. User Libraries may author descriptions in their working language.

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

## Verification

After changing tokens:

1. regenerate token outputs;
2. verify every supported mode resolves;
3. check affected Components in dark and light modes;
4. search the changed intent through MCP or CLI and confirm the correct token ranks without exposing a separate metadata registry.

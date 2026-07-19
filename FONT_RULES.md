# Design Lab font rules

This file is the shared source of truth for creating or changing font families and their semantic context.

## Canonical ownership

Font files and family registration live under `fonts/`; `fonts/fonts.json` is the canonical registry for discovered families, sources, styles, fallback stacks, and optional licensing information. Typography tokens define how registered families are used by the interface.

Do not duplicate font-family values in Palette, Component manifests, or an AI-only registry.

## Semantic metadata for agents

Each default-library font family must define:

- `description` — the family’s role, tone, and supported interface context;
- `aliases` — common typographic names;
- `useWhen` — intended content and interface roles;
- `avoidWhen` — roles that require a different family or typographic treatment;
- `tags` — classification such as sans-serif, serif, monospace, editorial, interface, or display.

These fields are optional for basic discovery in user Libraries but are first-class retrieval signals for MCP and CLI. Descriptions may use the Library’s working language.

Font search returns the registered family and styles. Typography-token search returns semantic family, size, weight, and line-height roles. Agents should use both: the Font answers “which family exists,” while Tokens answer “how this design system uses it.”

## Verification

After changing fonts:

1. validate `fonts.json`;
2. verify registered styles and fallback order;
3. verify typography tokens still resolve;
4. inspect representative text in supported modes;
5. search intended typography roles through MCP or CLI.

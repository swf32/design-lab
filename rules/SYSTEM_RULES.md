# Design Lab interface System rules

This file is the authoring contract for complete Design Lab interface Systems. It is written for
designers collaborating with coding agents as well as for developers. A generated System carries
this file and all entity rules in its own `rules/` directory.

## What a System is

A System is a complete executable replacement for Design Lab's own interface Library. It may
change Component anatomy, composition, layout, navigation presentation, visual tokens, icons,
fonts, Pages, and Wireframes while preserving the application-facing contract.

Application behavior remains in Design Lab. A System must not fork route data loading, filesystem
services, project state, search, installation logic, or server APIs into presentation Components.
If a requested change needs new product behavior, implement that behavior in Design Lab first and
then expose the smallest necessary System contract.

## Mandatory package boundary

- `design-lab-pack.json` owns System identity, compatibility, and entrypoints.
- `library.json` must use the same id and the canonical imports
  `@design-lab/system/components` and `@design-lab/system/icons`.
- Every entrypoint and named export required by the selected Design Lab
  `interface-system-contract.json` must exist and typecheck against the real application.
- Do not remove, rename, or change a required public prop only because the current visual direction
  does not use it. Render a coherent alternative while preserving the callable contract.
- Generated barrels and token CSS are derived files. Change canonical Components, assets, and token
  JSON, then run their generators; do not maintain parallel registries.

## One active installation slot

Design Lab executes one System from `libraries/design-lab-system/`. Published Systems live in
their own repositories; they are never authored as sibling Libraries inside the same Design Lab
workspace. The installer validates and caches packages, snapshots the current slot, and then
physically installs the selected package into that canonical path.

Keep the package id in `design-lab-pack.json` and `library.json`; the slot folder name deliberately
does not change with the selected package. Inactive Systems must not participate in discovery or
load their Component styles. Before updating a Design Lab source checkout with Git, restore the
default System so tracked default source is not mixed with an installed alternative.

The validator proves compatibility, not security. A System contains executable code and must be
reviewed with the same care as any source dependency.

## Entity rules

Read the matching local rule before changing an entity:

- `rules/COMPONENT_RULES.md` for Components and their styles, previews, Stories, and changelogs;
- `rules/TOKEN_RULES.md` for canonical tokens and modes;
- `rules/ASSET_RULES.md` for images, video, SVG, and code-native icons;
- `rules/FONT_RULES.md` for font files and font metadata;
- `rules/WIREFRAME_RULES.md` for Wireframes;
- `rules/PAGE_RULES.md` for finalized Pages.

When a change crosses kinds, apply every relevant rule. Do not edit a copied rule to excuse a
breaking implementation.

## Designer-first workflow

1. Document the intended direction in `README.md`: visual principles, navigation behavior,
   density, typography, and what intentionally differs from the default System.
2. Start with tokens. Change Component structure only when tokens cannot express the direction.
3. Review the real existing Component, its `component.json`, styles, preview, Stories, consumers,
   and changelog before changing it.
4. Keep behavior props and accessibility semantics intact. A visual redesign must still support
   keyboard use, focus, loading, disabled, error, empty, overflow, and compact states.
5. Add or update focused Stories and illustrative previews when a Component's behavior or
   recognizable anatomy changes.
6. Run validation after each contract-level change:

   ```bash
   npm run designlab -- system validate <path-to-system>
   ```

7. Install locally, restart Design Lab, and review every module in dark and light modes. Verify
   long content, narrow viewports, dialogs, navigation, Canvas modes, and browser console output.
8. Add deterministic screenshots, append changelogs, and update semantic versions before release.

## Adding new Components and features

A System may add any number of internal or public Components without breaking older Design Lab
versions. Do not add them to the application contract unless Design Lab itself imports them.

When new Design Lab functionality needs a new required System export, update application code and
the machine-readable contract together. Existing Systems then remain valid only if they already
provide that export or release a compatible update. Ordinary new Pages or features built entirely
from the existing contract must not invalidate older Systems.

Prefer additive props and exports. Breaking removal or prop changes require a new compatibility
boundary and migration notes. Never hide a missing required feature behind an application-owned
visual fallback: recovery is selecting or reinstalling the default System.

## Release checks

- `system validate` passes the static export check and real application typecheck.
- Components and tokens pass their generators, formatting, tests, and production build.
- Required exports have representative coverage in the running Design Lab.
- Dark/light, keyboard, reduced motion, 200% zoom, narrow viewport, overflow, and long-content
  checks pass.
- `README.md`, screenshots, affected entity changelogs, package version, and compatibility range
  describe the actual release.

Use patch versions for compatible fixes, minor versions for additive Components or visual
capabilities, and major versions for contract-breaking releases.

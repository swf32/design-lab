# Design Lab Skin rules

This file is the authoring contract for visual Design Lab Skins. It is written for designers and
for coding agents working on their behalf. A generated Skin copies this file into its own `rules/`
directory so the package remains understandable outside the Design Lab repository.

## What a Skin is

A Skin is a CSS layer loaded after the active Design Lab System tokens. It changes the visual
language without replacing application behavior or Component code. Use a Skin for:

- dark and light color palettes;
- application, navigation, Directory Panel, and workspace surfaces;
- sidebar, navigation-region, Directory Panel, and workspace dimensions;
- typography, density, spacing, radii, borders, shadows, and motion;
- relative font and image assets referenced by CSS.

Use a complete System instead when the idea needs different JSX/HTML structure, reordered slots,
new interactive behavior, a different Component API, or selectors that depend on private DOM
structure. A publishable Skin must not reach into application source or copy Components.

## Files designers normally edit

- `theme.css` is the visual source of truth. Its commented sections list the supported public
  variables and the part of Design Lab each variable affects.
- `design-lab-pack.json` owns the package name, id, version, compatibility, license, repository,
  screenshots, and CSS entrypoint. Do not rename or remove its required fields.
- `README.md` explains the visual direction and installation. Replace the generated intent prompt
  with the theme's actual principles.
- `screenshots/` contains representative captures for publication. Do not place runtime assets
  there; keep CSS assets in a separate `assets/` folder.

Do not edit `AGENTS.md` or this rule merely to make an agent accept an otherwise invalid theme.

## Safe CSS contract

Author shared overrides in `:root`, dark overrides in `[data-theme='dark']`, and light overrides in
`[data-theme='light']`. `@font-face`, `@media`, `@supports`, and relative asset URLs are allowed.

Only custom properties documented by the generated `theme.css` are public Skin API. Class names,
element nesting, generated attributes, hashed assets, and application routes are private. A Skin
that targets selectors such as `.dl-*`, `main > aside`, or React-generated markup may work today
but is a local mod, not a portable community Skin.

Keep the two interface themes complete. If an override is inherently mode-specific, define both
dark and light values. Shared geometry may stay in `:root`.

## Geometry guardrails

Visual layout tokens are allowed, but they must preserve usable relationships:

- `--shell-navigation-width` must fit the active sidebar plus
  `--shell-directory-panel-min`;
- `--shell-navigation-min` must not exceed the normal navigation width;
- `--shell-workspace-min` must leave a usable workspace at supported desktop widths;
- compact drawer width must leave `--shell-navigation-mobile-gap` visible;
- controls must preserve a minimum 44px interaction target even if the visible silhouette is
  smaller;
- text and controls must not clip at 200% browser zoom or with long labels.

Changing global `--space-*` primitives changes the entire interface density. Prefer semantic
layout and shell variables first; override primitives only for an intentional, fully reviewed
density direction.

## Accessibility and identity

- Keep readable text contrast and visible keyboard focus in both modes.
- Do not communicate success, warning, danger, selection, or disabled state through color alone.
- Inspection Component purple, slot pink, asset teal, and developer orange must remain visually
  distinguishable even when recolored.
- Do not remove focus outlines, hide scrollbars that users need, or disable reduced-motion
  behavior.
- Motion must respect `prefers-reduced-motion` and must not change layout unexpectedly.

## Designer workflow

1. Write one short visual intent in `README.md`: mood, contrast, density, typography, and the parts
   of Design Lab that should feel different.
2. Change the smallest relevant group in `theme.css`, starting with surfaces and readable text.
3. Validate the package from the Design Lab workspace:

   ```bash
   npm run designlab -- theme validate <path-to-skin>
   ```

4. Install it locally and restart Design Lab:

   ```bash
   npm run designlab -- theme install <path-to-skin>
   ```

5. Review Components, Wireframes, Pages, Tokens, Assets, and Fonts in dark and light modes. Check
   narrow desktop, compact/mobile navigation, dialogs, long directory names, empty states, hover,
   focus, disabled, danger, and loading states.
6. Add representative screenshots, update the manifest version, and re-run validation before
   publishing.

`theme reset` returns to the active System without deleting the installed Skin. A failed Skin may
make Design Lab visually unusable; reset is the recovery path, not a hidden fallback stylesheet.

## Versioning

- Patch: visual correction that preserves the intended API and screenshots.
- Minor: new visual direction or additional supported variables without breaking existing use.
- Major: compatibility boundary or a redesign that invalidates documented expectations.

Do not widen the Design Lab compatibility range merely to silence validation. Test the newest
claimed version first.

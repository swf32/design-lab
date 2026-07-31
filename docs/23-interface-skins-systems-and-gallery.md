# Interface Skins, Systems, and community gallery

## Product boundary

Design Lab supports two intentionally different interface pack kinds:

- **Skin** changes the visual language of the active System through a CSS layer loaded after the
  System tokens. It is appropriate for color, typography, surfaces, spacing, borders, radii,
  shadows, motion, font faces, and asset-backed CSS. It does not replace Component code.
- **System** is a complete executable replacement for Design Lab's own interface Library. It must
  provide every entrypoint and named export declared by
  `design-lab/interface-system-contract.json`, plus a discoverable `library.json`.

A small local edit does not become a curated theme automatically. Authors may keep a fork local or
publish it as an unverified community pack, but gallery curation is reserved for coherent visual
directions with representative screenshots, an explicit license, compatibility, and a passing
validator. Patch layering is deliberately not a v1 package kind: file precedence and upstream merge
conflicts would make upgrades less predictable than either a Skin or a complete System.

## Designer-first authoring contract

`theme create` and `system create` produce self-contained authoring packages rather than bare
runtime manifests. Every scaffold contains `AGENTS.md`, a beginner-oriented `README.md`, local rule
copies, and a `screenshots/` guide. A Skin additionally contains a sectioned `theme.css` template
that names the real public variables for application/navigation/workspace surfaces, shell geometry,
typography, density, corners, controls, motion, dark/light colors, status, Workbench, and inspection.

The canonical source rules are `rules/SKIN_RULES.md` and `rules/SYSTEM_RULES.md`. A generated Skin
carries the Skin rule. A generated System carries the System rule plus the Component, Token, Asset,
Font, Wireframe, and Page contracts required to change its copied Library safely outside this
monorepo. Package-local `AGENTS.md` tells coding agents which files are safe to edit and when a
visual request has crossed from Skin into executable System territory.

A portable Skin uses documented custom properties through `:root`, `[data-theme='dark']`, and
`[data-theme='light']`; private `.dl-*` selectors and DOM nesting are local mods rather than public
Skin API. Geometry tokens are supported, but navigation/sidebar/directory/workspace minimums,
44px interaction targets, long labels, zoom, contrast, focus, and reduced motion remain release
requirements.

## Pack manifest

Every pack has `design-lab-pack.json` at its root:

```json
{
  "schemaVersion": 1,
  "id": "soft-glass",
  "name": "Soft Glass",
  "version": "1.0.0",
  "kind": "skin",
  "description": "Soft translucent surfaces for Design Lab.",
  "designLab": ">=0.1.0 <0.2.0",
  "license": "MIT",
  "repository": "https://github.com/example/soft-glass",
  "screenshots": ["screenshots/components.png"],
  "entrypoints": { "style": "theme.css" }
}
```

System manifests use the same identity, version, compatibility, license, repository, and screenshot
fields, with these entrypoints:

```json
{
  "entrypoints": {
    "components": "components/index.ts",
    "icons": "assets/icons/index.ts",
    "i18n": "i18n/index.ts",
    "inspection": "inspection/index.ts",
    "playground": "playground/index.ts",
    "pages": "pages/index.ts",
    "wireframes": "wireframes/index.ts",
    "tokens": "tokens/generated/tokens.css",
    "assets": "assets"
  }
}
```

All paths are relative and must exist inside the package. Symbolic links are rejected anywhere in
an installable pack, so an entrypoint or a transitive source cannot escape the package root. A
System's `library.json` id matches the pack id and publishes canonical consumer imports
`@design-lab/system/components` and `@design-lab/system/icons`. The validator statically follows
entrypoint exports, rejects a System missing any application contract symbol, and typechecks the
actual Design Lab application against the candidate entrypoints before install/use succeeds.

## Author and consumer workflow

```bash
# Create packages that validate immediately.
npm run designlab -- theme create ../soft-glass --name "Soft Glass"
npm run designlab -- system create ../editorial-lab --name "Editorial Lab"

# Validate before publishing.
npm run designlab -- theme validate ../soft-glass
npm run designlab -- system validate ../editorial-lab

# Install from a folder, GitHub repository/tag, npm package, or tarball.
npm run designlab -- theme install ../soft-glass
npm run designlab -- system install github:author/editorial-lab#v1.0.0

# Inspect and switch installed packages.
npm run designlab -- theme list
npm run designlab -- system list
npm run designlab -- theme use soft-glass --version 1.0.0
npm run designlab -- system use editorial-lab
npm run designlab -- system doctor

# Recover without a hidden runtime fallback.
npm run designlab -- theme reset
npm run designlab -- system reset
```

Install activates by default; `--no-use` only downloads and validates. Activation is persisted in
`design-lab/.designlab/interface.json`. Skins are stored by id/version under
`design-lab/.designlab/interface-packs/skins/`; System packages are cached by id/version under
`design-lab/.designlab/interface-packs/systems/` and the selected package is physically installed
into the one executable slot `libraries/design-lab-system/`. Inactive Systems are not Libraries,
do not appear in the entity catalog, and cannot leak their Component styles into the active shell.
Changing the active System requires restarting dev/build.

Installation is transactional. A source is copied or downloaded into a staging directory,
validated there, and only then renamed into its managed cache destination. Before activation the
current physical slot is snapshotted; an invalid update never replaces it. Reset restores the
saved default package while retaining downloaded packs.

System authors keep each visual direction in a separate Git repository. When Design Lab adds a
required interface export, `system validate` reports the missing contract before installation.
When the default System adds optional Components, a theme author may merge the default repository
upstream or copy the new Component directories, then restyle them inside the theme repository. A
future `system diff` command will summarize missing, added, and changed Components without making
that merge automatic.

The installer does not execute npm lifecycle scripts or automatically install a System's arbitrary
dependencies. A community System should use the existing React peer/runtime or document additional
dependency setup. Full Systems contain executable TSX/JavaScript and therefore require the same
trust judgment as installing source code; successful validation proves compatibility, not safety.

## Community distribution and gallery

Each author owns the pack source in a separate Git repository or release package. A future central
`design-lab-gallery` repository stores only reviewed metadata, immutable package coordinates,
checksums, generated screenshots, compatibility results, and status — not a mirrored copy of every
author's source.

Recommended gallery statuses:

- `community`: author-submitted and installable, without a Design Lab quality endorsement;
- `validated`: manifest, paths, exports, compatibility, and build checks pass;
- `curated`: a coherent complete visual direction has additionally passed manual visual review;
- `incompatible`: the published compatibility range excludes the selected Design Lab version.

Gallery screenshots should be generated from deterministic Component catalog and shell capture
routes in both interface themes. Publication, signatures/checksums, automated remote build workers,
and a visual gallery UI remain a separate delivery phase; the v1 filesystem/package contract does
not depend on that service existing.

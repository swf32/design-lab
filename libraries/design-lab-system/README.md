# Design Lab System

This is the default complete interface System used by Design Lab. Its Components, tokens,
assets, and fonts are the source used both by the application and by its own Catalog and
Workbench. The current appearance is the original default; this folder is also the starting
point for authors who want to build a different System.

## Authoring

Read `AGENTS.md` and the matching rules in `rules/` before editing an entity. A System may
change Component structure and composition, add SVG or image assets, and replace tokens and
fonts while keeping the public application contract. A Skin is only a CSS/token layer; it
cannot express arbitrary Component anatomy.

In this development checkout the active source is `libraries/design-lab-system/`. After
installing Design Lab into another project it is the project-owned `design-lab/system/` folder.
The installed tool carries an initial default template for setup and explicit recovery; it
does not overwrite edits in the active folder during a package upgrade.

Run `npm run designlab -- system validate <path-to-system>` to check a candidate System. Use
`npm run designlab -- system doctor` after manually replacing the active folder, and
`npm run designlab -- system reset` for explicit recovery. Installing a complete System needs
a restart because its executable source can change.

Document a new System's visual and navigation choices in its own README. Keep representative
dark and light captures in `screenshots/` when publishing it.

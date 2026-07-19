# Design Lab collaboration rules

For every component creation or modification, read and follow `COMPONENT_RULES.md`. It is the shared component contract for Codex, Claude, humans, and other agents.

## Product questions

- Ask the user a focused question when the answer materially affects product architecture, filesystem contracts, entity semantics, UX behavior, data ownership, or an expensive implementation direction.
- Explain what decision depends on the answer and give a concrete recommendation when possible.
- Do not block progress on minor, reversible, discoverable, or implementation-only details.
- After the user answers a material product question, record the conclusion in `docs/DECISIONS.md` and update the relevant product Markdown and `docs/IMPLEMENTATION-CHECKLIST.md`.
- Keep documentation consistent with implemented behavior. If implementation reveals that an earlier assumption is wrong, update the documentation in the same change.

## Core invariants

- The workspace root contains the `design-lab/` application and its sibling `projects/` and future `libraries/` stores.
- Project creation accepts only a name and always resolves storage to `projects/<slug>/`; the user does not choose a parent directory.
- The filesystem is the source of truth. Indexes and caches are derived and rebuildable.
- Design Lab owns a canonical filesystem contract. Existing design systems must be migrated into it; never ask users to configure arbitrary component, token, palette, or font directories.
- Tokens, palette metadata, fonts, and components support automatic discovery only inside their canonical project/library directories. Optional adjacent metadata improves semantics but is never required for basic discovery.
- The directory panel is module-specific: it shows entities and folders relevant to the active module in the selected project/library, not the Design Lab application repository.
- Palette is a visual and semantic layer over color tokens; it must not duplicate color values as a second source of truth.
- `libraries/design-lab-system/` is the single source of truth for Design Lab's own tokens, icons, fonts, and reusable UI components. The application consumes that same Library; never maintain a mirrored copy under application source.
- Do not add an immutable UI kernel or fallback design system. A broken customization may break Design Lab; recovery is reinstalling the default `design-lab-system` Library.
- `assets/` owns images, video, SVG, and code-native icons such as TSX; do not create a separate Icons module.
- A component is a directory with a `component.json` manifest and adjacent implementation, types, preview, stories/states, README, and changelog files. Component categories and nesting are arbitrary folders above component directories.
- Component and token navigation must be semantic. The directory panel shows categories, groups, and entity nodes, not every implementation file.
- Component thumbnails and `*.preview.tsx` are illustrative, token-driven, non-interactive compositions. They must not import or render the real component.
- The workbench Canvas renders the real component and owns interactive props/state controls. Preview and playground are different contracts.
- Workbench examples are separate full-width stories grouped by one comparison axis or behavior. Do not collapse variants, sizes, loading, layout, and composition into a single card matrix.
- Component README content is rendered as Markdown. Interactive stories may demonstrate real state transitions when that behavior is essential to understanding the component.
- Repeated shell patterns such as module/workbench headers, canvas controls, source dropdowns, dialogs, trees, and sidebars belong in `design-lab-system`; avoid parallel one-off markup in application views.

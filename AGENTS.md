# Design Lab collaboration rules

For every component creation or modification, read and follow [`rules/COMPONENT_RULES.md`](rules/COMPONENT_RULES.md). It is the shared component contract for Codex, Claude, humans, and other agents.

For every Wireframe creation or modification, read and follow [`rules/WIREFRAME_RULES.md`](rules/WIREFRAME_RULES.md). It defines the canonical hybrid source contract, layout directions, states, controls, and user-flow graph.

For every Page creation or modification, read and follow [`rules/PAGE_RULES.md`](rules/PAGE_RULES.md). It defines the canonical hybrid source contract for finalized, production-composed screens, their states, provenance from Wireframes, and inter-Page navigation graph.

For every token, asset, or font creation or modification, read and follow [`rules/TOKEN_RULES.md`](rules/TOKEN_RULES.md), [`rules/ASSET_RULES.md`](rules/ASSET_RULES.md), or [`rules/FONT_RULES.md`](rules/FONT_RULES.md) respectively. When a change crosses entity kinds, apply every relevant contract.

## Product questions

- Ask the user a focused question when the answer materially affects product architecture, filesystem contracts, entity semantics, UX behavior, data ownership, or an expensive implementation direction.
- Explain what decision depends on the answer and give a concrete recommendation when possible.
- Present two to four concrete answer variants for every material product choice, including the
  recommended variant and its trade-off. Do not make the user infer the question from a prose
  recommendation.
- Do not block progress on minor, reversible, discoverable, or implementation-only details.
- After the user answers a material product question, record the conclusion in `docs/DECISIONS.md` and update the relevant product Markdown and `docs/IMPLEMENTATION-CHECKLIST.md`.
- Keep documentation consistent with implemented behavior. If implementation reveals that an earlier assumption is wrong, update the documentation in the same change.

## Core invariants

- In embedded mode the product repository is the workspace root and contains one `design-lab/` integration folder; the standalone development workspace may additionally contain sibling `projects/` and `libraries/` stores.
- Project onboarding accepts a name plus `Connect existing` or `Start clean`. Existing sources stay in place through relative mounts; canonical greenfield storage may still resolve to managed Design Lab roots without asking a designer for absolute paths.
- The filesystem is the source of truth. Indexes and caches are derived and rebuildable.
- Design Lab owns canonical authoring contracts but does not require an existing design system to migrate. Deterministic onboarding discovers relative Component, Wireframe, Page, Token, Asset, and Font mounts; designers are not asked to locate `node_modules` or enter absolute paths.
- Tokens, palette metadata, fonts, assets, Components, Wireframes, and Pages support automatic discovery inside configured source mounts. Optional adjacent metadata improves semantics but is never required when strong filesystem/framework evidence already establishes basic identity.
- The directory panel is module-specific: it shows entities and folders relevant to the active module in the selected project/library, not the Design Lab application repository.
- Palette is a visual and semantic layer over color tokens; it must not duplicate color values as a second source of truth.
- `libraries/design-lab-system/` is the single source of truth for Design Lab's own tokens, icons, fonts, and reusable UI components. The application consumes that same Library; never maintain a mirrored copy under application source.
- Do not add an immutable UI kernel or fallback design system. A broken customization may break Design Lab; recovery is reinstalling the default `design-lab-system` Library.
- Asset mounts own images, video, SVG, and code-native icons; do not create a separate Icons module. Ordinary media is framework-neutral, while code-native assets publish honest adapter capabilities (for example TSX icons are React code, not directly executable Vue/Svelte assets).
- A canonical Design Lab-authored Component may use a `component.json` directory contract with adjacent implementation, types, preview, stories/states, README, and changelog files. Strong ecosystem evidence may discover an existing implementation without that manifest; optional metadata improves semantics and resolves ambiguity rather than becoming a second registry. Component categories and nesting are arbitrary folders above implementations.
- A Wireframe is a directory with `wireframe.json`, an adjacent framework-specific renderer, README, and changelog. The current typed `*.wireframe.tsx` renderer is the React compatibility adapter, not the universal web format. Its manifest owns framework-neutral layout directions, state snapshots, typed controls, and the user-flow graph.
- A Page is a directory with `page.json`, an adjacent framework-specific renderer, README, and changelog. The current typed `*.page.tsx` renderer is the React compatibility adapter. Its manifest owns framework-neutral states, provenance, and the inter-Page navigation graph.
- Component and token navigation must be semantic. The directory panel shows categories, groups, and entity nodes, not every implementation file.
- Component thumbnails and previews are illustrative, token-driven, non-interactive compositions. The current `*.preview.tsx` shape belongs to the React adapter. An illustrative preview must not import or render the real component.
- The workbench Canvas renders the real component through its framework adapter and owns interactive props/state controls. Preview and playground are different contracts.
- Workbench examples are separate full-width stories grouped by one comparison axis or behavior. Do not collapse variants, sizes, loading, layout, and composition into a single card matrix.
- Component README content is rendered as Markdown. Interactive stories may demonstrate real state transitions when that behavior is essential to understanding the component.
- Repeated shell patterns such as module/workbench headers, canvas controls, source dropdowns, dialogs, trees, and sidebars belong in `design-lab-system`; avoid parallel one-off markup in application views.

# Design Lab component rules

This file is the shared source of truth for humans, Codex, Claude, and other coding agents. `AGENTS.md` and `CLAUDE.md` must point here instead of maintaining competing component instructions.

## Canonical component directory

Every component is a directory under `libraries/design-lab-system/components/<category-path>/<ComponentName>/`. Categories and nesting are semantic and may be changed by the library author. The default `design-lab-system` keeps Atomic Design as its top level (`atoms/`, `molecules/`, `organisms/`) and uses semantic subfolders such as `actions/`, `inputs/`, `navigation/`, `workbench/`, and `shell/`.

Every Component starts with:

- `component.json` — discovery manifest;
- `README.md` — usage documentation;
- `CHANGELOG.md` — append-only component history.

A `wireframe` Component may exist before production code when it also provides `ComponentName.playground.tsx`. A production-ready Component additionally requires:

- `ComponentName.tsx` — production implementation;
- `ComponentName.scss` — production styles imported by the implementation;
- `ComponentName.preview.tsx` — illustrative catalog preview;
- `ComponentName.stories.ts` or `.tsx` — story definitions and behavior examples.

Optional adjacent files include a typed `ComponentName.playground.tsx`, types, tests, accessibility fixtures, migration notes, and assets. Never require a hand-maintained global component or style registry: `component.json` and adjacent conventionally named artifacts are discovered recursively. Category is derived from the folders above the component and must not be duplicated in its manifest. The Library package barrel is a generated, deletable artifact rebuilt only from manifests that have a production entry.

## Lifecycle status

Use `wireframe`, `in-progress`, or `ready`:

- `wireframe` means the entity is an explorable component direction and may have only a manifest, Playground, README, and changelog;
- `in-progress` means production implementation exists but is not yet approved as the Library contract;
- `ready` means implementation, styles, preview, stories, docs, and changelog satisfy this contract.

An absent or unknown status must not hide the entity or break discovery. Design Lab shows a completeness diagnostic and omits the status badge until the author chooses a supported value. `not-ready` is not a supported status because it does not distinguish ideation from implementation work.

## Component Playground

`ComponentName.playground.tsx` is an optional, typed, automatically discovered ideation artifact. It is separate from Stories:

- Playground compares alternative directions and exposes reversible controls for discussion and approval;
- Stories document focused behavior of an existing production implementation;
- Preview is a non-interactive catalog identity specimen.

The Playground exports a definition created with `definePlayground` plus `renderPlaygroundVariant`. Its controls must use the shared typed registry (`string`, `boolean`, `enum`, `number`, `choice`, and `color`) so Design Lab can render them with production Input, Checkbox, Select, Slider, Radio Button, and Color Picker controls. Do not author a component-specific control sidebar in application code.

Playground variants have stable ids and names. Selected variant, design-system mode, and serializable control values are reflected in the route query so a copied URL restores the same review state. A Playground may render production Components, experimental compositions, or both. It does not require Stories and must not be counted as example usage.

The route is derived from the Component path: `/components/<component-path>/playground` and renders as a standalone fullscreen review mode outside the normal Design Lab application, directory, and workspace shell. Desktop keeps one persistent typed-controls rail at the left and gives every remaining pixel to the Canvas. Mobile opens directly on the unobstructed Canvas; a translucent bottom-start Settings action reveals the controls as a dismissible overlay rail. The overlay supports an explicit close action, scrim dismissal, and Escape, and all touch targets are at least `44px`. Canvas Background Control floats at the Canvas top-end instead of consuming a controls-rail section. Design-system modes come from the active Project or Library token files and remain independent of the Design Lab interface theme.

### Playground inspection

Playground provides one shared Inspector mode for developer handoff. Its bottom-end inspect action activates pointer hover on fine-pointer devices and tap selection on touch devices. Identity colors are stable semantic inspection roles rather than interface accents: Component roots use a purple dashed outline and named slots use a pink dashed outline. Ordinary elements use a neutral dashed outline. Color is reinforced by the explicit `component`, `slot`, or `element` label.

Production Components opt into stable detection by spreading `inspectionAttributes(ComponentName, publicProps)` from `@design-lab/system/inspection` onto their semantic root. Named composition slots spread `slotAttributes(slotName)`. Pass only public, serializable, non-sensitive presentational props; never serialize callbacks, credentials, application state, arbitrary spread props, or React internals. The helpers write the common `data-dl-component` / `data-dl-props` / `data-dl-slot` contract. Inspector must not depend on private React Fiber fields. Nested raw elements remain independently inspectable instead of inheriting the nearest ancestor Component identity.

Inspector output is a copyable code fragment, not a table of rendered geometry. Components produce JSX with the inspected public props, slots produce their marked-up HTML fragment, and ordinary elements produce the authored CSS declarations from matching same-origin rules. Preserve source expressions such as `width: 100%` and `var(--token)`; do not replace them with computed pixel dimensions or resolved RGB values. Clicking or keyboard-activating the code fragment copies the complete handoff source.

Reusable Playground shell patterns are production Components. `PlaygroundControlsRail` owns header, scrollable content, and footer slots; `InspectorCodePopover` owns inspection identity and copyable source presentation through `CodeBlock`. Application views compose these contracts and positioning behavior instead of recreating parallel sidebar or popover markup.

Floating palettes, menus, and similar controls inside Playground rails render in a viewport-aware overlay layer. They choose an available side, clamp to the visual viewport, remain usable at mobile touch sizes, and never expand the rail's scrollable content merely by opening.

## Automatic discovery, imports, and agent context

Creating a Component requires only its canonical directory, adjacent files, and `component.json`. Do not register it in an application switch, story map, Playground map, style index, component list, dependency table, MCP catalog, CLI catalog, or hand-maintained package barrel.

When present, the production entry must named-export the public Component symbol matching its filename, for example `Button.tsx` exports `Button`. The Library manifest supplies the package import root, and Design Lab derives `import { Button } from '@design-lab/system/components'` from that source metadata plus the adjacent entry. `components/index.ts` is generated recursively from production entries during dev, build, and test and may be deleted and rebuilt; never edit it by hand. Wireframe-only entities are discoverable but are not package exports.

Write only the imports that executable code genuinely needs. Those normal static TypeScript/TSX imports are the source of the direct `uses` / `usedBy` graph. Imports in the adjacent story module are the source of `examplesUse` / `usedInExamplesBy`. Never author reverse links, usage arrays, relation metadata, or a second dependency registry. Type-only imports are ignored, and importing a production Component from a preview is reported as a contract diagnostic.

MCP and CLI are adapters over the same filesystem scanners. A Component becomes searchable without separate indexing metadata. For useful intent retrieval, default-library Components should author a concise `description`; add `aliases`, `useWhen`, and `avoidWhen` when naming alone could lead an agent to the wrong primitive. These semantic fields improve ranking but are not required for basic filesystem discovery.

## Icons used by components

This rule applies when creating or changing a component, its preview, or its stories. Reuse an existing semantic icon from the active Library's canonical `assets/icons/` directory whenever one fits. If a new icon is required, add it there as a reusable code-native vector asset. The generated icon barrel discovers and exports it automatically; never edit that barrel by hand.

Do not embed new SVG path data directly in a component or preview, redraw a product icon with CSS, or substitute emoji and arbitrary Unicode glyphs for a missing icon asset. Decorative icon instances must be hidden from assistive technology; interactive icon-only controls must have an accessible name.

## Creating a component

1. Decide whether the pattern is a production Component or a wireframe direction and choose its filesystem category. In the default Library, choose the Atomic Design layer first and then a semantic subfolder.
2. Define the public props contract before styling. Prefer native element attributes and accessible semantics.
   Keep implementation, preview, and stories readable with `npm run format:code`; `npm run check:code` is the repository guard against compressed TS/TSX/MJS source.
3. Use Design Lab semantic tokens for color, typography, spacing, radii, motion, and themes. Do not add one-off visual constants when an existing token expresses the role.
   Production styles belong in the adjacent `ComponentName.scss`, and `ComponentName.tsx` imports that file directly. Do not add component selectors to a package-wide stylesheet.
   Keep SCSS and preview `String.raw` CSS formatted with `npm run format:styles`; `npm run check:styles` is the repository guard against compressed one-line style sources and duplicate selectors in the same cascade context.
4. Support both dark and light token modes. A component must not infer theme from hardcoded colors.
   Treat the Design Lab UI theme and the inspected design-system mode as separate state. Stories must respond to the selected design-system mode when their tokens have mode overrides.
5. Keep product copy outside the component or obtain it through the i18n provider. English is the default product locale; new interface messages require a stable message key and English fallback.
6. Build `*.preview.tsx` as a non-interactive token-based illustration. It must not import or render the production component and does not need production dimensions.
   Keep preview-only CSS in that preview module as a scoped `String.raw` stylesheet rendered by the preview. Do not put `.preview-*` selectors in production SCSS or a global preview stylesheet.
   Do not repeat the component name, category, manifest variants, or other metadata as a heading, badge, or legend inside the preview: the Component Card already owns that information. Text is appropriate only when it is intrinsic to the illustrated UI or necessary to make the component behavior recognizable.
   Follow the Preview quality contract below. A preview is not ready merely because it compiles or contains token-driven shapes.
   Preview motion is optional. It illustrates a recognizable state change but never turns the preview into a second interactive implementation.
   - Declare motion with optional `previewMotion` metadata in `component.json`; without it the catalog keeps the preview static.
   - The shared trigger is Component Card pointer hover and keyboard focus. Leaving or blurring the card restores the deterministic baseline.
   - Use `transition.preview` and `easing.preview` tokens. Do not introduce component-specific durations or easing curves without adding semantic tokens first.
   - Supported motion kinds are `state-transition`, `reveal`, `dismiss`, and `sequence`. A Tooltip may deliberately use `dismiss` when its static baseline must show the open surface clearly.
   - Never autoplay or loop indefinitely. Motion must not change card geometry, capture pointer events, execute production logic, or depend on timers and network state.
   - Gate motion with `prefers-reduced-motion: no-preference`. Reduced-motion users see the declared static baseline without a hover transition.
   The catalog must render the preview declared by the discovered component's `component.json`; it must not replace authored previews with a hand-maintained thumbnail switch. A generic fallback is allowed only when the declared preview is missing or cannot be loaded, and that fallback must be visibly distinguishable from an authored preview.
   Before marking a component ready, verify its authored preview in the actual catalog card, not only as a source file.
7. Build stories as separate full-width scenarios grouped by one axis or behavior: variants, sizes, layout, loading, states, composition, accessibility, and so on. Do not mix unrelated axes into one card matrix.
   The adjacent story module is the executable source of truth: export `stories` and `renderStoryExample(example, story)` from the manifest-declared `*.stories.ts(x)`. Design Lab discovers that module from the component directory and renders it automatically. Never add component ids, story JSX, or per-component story switches to an application view.
   When an axis such as size applies to multiple variants, cover the complete relevant `variant × axis` matrix in focused stories or explicitly document which combinations are unsupported. Never prove an API axis against only one visual variant and assume the rest.
   Give every story an explicit `kind`: `variant`, `state`, `behavior`, `context`, `integration`, or `accessibility`. A story name describes the scenario the user is evaluating; it must not call a composition a variant.
   - A `context` story places the subject component inside a representative parent so geometry, clipping, hover, focus, and responsive behavior can be evaluated where the component is actually used.
   - An `integration` story shows two or more production components whose shared contract is important, such as adjacent sidebars coordinating width. It must identify the subject component and the relationship under test.
   Context and integration stories still render the real subject component. Surrounding fixtures may be purpose-built, but must be visibly scoped to the story and must not become a second production implementation.
   Use plausible domain content whenever content affects layout or behavior. A sheet, modal, menu, tree, table, sidebar, or similar container must not be demonstrated only with empty boxes or uniformly short placeholder labels.
   - Include a representative-content scenario with realistic names, hierarchy, metadata, and item variety.
   - Add a separate content-stress context when density can reveal defects: enough items to force overflow, long and short labels, meaningful nesting, disabled or selected rows where relevant, and content near both the start and end of the scroll region.
   - The stress scenario must make scroll ownership observable. Verify fixed and scrolling regions, scrollbar styling, clipping, overlays, focus visibility, and whether opening nested content changes the correct container.
   Fixtures should be deterministic and product-like, but they do not need to duplicate production data or connect to a live backend.
8. Use the real production component in Workbench stories. Add interaction only when it explains real behavior. Wireframe-only Components may omit Stories until a production implementation exists.
   A component is not ready while its Workbench falls back to a generic placeholder or repeats the same specimen for manifest labels that the component does not actually implement.
9. Write `README.md` in clear English for the default library. Documentation content in user libraries may use any language chosen by their authors.
10. Start `CHANGELOG.md` with the initial version and creation date. Wireframe decisions belong here until a separate approved Decision is required.
11. Verify automatic discovery through the API and run the normal dev/build/test workflow, which regenerates and checks the derived public barrel; never add a component export by hand. The Workbench file inventory must expose implementation, styles, manifest, preview, stories, docs, and changelog refs that were actually discovered.
    The scanner derives the canonical package import plus direct production `uses` / `usedBy` and example-only `examplesUse` / `usedInExamplesBy` relationships from static TypeScript/TSX imports. Type-only imports do not create runtime relationships. A preview importing any production component is a contract diagnostic, not a usage relationship.
12. Run typecheck/build, inspect dark and light themes, inspect all Canvas modes, and check the browser console.

### Preview quality contract

A catalog preview is an identity specimen of the component itself. It is not a miniature product screen, a generic interpretation of the component name, or a place to enumerate every manifest variant.

#### 1. Establish ground truth before drawing

1. Read the production TSX, its styles and tokens, `component.json`, and at least one representative Workbench story or real application consumer.
2. Identify the component's actual visual anatomy: orientation, shape, icon asset, label relationship, spacing, borders, surfaces, and defining state treatment.
3. Write one sentence: “This preview is recognizable as `<Component>` because it shows `<defining property>`.” If the property came from the component name rather than the implementation, stop and inspect the real component again.
4. Choose one comparison axis at most: for example checked state, collapsed/expanded disclosure, or text/search/textarea field shape. Do not mix unrelated variants, sizes, states, and context in one thumbnail.

#### 2. Compose the smallest recognizable specimen

- Default to one clear specimen in one representative state. Add another specimen only when the component's primary contract cannot be understood from one state, such as collapsed versus expanded or unchecked versus checked.
- Make the component the largest and clearest object in the preview. Do not wrap it in a sidebar, dialog, card, toolbar, or other parent merely because that is where it is commonly used.
- Context is allowed only when the component cannot be recognized without it. Keep that context visually quiet and make the subject component unambiguous.
- Never invent controls, overflow dots, badges, edge indicators, copy, icons, or states that the real component does not own.
- Preserve the production visual grammar even when preview dimensions are scaled: orientation, icon, label placement, control silhouette, radius, border hierarchy, surface, opacity, and active/focus treatment must still come from the real component. Scaling is allowed; invented anatomy is not.
- Use intrinsic UI text only. Keep it legible at catalog density and remove any copy that does not help identify the component or the demonstrated state.
- Simple components should stay simple. Empty card space is preferable to decorative filler or a fake application composition.

#### 3. Build geometry from explicit guide lines

- Give the preview root a deliberate bounding box and center the composition optically in the Component Card unless off-center placement is itself characteristic of the component.
- The shared Component Card preview area owns a visible safe area: `spacing.4` inline and `spacing.3` block. Authored previews must fit inside it, use `max-width: 100%`, and include their own padding and border in full-width geometry with `box-sizing: border-box`.
- Do not cancel the shared safe area with negative margins or oversized `width: 100%` content. Edge-to-edge rendering is allowed only when touching or clipping the edge is the component's defining behavior; introduce an explicit shared modifier and document that reason instead of bypassing the inset locally.
- Define shared guide lines before styling repeated specimens: label tops or baselines, control tops, centers, and intended bottom edges.
- Elements that are presented as a row or column comparison must use the same alignment model. Do not center one group while stretching another group across the preview.
- In a multi-column form composition, corresponding first labels must share the same top line. If one tall control represents the combined height of stacked controls, its final bottom edge must match the final bottom edge of that stack.
- Center checkmarks, icons, carets, and other intrinsic affordances optically inside their containing shape. A mathematically valid `left` and `top` pair is not sufficient when the rendered mark looks displaced.
- Prefer grid tracks with explicit shared dimensions over unrelated margins or per-element offsets when two edges are meant to align.

#### 4. Verify the rendered card, not the source file

Before considering a preview complete:

1. Render it inside the real Component Card at catalog density in both dark and light themes.
2. Compare it with the real component in Workbench or an application consumer and remove any anatomy that the production component does not own.
3. Inspect a screenshot at the actual card size. For geometry claimed to be aligned, compare rendered bounding boxes or pixels; do not rely only on reading CSS.
4. Confirm intended shared lines differ by no more than one rendered pixel, unless an optical correction is deliberate and documented in the preview styles.
5. Check visible safe-area padding, optical centering, clipping, text legibility, card balance, hover/focus motion, reduced motion, and that motion does not change geometry.
6. Run typecheck/build and check the browser console.

Use these calibration examples:

- Checkbox: a small set of real boolean states is sufficient; the checkmark must be optically centered in its box.
- Input: related single-line fields may stack in one column while a textarea occupies the second column; first labels and final control bottoms must align.
- Sidebar Tab: show the tab's real collapsed and expanded silhouettes, not a miniature sidebar or invented navigation.
- Source Select and Semantic Tree Item: full-width preview specimens remain inside the shared card safe area; their own padding and borders must not consume or overflow that inset.

Fast review question: if the Component Card footer were hidden, would someone familiar with the Library recognize the component from the preview without mistaking the surrounding context for the subject? If not, simplify or rebuild the preview.

## `component.json`

The manifest always includes `id`, `name`, `status`, `variants`, `states`, `docs`, and `changelog`. A production Component also includes `entry`, `preview`, and `stories`; a wireframe-only Component instead requires the conventionally named typed Playground. Category is derived from the component directory and is never authored in the manifest. Describe public props when known, including type, required/default values, enum values, and slots. Paths are adjacent relative paths.

`description`, `aliases`, `useWhen`, and `avoidWhen` are optional semantic retrieval fields, not registration fields. Prefer an authored `description`; without one the agent context gateway falls back to the first useful README paragraph.

Animated previews may add:

```json
"previewMotion": {
  "trigger": "card-hover-focus",
  "kind": "state-transition",
  "durationToken": "transition.preview",
  "easingToken": "easing.preview",
  "reducedMotion": "static-baseline"
}
```

This metadata is capability declaration, not animation implementation. The authored `*.preview.tsx` and token-based styles define the baseline and target visuals.

## Changing a component

1. Preserve the public API unless the requested change explicitly allows a breaking change.
2. Update implementation, manifest props, variants, and states together.
3. Update or add the focused story that proves the changed behavior.
4. Update the illustrative preview only when recognition of the component changes; never turn it into a second implementation.
5. Update README usage guidance when semantics, accessibility, or API behavior changes.
6. Append a dated entry to `CHANGELOG.md`. Classify breaking changes, additions, fixes, accessibility changes, visual changes, and deprecations explicitly.
7. If tokens or locale messages change, update the canonical token source or message dictionary instead of hardcoding the component.
8. Verify affected consumers inside Design Lab because the application dogfoods this same Library without a fallback kernel.
9. Re-run build and focused interaction checks. Check both themes and the shared Canvas preference.
   For every changed visual variant, verify its complete supported size/state matrix in the real Workbench and at least one actual application consumer.

## Changelog format

```md
# Changelog

## 0.2.0 — YYYY-MM-DD

- Added: ...
- Changed: ...
- Fixed: ...
- Visual: ...
- Accessibility: ...
- Breaking: ...
```

Only include categories that apply. Never rewrite old released entries to hide a change.

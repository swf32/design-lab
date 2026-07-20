# MessageActions — changelog

## 2026-06-30 07:17 — stories polish (token-driven layout, role JSDoc)

- What: `MessageActions.stories.tsx` — replaced inline-style literal scaffolding
  (cap/col/cluster/cell consts, the dashed adaptive frame) with the new
  `__shared/story-layout` helpers (StoryStack/Row/Cell/Frame), and dropped the
  reserved-but-unrendered callbacks (onFeedbackUp/Down, onShare, onReadAloud) from
  `argTypes` — they're a forward-compat contract on the component, not playground
  controls. `MessageActions.tsx` — added JSDoc on the `role` prop clarifying it is
  the message-author role, NOT the ARIA `role` attribute (a11y-linter footgun).
- Why: catalog-hygiene pass alongside the Prose-page fix — token-only stories, no
  dead controls. No behaviour change.

## 2026-06-30 06:09 — promote beta → stable

- What: `status` flipped `beta` → `stable` in `components-registry.ts`. All
  applicable states are covered in SCSS + stories (role × variant × `busy`;
  hover/pressed/focus belong to the child `ToolButton`, reveal to the consumer —
  both NA for this molecule), and the 3-agent audit (tier/DS, behavior
  preservation, catalog/stories+a11y) came back all-pass.
- Why: Val sign-off ("в стейбл их давай").

## 2026-06-30 05:48 — move-reveal-to-consumer + stories-playground + reserve-api

- Files: `MessageActions.tsx`, `MessageActions.scss`, `MessageActions.stories.tsx`
  (+ consumer `apps/web/src/features/chat/components/message-bubble.scss`, registry summary).
- What: (1) Hover-reveal MOVED OUT of the molecule into the consumer
  (message-bubble): deleted the `@media(hover)` opacity block, the
  `.klyp-feature-chat-MessageBubble:hover &` tier-violating selector, the
  `@media(max-width:768px)` viewport query, and the per-role opacity overrides.
  The molecule is now always-visible by itself (keeps role alignment + `[data-busy]`
  dim + reduced-motion). Live chat behaviour is preserved byte-for-byte
  (assistant always-on, user hover-reveal on pointer, touch always-on, busy dim) —
  reveal CSS now lives on the parent row. (2) Removed the dead `&.klyp-Toolbar` /
  `.klyp-Toolbar__group` gap hacks — they guarded a phantom `@klyp/brand/Toolbar`
  (gap --space-16) that never existed; the only `.klyp-Toolbar` already gaps at
  --space-4, so they were no-ops. (3) Stories rewritten with `meta.args` +
  `meta.argTypes` (the catalog ComponentPlayground was empty) and visible
  role/variant/state matrices (Default/Roles/Variants/States/UserVsAssistant/
  Adaptive) — fixes blank catalog tiles caused by opacity:0-at-rest. (4) Reserved
  API: optional `onFeedbackUp` / `onFeedbackDown` / `onShare` / `onReadAloud`
  props added to the interface (contract only, not rendered yet).
- Why: Val — the catalog page looked broken (empty user-role tiles, no playground,
  near-identical states) and the visibility model was the wrong concern living in
  the molecule. Research (AI Elements / assistant-ui / prompt-kit / LibreChat /
  Open WebUI) showed all of them put reveal on the parent message, never inside
  the action bar — aligned ours to that.

## 2026-06-29 23:46 — unify-copy-glyph + drop-copy-link + import-glyph

- Files: `MessageActions.tsx`, `MessageActions.stories.tsx` (+ new
  `ImportDownOutline` in `@klyp/icons`, + `message-bubble.tsx` wiring)
- What: (1) "Insert in prompt" glyph `AddOutline` (plus) → new `ForwardFrameOutline`
  (iconsax "forward" into a frame, mirrored vertically). (2) Copy action now uses the **same**
  `CopyOutline` glyph for text / image / video — image copy was `GalleryExportOutline`,
  now `CopyOutline`; video copy was the link glyph, now `CopyOutline`. (3) The
  standalone **"Copy URL" / Copy-Link** action (`LinkOutline`) is removed. Video
  keeps a single Copy that copies its URL (no byte-copy possible) under the unified
  glyph; images keep only the byte-copy. Added an `AsAssistantVideo` story.
- Why: Val — wanted the copy icon identical across message types, the redundant
  Copy-Link affordance gone, and a clearer "bring into prompt" glyph for insert.

## 2026-06-29 23:31 — assistant-toolbar-always-visible

- What: Assistant-role toolbar (Copy / Insert-in-prompt / Regenerate) is now
  visible at rest instead of hover-revealed. Added `opacity: 1` to the existing
  `&[data-role='assistant']` block in `MessageActions.scss`; its (0,2,0)
  specificity overrides the pointer-hover `opacity: 0` default. User-message
  actions keep the hover-reveal; `[data-busy]` still dims to 0.5 while streaming.
- Why: Val — the action bar on AI replies should always be reachable, not only
  when the pointer is over the message.

## 2026-06-29 04:23 — iconactionbutton-to-toolbutton-swap

- What: Migrated every action button from the renamed `IconActionButton` (`@klyp/ui/IconActionButton`) to `ToolButton` (`@klyp/ui/ToolButton`) — Copy/Copy-image/Copy-URL/Download/Insert-in-prompt/Regenerate/Edit all now render `ToolButton`. No prop or behaviour change beyond the rename follow-through.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-23 17:22 — mobile always-visible + "Insert in prompt" action

- Files: `MessageActions.tsx`, `MessageActions.scss`
- What: (1) toolbar is now shown by default on mobile (≤768px) — added an
  `opacity: 1` override after the pointer-hover reveal block, so touch users
  (and mobile emulators that report hover) always see the actions. (2) The
  "Use as prompt" action was renamed to **"Insert in prompt"** and its glyph
  changed from `MagicStarOutline` → `AddOutline` (plus).
- Why: design-lead — the action bar was hover-gated and missing on mobile; and
  the prompt-insert action's label/icon didn't read as "add this to the prompt".
  (No circle-plus glyph exists in `@klyp/icons`; the plain plus is the closest.)

## 2026-05-21 13:30 — add-download-action

- What: New `onDownload` slot in the primary action group for image/video variants. Renders an `IconActionButton` with `DownloadOutline` between Copy URL and "Use as prompt".
- Why: Chat lightbox right-click + Copy actions already serve the original R2 URL, but there was no explicit "Save original" affordance — users on touch / disabled right-click could only get the AVIF preview the bubble thumbnail renders.

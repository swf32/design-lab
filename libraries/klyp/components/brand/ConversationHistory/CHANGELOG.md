# ConversationHistory — changelog

## 2026-06-29 04:23 — real-border-canvas-surface

- What: Replaced the inset box-shadow hairline with a real 1px --color-border-subtle border and switched the panel surface from --color-bg-rail to --color-bg-canvas; the root transition and collapsed state now fade border-color instead of box-shadow.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-17 16:14 — collapsed-toggle-align

- Files: `ConversationHistory.scss`
- What: In the collapsed 72px mini-rail the collapse toggle sat ~16px right of
  the New chat / Search icons — the hidden title kept the base `flex: 1 1 auto`
  and grew to fill the header even at `width: 0`. Added `flex: none` to the
  collapsed title so the toggle's 40×40 box lands on the same vertical line.
- Why: Val (catalog Collapsed story) — the three collapsed icons must align in
  one column. Verified in the browser (icon centres all at one x).

## 2026-06-17 15:41 — add-stories

- Files: `ConversationHistory.stories.tsx` (new); touched `apps/web/src/lib/stories-loader.ts`
- What: Added the missing `.stories.tsx` (Default / ActiveRow / Collapsed /
  Empty) so the `/components/conversation-history` Preview renders — the page
  was blank (no stories despite `status: 'stable'`). Bumped the stories-loader
  touch-comment to invalidate its long-running-dev `import.meta.glob` cache so
  the new file is discovered.
- Why: Val — catalog Preview was empty. Closes the long-flagged "stable
  component with no stories" gap. typecheck + biome green; Preview verified in
  the browser (all 4 stories render).

## 2026-06-17 10:58 — render-shared-ConversationRow

- Files: `ConversationHistory.tsx`, `ConversationHistory.scss`
- What: Replaced the internal `Row` subcomponent with the new shared
  `@klyp/brand/ConversationRow` (passing a label subset built from the shell's
  labels); removed the now-dead row block + spin keyframe + portal-menu rule
  from the SCSS.
- Why: One row source of truth with the app feature — the shell no longer
  carries its own copy of the row anatomy / rename / kebab. Public props +
  visual behaviour unchanged; typecheck + sass green.

## 2026-06-17 10:06 — share-glyphs-and-grouping

- Files: `ConversationHistory.tsx`, `grouping.ts` (new), `index.ts`
- What: The shell no longer hand-copies the pin / modality / collapse glyphs or
  the date-bucketing logic. Glyphs now import from `@klyp/icons` (`PinIcon` /
  `ModalityIcon` / `CollapseIcon`); the new co-located `grouping.ts` owns
  `groupOf` / `CONVERSATION_GROUP_ORDER` / `ConversationGroupKey` and is the
  single source the app feature (`features/chat/`) also consumes (imported via
  `@klyp/brand/ConversationHistory`).
- Why: The shell's inline glyph copies had drifted from the feature originals
  (clipPath wrappers dropped) and the date-grouping was duplicated verbatim —
  sharing both removes the manual-mirror drift vector. Public props + visual
  behaviour unchanged; typecheck green.

# ConversationRow — changelog

## 2026-06-30 01:48 — pinned marker + muted-rest kebab

- What: (1) New `showPinMark` prop renders a small leading filled-pin marker on
  pinned rows — enabled ONLY on the desktop Recents sidebar (a flat list with no
  "Pinned" group header); `/chats` + the mobile overlay group pinned under a
  sticky header so they keep it off. (2) Kebab "Pin/Unpin" icon is now always the
  outline pin (dropped the `filled` duotone toggle — the label carries the
  state). (3) Kebab rows now rest MUTED (Rename/Pin dim grey, icon dimmed via
  wrapper opacity) and lift to full white only on pointer-hover / keyboard
  focus-visible; Delete stays fully red in every state. The pointer-open
  auto-focus de-highlight is folded into the muted rest.
- Why: Val — pinning a chat in the sidebar moved it up with NO visible pinned
  cue (sidebar is flat, unlike /chats), and the kebab's pinned-state bulk icon +
  flat all-white rows read poorly; rows should read calm at rest and only the
  targeted row should pop.

## 2026-06-30 01:09 — wrap in React.memo (perf)

- What: The presentational row is now `memo(ConversationRowImpl)` (default shallow
  compare, no custom comparator). Pure perf — no markup/style/API change.
- Why: Recents list jank on AppSidebar expand/collapse — the row was an un-memoized
  function, so every parent re-render / virtualized-list ResizeObserver tick during
  the width animation re-rendered every visible row in full. Paired with stable props
  at the callsites (feature adapter `conversation-row.tsx`: useMemo'd `item` +
  useCallback'd handlers; `useConversations`: all handlers useCallback'd) so the memo
  actually holds. Shared by sidebar Recents + mobile overlay + `/chats`.

## 2026-06-29 04:23 — text-only-rows-and-dropdown-kebab

- What: Removed the leading `ModalityIcon` glyph so chat rows are text-only (a spinner is now the sole leading mark while a generation is pending), and migrated the kebab menu from `ActionMenu` to the unified `@klyp/brand` `Dropdown` (Rename / Pin·Unpin / Delete as `options`, Delete using `variant: 'danger'` + `separator`).
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-23 13:57 — hover fill matches New chat

- Files: `ConversationRow.scss`
- What: added a hover / focus-within background on `__main`
  (`--color-bg-surface-hover`, #2F) so a non-active row lifts to the same
  colour as the chat sidebar's New chat button on hover. The active row keeps
  its solid `--color-bg-surface-solid` (#222) — the `[data-active]` rule has
  equal specificity but comes later, so it wins on the active row.
- Why: design-lead — New chat and Conversation rows had different hover colours
  in the ConversationsSidebar floating-rail; unified to one hover wash.

## 2026-06-17 23:31 — promoted-to-stable

- Files: `apps/web/src/lib/components-registry.ts` (registry `status`)
- What: Promoted the catalog entry `beta` → `stable`. Now appears in the
  sidebar Stable group + `/components` Featured tab.
- Why: Design-lead (Val) sign-off after a live Playwright review — preview
  (Default/States/Truncation/WithTime), Source tabs (tsx + scss + Copy), and
  "Components used" (ActionMenu) all render; 0 new console errors/warnings
  (the lone PressResponder warning is pre-existing ActionMenu/RAC noise, also
  present on untouched pages).

## 2026-06-17 14:23 — kebab-separator + truncation-story

- Files: `ConversationRow.tsx`, `ConversationRow.stories.tsx`
- What: Added an `ActionMenuSeparator` before the destructive Delete in the
  kebab (Rename / Pin·Unpin · separator · Delete) — matches the ActionMenu
  reference. Reworked the `Adaptive` story → `Truncation`: realistic stacked
  widths (240 / 360 / 560px) instead of an unrealistic 1200px that overflowed
  the catalog preview, so the narrow rows visibly ellipsis-truncate the title.
- Why: Catalog review (Val) — 1200px was unrealistic for a sidebar/list row and
  clipped in the preview; Delete needed visual separation from the safe
  actions. Both verified in the browser; typecheck + biome + sass green.

## 2026-06-17 10:58 — extracted-from-feature-and-shell

- Files: `ConversationRow.tsx` (new), `ConversationRow.scss` (new),
  `ConversationRow.stories.tsx` (new), `index.ts` (new); barrel
  `packages/brand/src/index.ts`.
- What: New brand molecule — one chat-history row: modality glyph (or a pending
  spinner) + truncated title + optional relative-time column + hover kebab
  (Rename / Pin·Unpin / Delete) + inline rename. Generic, backend-agnostic
  `ConversationRowItem` + injected `labels` (EN/RU host copy) + optional
  `formatTime`. Composes `@klyp/icons` glyphs + `@klyp/brand` ActionMenu; BEM
  block `klyp-ConversationRow` (SCSS ported from the app feature row).
- Why: The row was hand-maintained TWICE — the app feature
  (`features/chat/conversation-row.tsx`, `Doc<'conversations'>`-typed) and an
  internal non-exported `Row` inside `ConversationHistory`. Both now consume
  this one component (the feature file became a thin Doc→item adapter; the shell
  renders it directly), killing the duplicated row anatomy / rename / kebab.
  Stays tier-clean — generic item shape, no `@klyp/api`. typecheck + biome +
  sass green.

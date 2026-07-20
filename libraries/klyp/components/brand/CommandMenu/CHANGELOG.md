# CommandMenu — changelog

## 2026-07-02 18:51 — CommandMenuDialog: standalone DialogContent (PressResponder warning fix)

- What: `CommandMenuDialog` dropped the `<Dialog>` (RAC DialogTrigger) wrapper
  and passes `isOpen`/`onOpenChange` straight to `DialogContent` (the
  documented standalone controlled mode, Dialog.tsx:132-138 — same shape as
  brand Modal and Sheet).
- Why: a DialogTrigger with no pressable trigger child logged "A
  PressResponder was rendered without a pressable child" on every mount
  (three per chat-surface visit via ConversationSearchDialog); verified fix
  live — zero warnings on open.

## 2026-07-02 03:45 — filterMode='external' for server-filtered data

- What: new `filterMode` prop — `'internal'` (default, cmdk scores mounted items) / `'external'` (consumer already filtered `groups`; cmdk `shouldFilter` off, rows render as given; empty/loading states still derive from the rendered count).
- Why: the chat conversation-search integration merges server-side full-text hits over MESSAGE CONTENT — a hit whose title doesn't contain the query would be dropped by cmdk's client filter.

## 2026-07-02 01:20 — close (×) in the top row + mobile grabber

- What: new `onClose` prop — the search field stops stretching full width and a 32px close (×) shares the top row (input-register chrome: inset ring, icon-muted → white). `CommandMenuDialog` wires it automatically (`onOpenChange(false)`), consumer override wins. Mobile sheet additionally shows a grabber bar (CSS `::before` on the root — visual affordance; dismiss = × / backdrop / Esc). Labels += `closeMenu`.
- Why: Val — на мобилке диалог было нечем закрыть кроме неочевидного тапа по фону (Esc на таче нет); крестик в ряд с серчбаром нужен и на ПК.

## 2026-07-02 00:45 — design pass (Val): kebab actions, platform shortcuts, mobile preview

- What: per-row kebab (⋯) actions (`item.actions` + `onItemAction`, ConversationRow recipe — hint swaps for the kebab on hover/selection, always visible on touch, event-barrier so the kebab never triggers row select); shortcuts adapt to platform (⌘ on Apple, Ctrl elsewhere — Kbd + aria-keyshortcuts); item shortcut keycaps → Kbd `md` (20px, atom sizes bumped globally); clear (×) → solid `--color-fg-icon-muted` (no opacity — Val: цветом, не прозрачностью); category chips re-colored in stories (blue/purple/teal dots); categories row wraps (dead overflow scroll dropped earlier); standalone register border; catalog gets desktop+mobile iframe previews (`CATALOG_PREVIEWS` + `CommandMenu.default.snapshot.tsx`). Inherits from ui Command: subtle border + colour-only focus, symmetric icon insets, smooth list height morph, heading spacing.
- Why: Val visual review 2026-07-02 (скриншоты) — мелкие кейкапы, кривые отступы лупы/крестика, alpha на иконках, нет кебаба как в истории бесед, нет мобильного превью, высота должна меняться плавно.

## 2026-07-01 23:55 — review pass (a11y + correctness + DS-rules fixes)

- What: sr-only `role="status"` live region announces loading / no-results (cmdk's Empty is `role="presentation"`, Loading's children are aria-hidden — SR users heard nothing; WCAG 4.1.3); custom cmdk `filter` strips the `id:::` prefix so machine ids never produce ghost matches; category selection validated against the current `categories` prop (phantom-category stuck state); item shortcuts exposed via `aria-keyshortcuts` with the glyph Kbd aria-hidden; footer glyph Kbds aria-hidden + sr-only key names (labels += `navigateKeys`/`selectKeys`); dialog description wired via `aria-describedby`; clear (×) dim moved off the alpha `--color-fg-muted` (icon-transparency rule) to solid colour + wrapper opacity; ↑/↓ from a focused category chip no longer move the list highlight (activation-target divergence); chips row wraps (dead overflow scroll removed); placeholders folded into `labels` (`placeholderPalette`/`placeholderSearch`); standalone register gets a border (dialog register drops it); story chips switched to neutral gray.
- Why: multi-agent review (correctness / DS-rules / a11y / design / brand-safety) with adversarial verification — 8 confirmed findings fixed, plus self-verified items from the unverified tail.

## 2026-07-01 23:25 — initial version (palette + search variants)

- What: New brand molecule over `@klyp/ui` Command (cmdk): `variant="palette"` (leading item icons, optional BadgeToggle category chips under the input, right-aligned Kbd shortcuts, ↑↓/↵/esc Kbd hint footer) and `variant="search"` (SearchOutline input, no icons/categories/footer, muted rows lifting on selection, tabular-nums relative-time hints — the conversation-search register). Plus loading (Spinner + CommandLoading), clear (×) button in the input trailing slot, controlled/uncontrolled query, and `CommandMenuDialog` (sr-only a11y header inside DialogContent, 640px `.klyp-Command__dialog` surface).
- Why: Val — port the HeroUI Pro Command pattern into the DS: one component covering the full ⌘K palette state and the minimal conversation-search state (à la Claude Code resume search), styled to Klyp tokens.

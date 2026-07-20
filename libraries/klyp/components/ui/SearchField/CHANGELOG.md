# SearchField — changelog

## 2026-06-29 04:23 — xoutline-clear-and-cleararialabel-prop

- What: Replaced the hand-rolled inline `<svg>` clear glyph with `@klyp/icons` `XOutline`, and added a `clearAriaLabel` prop (default `'Clear search'`) so non-English brands can localise the clear button's `aria-label`. Doc comment expanded to spell out the RAC props passed through.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-24 — onSubmit/onClear docs

- What: задокументированы сквозные из RAC `onSubmit` (Enter), `onClear` (× / Esc), `value`/`onChange` — они и раньше проходили через `{...props}`, теперь видны в JSDoc-шапке. Интерактивный controlled-пример не делали стори — в статик-каталоге печать/Enter не воспроизводятся; контракт описан в шапке.
- Why: `onSubmit`-на-Enter — паритет с [React Aria SearchField](https://react-aria.adobe.com/SearchField) [FETCHED]. (Проп `isLoading` сначала добавили, потом откатили: ни у React Aria, ни у Geist, ни у Radix, ни у HeroUI нет loading-состояния на самом поле — фидбек о загрузке остаётся заботой консьюмера.)

## 2026-06-24 — cross-ds-audit fixes: clearAriaLabel + XOutline

- What: две правки по аудиту — (1) добавлен проп `clearAriaLabel?: string` (дефолт `'Clear search'`) на кнопку очистки — теперь Unreals может передать `'Очистить'`; (2) инлайн-`<svg>` крестика заменён на `XOutline` из `@klyp/icons` — теперь глиф из общей иконной системы.
- Why: аудит против React Aria / Geist выявил: кнопка очистки нарушала multi-brand (захардкоженный английский `aria-label`), крестик выбивался из икон-системы (инлайн-SVG при лупе из Iconsax). (Стори `Focus` пробовали добавить, но в снапшот-каталоге фокус/ховер не воспроизводятся статикой — откатили.)

## 2026-06-17 11:10 — optional inputRef

- Files: `SearchField.tsx`
- What: Added optional `inputRef?: Ref<HTMLInputElement>` forwarded to the inner
  `RACInput`, so a caller can focus the field imperatively (the existing `ref`
  targets the RAC root `<div>`, not the input).
- Why: The chat conversations sidebar carries focus across its collapsed→expanded
  search swap (`pendingSearchFocus` effect) and needs a handle on the actual
  input. Unblocks swapping the sidebar's hand-rolled search to this primitive.
  Purely additive — no behaviour change for existing consumers.

## 2026-06-16 12:00 — handoff hardening (focus treatment fix)

- What: `SearchField.scss`, two changes to the focus treatment:
  1. Added `&__input:focus-visible { outline: none }`. The app ships a
     global `:focus-visible { outline: 1px solid var(--color-ring);
     outline-offset: 2px }` fallback for raw native elements. A native
     `<input>` matches `:focus-visible` on pointer focus too, and that rule
     is `(0,1,0)` — equal to the input's plain `outline: none` `(0,1,0)`, so
     on a load-order tie the global rule won and painted a detached ring
     around the whole field (the reported "ugly outline"). The new
     `(0,2,0)` selector wins the tie and suppresses it — same pattern the
     global sheet already uses for `.klyp-ExpandingSearch__input` and
     `[role='dialog']`.
  2. Kept the EMPHASISED (thicker) focus border the design intends, but
     moved the extra thickness off the box model so it no longer shifts the
     content. The old rule bumped `border-width` --bw-default → --bw-emphasis;
     a border lives inside the box model, so 1px → 2px ate 1px of the content
     box and shoved the input sideways on click. Now the border stays at
     --bw-default and the focus rule adds `box-shadow: 0 0 0 var(--bw-default)
     var(--color-border-focus)` — a flush 1px ring (no offset/blur) outside
     the 1px border, reading as one solid 2px (--bw-emphasis) edge on the
     rounded corners. box-shadow isn't part of layout → zero shift (verified:
     input bounding-rect identical before/after focus). Scoped
     `&[data-variant]:focus-within` (0,3,0) to out-rank the variant selector;
     the `[data-invalid]:focus-within` block mirrors it with the danger colour.
- Why: handoff readiness. The visible "ugly outline" was the global
  focus-visible ring leaking onto the input (fix 1). Fix 2 preserves the
  intended bold focus border but kills the ~1px content jump by painting the
  emphasis with box-shadow instead of border-width. Keyboard + pointer focus
  both show it, so a11y is preserved.

## 2026-05-25 — initial-release

- What: Initial canonical version shipped under `@klyp/ui`.
- Why: Headless search input primitive with leading icon + clear button. Replaces ad-hoc Input+SVG wrappers (first consumer — `/canvas` board hub).

## 2026-06-26 09:10 — playground-controls

- What: added meta args + argTypes (size, variant, placeholder, defaultValue, isDisabled, isReadOnly, isInvalid + className shown non-editable) so the catalog ComponentPlayground renders live controls over real props.
- Why: bringing the primitive to the playground-controls convention (.claude/rules/components.md).

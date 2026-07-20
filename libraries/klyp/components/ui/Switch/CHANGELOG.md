# Switch — changelog

## 2026-06-29 04:23 — drop-default-size-alias-tokenize-scss

- What: Removed the legacy 'default' size alias from SwitchSize and SIZE_MAP (size scale is now sm/md/lg, with a runtime fallback to 'md'); tokenized the SCSS — track widths --icon-size-lg/xl → --space-24/32, hardcoded thumb translateX px → --space-*, hover → --color-bg-surface-hover, disabled opacity → --opacity-disabled — and expanded the stories.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-25 13:58 — token-hygiene, drop-legacy-size, composition-story

- What: (1) token hygiene in `Switch.scss` — `translateX(10/14/16px)` → `var(--space-10/14/16)`, track widths off icon tokens (`--icon-size-lg/-xl`) → `var(--space-24/--space-32)`, `--opacity-50` → `--opacity-disabled`, hover `color-mix(... white)` → `var(--color-bg-surface-hover)` (brand-safe, was a literal `white` that drifted on unreals light). (2) Removed legacy `'default'` value from the `SwitchSize` union + `SIZE_MAP` — it only aliased to `'md'`, no consumer passed it (grep-verified); the `?? 'md'` runtime fallback stays so a stray value can't crash. (3) Added `Composition — toggle row` story mirroring the chat composer's `ToggleRow` (label + inline hint left, track right) — shows the row is consumer-side layout, not Switch API (same convention as Input's `Composition — …` stories).
- Why: cross-DS audit (2026-06-25). Geometry/visuals unchanged; token swaps resolve to identical px. Public API narrows (legacy alias gone) with zero callsite breakage.

## 2026-06-11 — reduced-motion support (from DS review PR #1)

- What: added a `@media (prefers-reduced-motion: reduce)` block — `.klyp-Switch__thumb` and `.klyp-Switch__track` get `transition: none`. Final states (translateX, background) untouched; the thumb toggles instantly. Geometry and public API unchanged.
- Why: the toggle animation ignored `prefers-reduced-motion` (WCAG 2.3.3) — review audit item, cherry-picked from vyach32's design-review batch.

## 2026-06-05 — selected-thumb-symmetric-inset

- What: Thumb resting inset `left: var(--space-2)` → `calc(var(--space-2) - var(--bw-default))` (2px → 1px in padding-box coords). The thumb's containing block is the track's padding box (inside the 1px border), so the old `2px` rendered as a 3px visual gap on the left while the `translateX` travel (10/14/16px) was calibrated for a 2px gap — leaving only 1px on the right in the selected state. Travel values unchanged. Now all sizes read 2px on every side in both off/on states. Verified in catalog: sm/md/lg ON → right gap 2px (was 1px).
- Why: design review — switch thumb sat asymmetrically when on (extra ~1px to the right), breaking the "element framed by equal gaps on all sides" rule.

## 2026-05-27 22:04 — lg-size-white-on-state-and-stable

- What: добавлен размер `lg` (40×24 track, 20px thumb, travel 16px) — ровный шаг от md (24→32→40 ширина / 14→18→24 высота / 10→14→20 thumb); цвет selected track изменён с `--color-accent` (gold) на `--color-fg-primary` (white на klyp, тёмный на unreals); selected-hover теперь color-mix от fg-primary вместо accent-hover; статус в каталоге переведён `beta → stable`.
- Why: Val попросил третий размер для крупных тач-таргетов и убрал золотой акцент с включённого состояния — switch не CTA, не должен конкурировать за внимание с primary actions; компонент считаем стабильным.

## 2026-06-26 09:11 — playground-controls

- What: completed meta args + argTypes (children text, size inline-radio, isSelected/isDisabled/disabled boolean, className control:false) for the catalog ComponentPlayground.
- Why: playground-controls convention (.claude/rules/components.md).

# Input — changelog

## 2026-06-29 04:23 — hover-elevated-playground-argtypes

- What: Changed the hover background from --color-bg-surface-hover to --color-bg-surface-elevated and added Playground args/argTypes (size & variant inline-radio, type select, placeholder/defaultValue text, disabled/readOnly boolean) so ComponentPlayground drives real Input props.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-25 11:53 — SpecialTypes story: file row → FileTrigger (English label)

- What: the `file` row in the SpecialTypes story swapped from native `<Input type="file">` to React Aria `FileTrigger` + `Button` ("Choose file" / "No file selected").
- Why: the design lead — the native control rendered its button + status text from the browser UI locale (RU «Обзор» / «файл не выбран»); FileTrigger gives us locale-independent English copy matching the other rows. (`::file-selector-button` SCSS kept for consumers still using native.)

## 2026-06-05 — file-button-solid-segment

- What: Restyled the native `::file-selector-button` in `Input.scss`. Was a transparent inline label sharing the input background; now a solid segment — `--color-bg-surface-solid` fill, `border-right` divider (`--bw-default solid --color-border-default`), left corners rounded to `calc(--r-chip - --bw-default)`. The button stretches to the full inner height at every size: `&[type='file']` drops `padding-block` to `0` so the content box equals the inner height, and the button uses `height: 100%` (was content-driven `height: auto`, which only reached ~24px in md and broke across sm/lg). `font-size: inherit` lets the label scale with `data-size`. Left edge reached via a negative inline-start margin (`-padding-control-x`). Added a `:hover` (`--color-bg-surface-hover`) with a `background` transition.
- Why: The transparent button read as plain text glued to "no file selected", giving no affordance that "Choose File" is the clickable region. The solid segment + divider matches the reviewed target and the rest of the form-control family. SCSS-only change; `Input.tsx`, public API, and component imports untouched.

## 2026-05-17 03:45 — promote-to-stable

- What: Promoted from `beta` to `stable`. Added 2 new props on the public API: `size?: 'sm' | 'md' | 'lg'` (default `md`) and `variant?: 'outline' | 'filled' | 'ghost'` (default `outline`). Wired `data-size` + `data-variant` data-attrs on the RAC input. SCSS extended with hover state, 3 size selectors (28/32/40 height), 3 variant selectors. Replaced raw `--space-6/12` with semantic `--padding-control-x/y`. Replaced `--radius-md` with `--r-chip` for form-control family consistency. Story file expanded from 3 to 9 stories (Default / WithValue / Sizes / Variants / States / WithLabel / SpecialTypes / Adaptive / WithCharCounter).
- Why: Catalog reader couldn't see size/variant differentiation, no hover affordance, only 3 stories. Form-control family (Input/InputGroup/Textarea/AutoTextarea) was visually inconsistent across radii and missing hover state. Native HTML `size` attribute dropped via `Omit<RACInputProps, 'size'>` — verified zero production callsites via grep.

Backward-compat: `<Input />` without `size`/`variant` props renders with `md`+`outline` defaults — visually nearly identical to prior baseline (height 32px stays; font-size shifts 14→13 to match the documented size table).

## 2026-06-26 09:10 — playground-controls

- What: added meta args + argTypes (size, variant, type, placeholder, defaultValue, disabled, readOnly + className shown non-editable) so the catalog ComponentPlayground renders live controls over real props.
- Why: bringing the primitive to the playground-controls convention (.claude/rules/components.md).

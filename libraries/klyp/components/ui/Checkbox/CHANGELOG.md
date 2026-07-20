# Checkbox — changelog

## 2026-06-29 04:23 — add-tone-and-errormessage-props

- What: Added a `tone` prop ('neutral' | 'success', emitting data-tone, with a success fill via --color-status-success) and an `errorMessage` prop rendered below the label and wired to the input via useId-based aria-describedby (merged with any caller aria-describedby) for WCAG 1.4.1/3.3.1. Exported the new CheckboxTone type from the barrel.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-15 14:49 — readonly + reduced-motion + success tone + error text (audit fixes)

- What: styled `[data-readonly]` (muted unchecked box + default cursor, never hides the checkmark); added a `prefers-reduced-motion` gate on box/check/dash transitions; added opt-in `tone="success"` (green checked fill via `--color-status-success`, invalid still wins); added an optional `errorMessage` slot rendered under the label; swapped focus to an offset outline ring (`--color-ring`, mirrors Switch); `--opacity-50` → semantic `--opacity-disabled`.
- Why: senior DS audit — `isReadOnly` was in the API but unstyled (Input/Textarea style it), the animated transitions ignored reduced-motion (Switch already gates it), invalid was near-colour-only, and the owner asked for a success tone. All additive/opt-in; the default checkbox is visually unchanged.

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: `Checkbox.tsx` — added a DEV-only warning (`process.env.NODE_ENV !== 'production'`): if the checkbox has neither `children` nor `aria-label`/`aria-labelledby` in the rest props, a `console.warn` is emitted. The public API, markup, and render logic are unchanged.
- Why: audit item 3.2 — a checkbox without a visible label and without an accessible name is inaccessible to screen readers; a runtime warning in dev helps catch such cases before production.

## 2026-05-17 01:00 — initial-release

- What: Initial canonical version shipped under `@klyp/ui`.
- Why: Single-row Checkbox primitive added — withdraw add-wallet form was using native `<input type="checkbox">`. Now part of standard @klyp/ui set as part of the /referrals catalog promotion wave 2026-05-17.

## 2026-06-26 09:11 — playground-controls

- What: completed meta args + argTypes (children text, size/tone inline-radio, description/errorMessage text, isSelected/isIndeterminate/isDisabled/isInvalid/isReadOnly boolean, className control:false) for the catalog ComponentPlayground.
- Why: playground-controls convention (.claude/rules/components.md).

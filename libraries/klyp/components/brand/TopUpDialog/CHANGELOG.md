# TopUpDialog — changelog

## 2026-06-29 04:23 — slider-variants-steppers-even-presets

- What: Added a sliderVariant prop ('thin' | 'mesh' | 'segments' | 'ruler', wiring in MeshSlider / SegmentSlider / RulerSlider), showSlider / showSteppers / showPresets toggles, and −/+ stepper Buttons (AddOutline / MinusOutline) flanking the amount with floor/ceiling disabling. Replaced the caller-supplied `presets` prop with an exported evenPresets() helper that evenly distributes preset values across [min, max].
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-29 09:14 — redesign: slider removed · editable hero number · square presets · centered header

- Files: `TopUpDialog.tsx`, `TopUpDialog.scss`, `AmountInput.{tsx,scss}` (added `hero-xl`), playground consumers.
- What:
  1. **Slider removed entirely** — dropped the amount slider, the `sliderVariant`
     + `showSlider` props, the 4 slider imports (Allowance/Mesh/Segment/Ruler),
     and the playground's Thin/Mesh/Segments/Ruler switcher + "Drag to adjust".
  2. **−/+ steppers** now `variant="secondary" size="icon"` — the same square as
     the Modal ✕ close button (was `size="icon-lg"`).
  3. **Amount number** bumped to AmountInput `hero-xl`; free typing of any value
     (NumberFormat input, clamp/snap on blur) confirmed.
  4. **Amount re-layout** — muted uppercase "TOKENS" eyebrow ABOVE the number,
     "You pay $X" directly below; removed the duplicate ticker suffix (kills the
     3-line number/tokens/pay stack).
  5. **Presets** → `size="sm"`, square (Button `--r-chip`, no pill override),
     full-width row (`flex: 1`), `evenPresets` count 5→6 (one extra stop).
  6. **Title + description centered.**
- Why: design-lead feedback — tighter slider-free top-up; steppers match the ✕;
  presets read as buttons not pills; bigger editable number; no 3-line stack.

## 2026-06-25 07:58 — per-element visibility props

- What: added `showSlider` / `showSteppers` / `showPresets` props (default
  `true`). Each gates the matching element (amount slider · −/+ steppers ·
  preset buttons). Same props on v2/v3. Drives the playground's element-toggle
  buttons.
- Why: lets the /topup-paywall playground turn each amount control on/off live
  across all three dialog variants for comparison.

## 2026-06-25 06:43 — −/+ amount steppers

- What: added −/+ secondary `Button` steppers (`variant="secondary"
  size="icon-lg"`) flanking the amount value, pinned to the full-width row edges
  (minus left, plus right) with the number cluster centred between them (new
  `__amountStepRow`). Each nudges by one `step`, clamped to `[step, headroom]`;
  minus disables at the floor, plus at the ceiling. Same treatment in v2/v3.
  Uses the new `MinusOutline` icon.
- Why: coarse ± adjustment alongside the slider/presets, with controls at the
  true edges rather than hugging the number.

## 2026-06-24 — upgrade state + validDays + coins CTA icon

- What: new `state="upgrade"` — the next-plan stopper now renders through THIS
  dialog (was a separate plain Modal): `icon` slot (colourful `TierGlyph`),
  pitch copy, `bullets` (check-marked benefits), single CTA. Buy CTA gained the
  `CoinsOutline` glyph. Added `validDays` (default 30) for days-aware
  description/note labels (label may be `(days) => …`).
- Why: Val — the free/starter/creator upgrade popups must use the new shell +
  show the next-tier glyph (free→starter→creator→creator+→studio), not the old
  Modal. One component now covers buy / cap / upgrade.

## 2026-06-24 — cap icon + dynamic price + input clamp

- What: `cap` state now shows the `CoinsBulk` glyph tinted danger (red), like
  StatusDialog's payment-failed icon. The input helper became a LIVE
  "You pay $X" (accent-coloured price, recomputed from the selected amount)
  instead of a static unit line. Description moved out of the header into the
  body (centred) so it no longer collides with the ✕ and the title sits level
  with the close box. Typed amount is clamped to `headroom` (can't enter more
  than buyable) with a forced re-sync for the at-ceiling edge.
- Why: Val review — match the StatusDialog shell exactly (centred title, ✕,
  no separator), show the real cost dynamically, and stop over-typing past the
  cap. AmountInput left untouched (clamp done on the controlled value).

## 2026-06-24 — new component (duplicated from StatusDialog)

- What: New compact token-purchase dialog. Duplicates StatusDialog's shell
  (hero-radius surface, centred header, bordered ✕ box, divider-less
  full-width footer) but with an interactive body — centred hug-content
  AmountInput + quick presets + full-width AllowanceSlider + now/new-total
  summary. `state`-driven: `buy` (picker) / `cap` (limit-reached notice).
- Why: Val — the top-up modal should be a small StatusDialog-shaped dialog,
  not a wide slider sheet; built as its own DS component (catalog-listed,
  variant stories) so /chat + /pricing call it by situation instead of each
  re-styling Modal. StatusDialog itself is left untouched.

## 2026-06-25 06:07 — ruler-slider-variant

- What: Added `sliderVariant="ruler"` (RulerSlider) alongside thin/mesh/segments.
- Why: Third slider option for the DEV-805 top-up comparison playground.

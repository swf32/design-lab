# AmountInput — changelog

## 2026-06-24 — optional min / max bounds

- What: added optional `min` / `max` props. `max` rejects keystrokes above it
  (react-number-format `isAllowed`) so the field can never hold a value over
  the ceiling; `min` clamps up on blur. Both optional — no behaviour change
  when unset. `max` also doubles as the `Max`-pill target (pill still needs
  `onMax`).
- Why: consumers (TopUpDialog token picker) need a hard input ceiling — typing
  past the buyable headroom (e.g. 44,000) must be impossible, not just snapped
  after the fact.

## 2026-06-24 12:49 — suppress-global-focus-ring

- What: AmountInput.scss — added `&:focus-visible { outline: none }` on `.klyp-AmountInput__field`.
- Why: the global `:focus-visible` ring (globals.scss) landed on the native `<input>` as a stray 1px outline+offset rectangle; scoping it raises specificity to beat the global, and the blinking caret is the focus indicator for this borderless hero field.

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: AmountInput.tsx — removed `aria-live="polite"` from the error `<p>` (line 155), keeping only `role="alert"`.
- Why: the error message had a conflicting `role="alert"` (implicitly assertive) plus `aria-live="polite"`, double-declaring the live region; `role="alert"` already covers announcement.

## 2026-05-17 02:11 — fix-story-widths

- What: Sizes + LengthBuckets stories wrap grid now constrained with `width: '100%', maxWidth: 560`.
- Why: On `/components/amount-input` the grid wrapper was sized by min-content inside a flex-center stage, which made `width: 100%` on the component resolve circularly to the ticker's nowrap width (~50px); `overflow-wrap: anywhere` on the helper then split every character onto its own line. 560px aligns with the hero-sheet baseline the `hero-lg` clamp targets (`10cqi` → 56px at 560).

## 2026-05-17 01:00 — initial-release

- What: Initial canonical version shipped under `@klyp/brand`.
- Why: Oversize numeric input with react-number-format, Max pill, ticker suffix, adaptive font-size. Lifted from withdraw drawer as part of the /referrals catalog promotion wave 2026-05-17.

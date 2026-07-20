# prompt-composer — changelog

## 2026-07-02 15:32 — drop-dead-leftovers (generate-settings-trigger, media-type-tabs, video-reference-slot, floating-chips)

- What: Deleted `generate-settings-trigger`, `media-type-tabs`, `video-reference-slot` and `floating-chips` (.tsx/.scss/.stories.tsx each) + their exports from this barrel and from `@klyp/brand`. Kept `aspect-ratio-picker` (premise-screen), `derive-atom-refs` (visual-editor + editor route) and `types.ts`; fixed the stale barrel doc-comment that still listed the deleted files.
- Why: Phase-4 composer cleanup (spec 2026-07-02 §5) — these were superseded by `ComposerSettingsPopover` / `TabSwitcher` / `AttachmentSlotGroup`; grep confirmed 0 live consumers (only their own orphan stories).

## 2026-06-29 04:23 — drop-model-picker-settings-popover-icon-swap

- What: Deleted the ModelPicker and GenerateSettingsPopover sub-components (.tsx/.scss/.stories.tsx) and removed both from the index.ts barrel exports, consolidating into the unified PromptField/Dropdown chassis. Swapped the inline hardcoded <svg> close glyph in video-reference-slot.tsx for the CloseCircleOutline icon from @klyp/icons.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-17 16:03 — control-height-36-to-40 (DS baseline)

- What: model-picker dropdown item height 36px → 40px; `PromptComposer-ChipButton` height 2.25rem → 2.5rem (40px).
- Why: DS-wide control-height baseline bump 36→40 (`control.size.lg`; see @klyp/tokens CHANGELOG). These footer/dropdown controls tracked the old 36px baseline; bumped to 40px for parity with the composer footer controls.

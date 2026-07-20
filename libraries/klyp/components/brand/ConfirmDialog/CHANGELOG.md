# ConfirmDialog — changelog

## 2026-06-29 04:23 — align-icon-footeralign-props-modal-kind

- What: Wired the dialog onto the new Modal system — added `align` (ModalAlign), `icon`, `footerAlign` (ModalFooterAlign) and `hideClose` props, set kind="dialog" (which now owns the width, deprecating `size`), and switched the Cancel button from the outline to the secondary variant.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-24 09:22 — footer rule: secondary cancel

- Files: `ConfirmDialog.tsx`
- What: the Cancel button is now `variant="secondary"` (was `outline`),
  matching the footer rule — primary action = `primary`/`destructive`, secondary
  action = `secondary`.
- Why: design-lead — single footer-button convention across modals.

## 2026-06-24 08:45 — dialog kind + alert layout passthrough

- Files: `ConfirmDialog.tsx`
- What: now renders the `Modal` with `kind="dialog"` (fixed `--modal-w-dialog`
  width) and forwards new layout controls: `align` (`'start' | 'center'`),
  `icon` (leading glyph / centered illustration), `footerAlign`
  (`'end' | 'split'`), and `hideClose` (default true). So an icon-led centered
  alert with a split footer — e.g. "Payment failed" → Got it / Contact support —
  is now `ConfirmDialog align="center" icon=… footerAlign="split" tone="primary"`.
  The `size` prop is deprecated (the dialog kind owns its width) but kept for
  back-compat (ignored).
- Why: design-lead — model the Figma alert/confirm use-cases on the unified
  Modal system without a bespoke component.

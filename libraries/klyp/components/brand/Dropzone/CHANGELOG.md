# Dropzone — changelog

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: Dropzone.tsx — added `useId`, the hidden `<input>` now gets
  `aria-labelledby` pointing to the `id` of the visible label
  `.klyp-Dropzone__label` (with a fallback `aria-label="Upload files"` when
  custom `children` are used); added a visually hidden
  `<div role="status" aria-live="polite">` announcing the dragover state
  ("Release to upload") and reject state ("File rejected"). Dropzone.scss —
  added the `.klyp-Dropzone__live` class (sr-only) for the live region.
- Why: 3.1 — the hidden input had no accessible name, so the screen reader did
  not associate it with the label; 3.2 — the dragover/reject states were not
  announced. Pure a11y additions; layout and the public API are unchanged.

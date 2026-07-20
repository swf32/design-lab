# EmptyState — changelog

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: EmptyState.scss — added `&[data-align='start'] &__description { margin-inline: 0 }` to reset the auto left/right margins on the description in start alignment.
- Why: The description kept `margin-left/right: auto`, so with `align="start"` it stayed centered (instead of left-hugging) once the container exceeded its 28rem max-width.

## 2026-05-17 01:00 — promote-to-stable

- What: Status flipped `beta` → `stable` in components-registry.ts; states audit confirmed full coverage.
- Why: Referenced as part of the /referrals catalog wave 2026-05-17.

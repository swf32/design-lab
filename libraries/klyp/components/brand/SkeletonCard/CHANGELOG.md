# Skeleton — changelog

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: SkeletonCard.scss — added the rule `&[data-ratio='3:4'] &__media { aspect-ratio: 3 / 4; }`, mirroring the other ratio variants. SkeletonCard.tsx — removed the `aria-live="polite"` attribute from the root Card, keeping `aria-busy="true"`.
- Why: the `3:4` ratio was declared in the CardRatio type but had no CSS rule, so the media block collapsed to zero height (item 5.3). A container with `aria-live="polite"` holds only aria-hidden children — there is nothing to announce, so the live region was redundant (item 3.2).

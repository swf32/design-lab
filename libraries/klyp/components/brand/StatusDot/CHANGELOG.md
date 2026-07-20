# StatusDot — changelog

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: StatusDot.scss — wrapped the `&[data-pulse]` animation in an `@media (prefers-reduced-motion: reduce)` block that sets `animation: none`, so the pulsing dot stops blinking when the user has reduced motion enabled (the dot stays visible).
- Why: The pulse animation ran unconditionally, ignoring `prefers-reduced-motion` (WCAG 2.3.3 motion), and was inconsistent with sibling status components.

## 2026-05-17 01:00 — initial-real-implementation

- What: Real implementation replaces TODO stub; API renamed `status` → `tone` (6 tones × 3 sizes × optional pulse).
- Why: Was a placeholder entry in components-registry. New implementation lifted the inline pattern from balance-triad and sidebar Soon-rows. Two consumer callsites migrated (`series.$seriesSlug.tsx`, `series.$seriesSlug.$episodeSlug.tsx`).

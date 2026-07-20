# ComingSoonPage — changelog

## 2026-05-25 21:40 — title-to-24px

- What: title font-size dropped from `clamp(1.875rem, 5cqi + 1rem, 3.25rem)`
  to a flat `--font-size-24` with `--line-height-tight`.
- Why: matches the SectionHeader h1 change — every route title is now 24px;
  eyebrow + description also stripped at the callsites (billing, analytics,
  earnings, history, sandbox).

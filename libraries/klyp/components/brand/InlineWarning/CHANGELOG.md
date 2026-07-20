# InlineWarning — changelog

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: InlineWarning.tsx — added a tone-derived ARIA role on the root `<p>` (`role="alert"` for `tone="danger"`, otherwise `role="status"`), so assistive tech announces the callout as a live region. No public API, markup or visual change.
- Why: The static callout had no semantic role, so screen readers read it as plain inline text with no signal that it is a caution/info/danger message (audit item 3.1).

## 2026-05-17 01:00 — initial-release

- What: Initial canonical version shipped under `@klyp/brand`.
- Why: Borderless inline icon + bold lead + body callout (Wise/Mercury style). Lifted from withdraw Review "Irreversible" warning as part of the /referrals catalog promotion wave 2026-05-17.

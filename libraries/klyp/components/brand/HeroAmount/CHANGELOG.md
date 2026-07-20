# HeroAmount — changelog

## 2026-06-11 — sr-only full-value span (review rework)

- What: replaced the root `aria-label` approach (entry below) with a visually-hidden `__srLabel` span carrying the full spoken value ("minus $1,247.50 USDT"); ALL visual spans (sign / currency / integer / cents / ticker) are now `aria-hidden`. Root keeps `role="status"` + `aria-live`. Added the `__srLabel` sr-only block to HeroAmount.scss.
- Why: live regions announce changed CONTENT, not labels — with the aria-label approach a value update was still read without the minus/currency. The sr-only span is the only AT-visible content, so browse-mode reading and live announcements both speak the complete value, with no double-reading (`role="status"` is implicitly `aria-atomic`).

## 2026-06-03 16:35 — a11y / Safari critical fixes (audit)

- What: `HeroAmount.tsx` — added an `aria-label` to the root `<div role="status">`, assembled from the full value (minus sign → "minus", currency glyph, formatted integer/cents amount, optional `trailingTicker`). JSDoc was brought in line: instead of "consumers can pass a fully-formatted aria-label on a wrapping `<output>`", it now describes the actual behavior — the root itself carries the aria-label. Markup, props and public API are unchanged; `aria-hidden` on the sign/currency spans is kept.
- Why: audit item 3.3 — the minus sign and currency glyph were under `aria-hidden`, and the amount was split across separate spans, so the screen reader read the amount without the currency and without the minus (a debt sounded like income). The aggregating aria-label provides a coherent, localized readout.

## 2026-05-17 01:00 — initial-release

- What: Initial canonical version shipped under `@klyp/brand`.
- Why: Amount typography composite (currency + integer + cents). Was duplicated 3x in balance-triad / main-screen / review-screen — now one canonical primitive as part of the /referrals catalog promotion wave 2026-05-17.

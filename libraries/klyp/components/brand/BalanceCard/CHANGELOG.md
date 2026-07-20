# BalanceCard — changelog

## 2026-06-05 — blob-clip-path-top-left

- What: Added `clip-path: inset(0 round var(--r-section))` to `__blobClip` in BalanceCard.scss.
- Why: `overflow: hidden` on the clip wrapper did not reliably clip the `filter: blur()` spread at the top-left corner. The blur pixel output extends beyond the element's border box, and browsers don't consistently honour `overflow: hidden` for that overflow. `clip-path` clips the painted output (blur included), fixing the corner bleed. Complements the existing `-webkit-mask` Safari fix — both stay in place.

## 2026-06-05 — ios-safari-blob-clip

- What: Wrapped the hover glow `__blob` in a new rounded clip layer `__blobClip` so the blurred glow can't bleed past the card's corners on iOS/Safari. The wrapper gets `border-radius: inherit; overflow: hidden;` + a self-mask `mask: linear-gradient(#000 0 0)`, and now owns the hover fade (`opacity 0→1`) and the `plus-lighter` blend (moved off `__blob`, primary card only). `__blob` keeps only the offset/size/`filter: blur(--blur-32)`/radial-gradient. TSX wraps `<span __blob>` inside `<span __blobClip>`.
- Why: design review — same class of bug as MeshButton. `__blob` has a `filter` so it's a composited layer; on iOS/Safari `overflow: hidden + border-radius` on the card host does NOT clip a composited descendant, so the glow spilled outside the rounded card on hover (Chromium clipped fine). A self-mask forces WebKit to flatten + apply the rounded clip. Placed on `__blobClip` (not the host) so the card's drop `box-shadow` (lift) isn't masked away; the `plus-lighter` blend is moved to the wrapper so the primary card's additive glow is preserved (wrapper blends with the card as one group, same as the bare blob did). Verified in catalog (Chromium): `__blobClip` radius 16px / overflow hidden / mask set / plus-lighter on primary; `__blob` blur 32px, no blend; host box-shadow intact; no rest-state regression. iOS itself needs a device check (preview is Chromium).

- What: Added 7 catalog stories — Zero, Loading, LargeAmount, LongLabel, MinimalNoSub, ErrorState, HoverGlow — and wired the previously-empty `[data-loading]` SCSS rule to a skeleton-pulse over the amount slot.
- Why: Catalog reader couldn't see the full UX state matrix from the existing 6 stories (Default/Tones/Primary/WithAction/Triad/IntegerOnly). Production usage covers fetch-loading, zero-balance, error fallback, and long-label wrap — all now demonstrated.

## 2026-05-17 01:00 — initial-release

- What: Initial canonical version shipped under `@klyp/brand`.
- Why: Fintech balance card with status-dot eyebrow + multi-style amount + action slot. Lifted from /referrals balance-triad as part of the catalog promotion wave 2026-05-17.

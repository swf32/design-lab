# CryptoLogo — changelog

## 2026-06-18 13:51 — add-payout-networks

- What: Added four chain glyphs to `CryptoTicker` — `SOL` (Solana), `POL` (Polygon), `BASE` (Base), `ARB` (Arbitrum) — with brand-accurate inline SVGs (useId-namespaced defs) wired into `resolveLogo`. Stories `argTypes` + `Tickers` story extended; surfaced on `/components/icons` (catalog `CRYPTO_TICKERS`).
- Why: DEV-920 — the new USDC payout provider settles on Ethereum / Solana / Polygon / Base / Arbitrum, so the design system needs those network logos. Glyphs mirror the canonical withdraw-flow reference (`apps/web/.../withdraw/shared/components/crypto-logo.tsx`).

## 2026-05-17 01:57 — export-cryptoglyph

- What: Extracted the inner `<svg>` renderer into a named export `CryptoGlyph` (with `CryptoGlyphProps extends SVGProps<SVGSVGElement>`). The wrapping `<CryptoLogo>` now passes `className="klyp-CryptoLogo__svg"` to it; behaviour identical for existing consumers.
- Why: `/components/icons` catalog needs each ticker as a pure `<svg>` so the tile can renderToStaticMarkup + copy raw SVG markup. Surfacing a clean export beats reaching into the wrapper or duplicating SVG paths in the catalog file.

## 2026-05-17 01:00 — initial-release

- What: Initial canonical version shipped under `@klyp/brand`.
- Why: Brand-accurate USDT/USDC/TRX/ETH crypto glyphs with optional network badge overlay. Lifted from withdraw drawer as part of the /referrals catalog promotion wave 2026-05-17.

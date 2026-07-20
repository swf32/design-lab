# ProviderIcon — changelog

## 2026-06-18 12:39 — add-xai-grok-provider

- What: Added a branded `xai` key to `ProviderKey` / `PROVIDER_LABELS` /
  `PROVIDER_ORDER` plus an `XaiLogo` (the xAI Grok Aurora two-slash mark,
  `currentColor`). Retired the chat-side temporary `GrokMark` override and the
  `inferProvider('x-ai/…') → 'other'` fallback — Grok now routes through
  `ProviderIcon` like every other provider, so the catalog Providers grid and
  the landing-3 model strip pick it up automatically.
- Why: `x-ai/*` (Grok) models shipped 2026-06-01 without a branded picker icon
  (tracked in `ai-providers.md`). Promoting `xai` to a first-class provider key
  removes the documented-temporary crutches.

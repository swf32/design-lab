# StatusDialog — changelog

## 2026-06-17 16:03 — control-height-36-to-40 (DS baseline)

- What: dialog close ✕ button 36×36 → 40×40 (the Figma-pinned 36px value lifted to the new baseline).
- Why: DS-wide control-height baseline bump 36→40 (`control.size.lg`; see @klyp/tokens CHANGELOG). Kept the close icon-button in parity with every other close/icon-button square (ComponentsLayout drawer-close, lightbox download, message-image overlay) that moved to 40px. Revert if the Figma 36×36 spec must hold.

## 2026-06-17 12:03 — initial

- What: New branded molecule — a centered status / outcome dialog
  (tone-tinted icon + heading + emphasised lead line + muted detail + up to
  two actions) built on `<Modal>` (inherits scrim, corner ✕, backdrop/ESC
  dismiss, focus trap, mobile sheet). First instance is the "Payment Failed"
  popup (Figma Development file, node 4:16). Added `CardRemoveOutline` to
  `@klyp/icons`; the `Contact Support` action calls `openKlypSupport()`
  (Chatway util).
- Why: DEV-919 — reusable "popup с неуспехом" with a Contact Support escape
  hatch, adapted from the Figma popover into the Klyp design system (Geist
  SemiBold → medium per styles.md; red filled illustration → outline glyph
  tinted with the `status-danger` token).

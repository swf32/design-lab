# MediaAttachTrigger — changelog

## 2026-07-03 21:30 — MediaAttachKind += 'document'

- What: Added `'document'` to `MediaAttachKind` (→ `FileDocGlyph`) for text-model
  attach targets (PDF/DOC/etc). `arrangeStack` caps at 3 glyphs defensively.
- Why: text models (Gemini) accept documents — the single-target drag surface
  needs a document glyph.

## 2026-07-03 17:20 — onActivate (collapsed entry → split-panel picker)

- What: New `onActivate` prop. When set, the pill is a plain button that calls
  it on click (no dropdown) — the collapsed entry that expands into
  `AttachModePicker`. `modes` may be empty in this mode.
- Why: The dropdown is retired in the composer in favour of the split-panel
  picker; the pill is now just the collapsed state (Val).

## 2026-07-03 16:48 — back to the old pill metrics + folded into the group

- What: Reverted to the old AttachmentSlot empty-pill metrics — height 44→36px
  (`--control-size-md`) and 2px→1px dashed stroke (`--bw-default`). The trigger
  is now rendered by `AttachmentSlotGroup` (via its `chooser` prop) as the
  empty state, so the composer no longer switches between two components.
- Why: Val prefers the old pill's 1px stroke + shorter height; and the split
  across two components (trigger vs slot group) was duplicating the empty-state
  logic and made the swap abrupt.

## 2026-07-03 15:58 — controlled open (composer drop→dropdown)

- What: Added controlled `open` / `onOpenChange` props (threaded to the mode
  DropdownMenu) so a host can open the mode dropdown programmatically.
- Why: The chat composer opens the mode menu after a file is DROPPED (drop on
  the field or the pill → still must pick a mode) — needs to drive open state.

## 2026-07-03 15:34 — dimmer-rest-flat-weight-no-focus-ring

- What: Glyph stack dimmer at rest (opacity 80%→40%, still lifts to 100% on
  hover/focus). Label weight is now a flat 400 always (dropped the 500→400
  hover shift). Removed the solid focus-visible outline — focus reuses the
  hover lift instead.
- Why: Val — icons weren't dim enough at rest, the bold→light text flip was
  wrong (always 400), and the extra solid ring on focus looked cringe.

## 2026-07-03 15:20 — attachmentslot-style-and-hover-motion

- What: Adopted the AttachmentSlot empty-cell look — inset depth ring
  (`inset 0 0 space-10 space-4 bg-root`), canvas fill, and the hover treatment
  (text → fg-primary + lighter weight, dashed edge → border-strong, lift to
  bg-surface, ring drops, glyph stack opacity 80%→100%) — but at a 2px dashed
  stroke. Added hover motion (reduced-motion gated): 3-up sides spread ±2px &
  stay dropped while the centre lifts more; 2-up sides spread apart; 1-up gets
  a slight scale + ~7° tilt.
- Why: Val wants this to read like the attachment slots (same tactile hover)
  and a little life on hover.

## 2026-07-03 15:02 — filetype-glyphs-and-arc

- What: Swapped the generic outline icons for the bespoke duotone file-type
  glyphs (`FileImageGlyph` / `FileVideoGlyph` / `FileAudioGlyph`) and dropped
  the manual tile chrome (the glyphs are already media-card marks). Border
  radius 16→10px. 3-up stack now reads as an arc — sides nudged +2px down,
  centre −2px up (was a single lone raised glyph). Adaptive story is now a
  slider-resizable slot (Button-style) instead of three fixed-width frames.
- Why: Val — outline icons were wrong (we have real file-type glyphs), the
  lone-raised-centre looked off, 16px was too round, and the fixed-frame
  adaptive demo wasn't controllable.

## 2026-07-03 14:27 — new-component

- What: New brand molecule — media-aware "meta" attach entry point. 44px-tall
  dashed control (up from the 36px empty pill) with 2px stroke, a splayed
  media-kind icon stack (1 → straight, 2 → ±10°, 3 → centre raised + ±10°), an
  adaptive label, and a mode dropdown (Start&End frames / References / …).
  Presentational — caller resolves `mediaTypes` + `modes` from the model
  metadata (`getVideoImageCapability`).
- Why: The current per-mode empty pills are 36px (barely tappable on phones)
  and split the mode choice across separate affordances. Val wants one bigger,
  touch-friendly button that reads the model's accepted media and folds the
  Start&End ↔ Reference choice into a dropdown. Branch `new-meta-composer`
  variant — not yet wired into the live composer.

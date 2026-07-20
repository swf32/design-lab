# AttachmentSlotGroup — changelog

## 2026-07-05 13:35 — AttachModePicker fits a short (~107px) composer

- What: Panels + Cancel go `min-height:0` (fill, don't force 80px), tighter
  padding (`space-6`) + gap (`space-2`), `overflow:hidden`, glyph 28→24 — so the
  glyph + label + caption stop clipping vertically when the composer is short.
- Why: Val — text half-clipped at a 107px composer height.

## 2026-07-05 12:40 — reference = Add cell (no dup); single-mode chooser reveal

- What: Reference mode no longer has a separate empty square/pill — it's always
  ref tiles + the wide 2:1 "Add up to N…" cell (0 items included), killing the
  duplicated "Reference" word. New `chooser.singleMode`: a single-mode (optional
  frames-only / reference-only) chooser expands its collapsed pill straight to
  the slots HERE (multi-mode still uses the composer overlay).
- Why: Val — "Reference" was printed twice; reference cell should match Add;
  and the pill (not bare slots) is the empty affordance when attach is OPTIONAL.

## 2026-07-05 12:00 — empty frames/reference slots are SQUARES + (required)

- What: The empty Start/End (frames) and Reference cells no longer render as the
  little rectangular PILLS — they're now 80px SQUARES (matching the filled
  tiles) with an image file-glyph + Start/End (or Reference) label. New
  `requiredCaption` prop shows "(required)" under the empty squares for models
  that demand an input (Grok 1.5). The rectangular pill now belongs ONLY to the
  chooser (which isn't a mode). Dropped the pill/anyFilled shape branch.
- Why: Val — the small pills read poorly; squares + required caption match the
  Grok 1.5 single-mode-required example.

## 2026-07-03 21:30 — AttachModePicker: 'document' kind + 3-glyph cap

- What: AttachModePicker maps the new `'document'` MediaAttachKind → `FileDocGlyph`
  and caps its splay at 3 glyphs (defensive for 4-kind text models). Enables the
  single-target text-model attach surface.
- Why: text models accept documents (#4b).

## 2026-07-03 21:05 — stories: Chooser, ReferenceAddCell, BothModes (#3 preview)

- What: New `AttachModePicker.stories.tsx` (Default / WithCancel / Reject /
  ThreeModes) + registered `attach-mode-picker` in the catalog. Added
  AttachmentSlotGroup stories: `ReferenceAddCell` (new Add cell), `Chooser`
  (collapsed pill), and `BothModes` — the #3 groundwork PREVIEW showing a
  Start/End lane + a Reference lane together (composed until the backend ships
  the simultaneous-mode capability).
- Why: Val — "много нового сделали, обнови стори" + a preview of both modes.

## 2026-07-03 20:40 — reference "Add" cell: formats + dynamic caption + video-ref fix

- What: New `addFormats` + `addCaption(remaining)` props → the reference Add cell
  shows the accepted-format glyphs + a dynamic "Up to N images" caption
  (recomputed from `max − filled`). Fixed the empty-state test to count video
  clips too: a lone video ref no longer leaves the image row showing the empty
  "Reference (up to N)" pill with no Add cell.
- Why: Val — after attaching a ref, the pill was pointless + the Add cell was
  missing; the Add slot should state formats + remaining, dynamically.

## 2026-07-03 20:05 — reject shake on incompatible drop

- What: AttachModePicker gains `rejectedPanel` — a file dropped on a panel that
  doesn't accept its kind shakes that panel (one-shot, reduced-motion gated);
  the host clears it + dismisses shortly after. New keyframes
  `klyp-AttachModePicker-shake`.
- Why: Val — dropping on a dimmed Start/End needed feedback, not silence.

## 2026-07-03 18:40 — Cancel block + drag-out dismiss fix

- What: AttachModePicker gains a narrow Cancel block (right side, ~15%) — click
  OR drop on it to back out. Reworked the drag model: panels no longer own the
  drop or `stopPropagation` (that broke PromptField's drag counter, so dragging
  a file back OUT never dismissed the surface — bug). They now only report the
  hovered target (`onHoverTarget`); the field handles the single drop + routes
  by it. New chooser fields `onHoverTarget` / `onCancel` / `cancelLabel`;
  dropped `onDropToPanel`. Exported `CANCEL_ID`.
- Why: Val — two bugs: (1) drag a file in then out → panels stayed; (2) click
  the pill → panels with no way to cancel. Both fixed.

## 2026-07-03 18:14 — expanded picker moved to a composer-level overlay

- What: The expanded split-panel picker is no longer rendered inside the group —
  it's now a composer-level full-field overlay (brand Composer → PromptField
  `dropSurface`). The group is back to two empty→filled states: the collapsed
  chooser pill ↔ slot layout (crossfade). Dropped the `data-has-chooser`
  full-width hack + `onDragActive` from the chooser config.
- Why: Val — the mode panels must take over the whole composer (prompt + footer
  hidden), not sit in the attachment sub-area.

## 2026-07-03 17:38 — chooser spans full composer width

- What: With a `chooser`, the group root goes full width (`data-has-chooser` →
  `display:flex; width:100%`) and the animated layer stretches — so the expanded
  split-panel picker fills the composer edge to edge instead of hugging content.
  Collapsed pill keeps its natural size; non-chooser consumers stay hug-content.
- Why: Val — the mode picker must read at the composer level, full width.

## 2026-07-03 17:20 — split-panel mode picker (AttachModePicker)

- What: New `AttachModePicker` (co-located) — the mode DROPDOWN is replaced by a
  split-panel chooser: one dashed dropzone panel per mode, each showing the
  media kinds it accepts (splayed file glyphs), the mode name, and a caption
  ("First + last keyframe" / "Up to 9 images"). Per-panel drag: reads the drag
  TYPE (image/video, not the bytes — a browser limit) → compatible panels
  accent-highlight, incompatible ones dim + swap the caption to a "supported
  types" warning. Click or drop-compatible picks the mode. The `chooser` prop
  is now a rich config (collapsed pill ↔ expanded panels, `expanded` +
  `onExpandedChange`, `onPick`, `onDropToPanel`, `incompatibleLabel`); empty
  state now animates collapsed → expanded → slots.
- Why: Val — the dropdown looked poor and hid the modes; the split panels show
  each mode, its file types, and its short description up front.

## 2026-07-03 16:48 — owns empty-state chooser + crossfade

- What: New optional `chooser` prop (Omit<MediaAttachTriggerProps,'disabled'>).
  When present AND every lane is empty, the group renders the
  `MediaAttachTrigger` (media-aware mode pick) as its empty state and
  crossfades (Motion `AnimatePresence` + `layout` height tween, reduced-motion
  gated) to the slot layout once a lane fills. Lanes moved under a `__lanes`
  wrapper to keep their column gap under the new motion node.
- Why: Unify the empty-state — previously the composer switched between
  MediaAttachTrigger and AttachmentSlotGroup (two components → abrupt swap).
  One component now owns both states so the transition can animate (Val).

## 2026-07-02 16:04 — catalog-stories-and-registry-entry

- What: Added `AttachmentSlotGroup.stories.tsx` (CSF3, args-driven — FramesEmpty pills / FramesFilled tiles+swap / Reference tiles+add / List with videoClips+otherFiles lanes, local /model-samples thumbs) and registered the component in the catalog (`attachment-slot-group`, stable brand-molecule).
- Why: Phase 5 of the composer componentization (spec 2026-07-02 §10.2) — the Group was an "undercomponent" (no stories, no catalog entry, violating the ≥3-stories rule); registering it makes the Composer → AttachmentSlotGroup → AttachmentSlot chain visible in components-used.

## 2026-06-29 04:23 — slot-aware-frames-and-otherfiles-lane

- What: Frames mode now renders BY explicit keyframe slot (new `slot?` field on AttachmentItem + a `bySlot` array with positional fallback) so a single image swapped to End visibly moves cells, and added a per-empty-cell drop callback `onDropToSlot(slotIndex, files)`. Also added an `otherFiles` file-card lane for non-media inputs and split labels into descriptive pill text (`start`/`end`) vs short tile/square badges (`startBadge`/`endBadge`).
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-28 15:08 — square add-slots + swap on one-filled

- What: Add-dropzones are now SQUARE with a `+` (`AddOutline`) instead of pills:
  the reference-empty slot (`R1`/`R1'`) and the list-mode add. The frames swap
  button now shows whenever the 2-slot layout has ≥1 filled (`slots >= 2`, was
  `items.length >= 2`) — Start-only can swap into End.
- Why: Val — the pill "Add" with a tiny icon was barely visible; a square `+`
  matches the empty-square slot. Swap belongs on one-filled too (swaps Start↔End).

## 2026-06-28 11:12 — creation

- What: New brand layouter `@klyp/brand` → `AttachmentSlotGroup`. Composes N
  keyed `AttachmentSlot` cells into the three VideoReference layouts
  (`frames` / `reference` / `list`) selected via `data-mode`, plus the
  video-clip lane (`&__clips`), the start↔end swap button (DS `Button`
  `icon-sm`), and the add-dropzone. Pure presentational — capability
  resolution (supportsImageInput / effective `max`) stays at the caller;
  `max <= 0` renders `null` (G2). Frames render filled tiles + trailing
  empty-square dashed slots; reference renders an empty pill (single vs
  "up to N") or tiles + Add tile below cap; list renders self-resolving
  file/image/video cards + optional Add pill. Disabled propagates on BOTH
  layers (root `data-disabled` + every child `disabled`/`isDisabled`) so the
  dim rule is live. SCSS is ~25 lines of flex-row chrome only — all tile /
  pill / badge / spinner / remove / status-ring styling is inherited from
  AttachmentSlot.scss (zero duplicate tile CSS). Tokens only.
- Why: Put every VideoReference state on the one `/components/attachment-slot`
  page without folding `items[] + mode + clips + swap` into the cell atom
  (which would make it a god-component re-implementing layout it doesn't own).
  A thin layouter reuses 100% of the cell's chrome and preserves
  seamless-identity (tiles are keyed cells → mode/badge/status changes never
  remount the `<img>`/`<video>`).

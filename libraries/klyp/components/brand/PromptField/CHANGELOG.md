# PromptField — changelog

## 2026-07-03 20:05 — hideDropOverlay (re-added)

- What: Re-added `hideDropOverlay?: boolean` — suppresses the built-in
  "Drop … here" overlay even with no `dropSurface`, for hosts that own their
  attach UI (chat video models: the slot group once filled).
- Why: The old overlay shouldn't appear when files are already attached.

## 2026-07-03 18:14 — dropSurface (custom full-field drag/expand surface)

- What: New opt-in `dropSurface?: ReactNode` + `showDropSurface?: boolean`. When
  a `dropSurface` is given it renders IN PLACE of the built-in "Drop … here"
  overlay — absolute, covering the whole field — while a file is dragged over OR
  `showDropSurface` is set. Unlike the scrim overlay it's interactive (solid
  composer bg, takes clicks + drops). Default off — existing callers unchanged.
  New `.klyp-PromptField__dropSurface` style (inset:0, field padding, fade-in).
- Why: The chat composer turns the whole composer into the split-panel mode
  picker on drag or a pill click — prompt + footer stay in flow underneath
  (preserving height) while the panels fill the field (Val).

## 2026-07-03 14:59 — mention pill sizing polish

- What: the pill no longer grows the text line — was 22px (16px thumb + 4px
  padding + 2px border, line-height 1.3) vs the 21px text line box. Now
  line-height 1 + 2px padding + 1px border → 19px (text) / 20px (thumb, shrunk
  16→14px), both inside the line box; `vertical-align: middle`. Radius 10
  (`--r-chip`) → 6 (`--radius-sm`), matching the thumbnail's corner. Thumbnail
  pills (`:has`) get `padding-left` = the vertical padding (2px) so the image
  sits with a uniform tight inset top/left/bottom (avatar-chip look); only the
  trailing text keeps the 6px right breathing room. Text-only pills stay 6px L/R.
- Why: design review — chip was taller than the text; and the leading thumbnail
  should hug with an even inset, not the wider text padding.

## 2026-07-03 14:52 — inline mention PILLS (opt-in TipTap rich mode)

- What: `PromptField.Textarea` gains a `mentions` opt-in that swaps the plain
  `<textarea>` for a lazily-loaded TipTap surface (`RichTextarea`) where a
  picked `@`-mention renders as an inline PILL (thumbnail + kind-tinted label,
  no `@`) instead of `@Name` text. Backspace immediately after a pill reverts
  it to editable `@label` text (reopening the picker). Still a controlled
  plain-string field — serialises mentions back as `@label` so the model sees
  the same prompt; external string changes (clear/prefill/dictation) round-trip
  in unchanged. New `onMentionCommand` prop surfaces the editor's insert command
  so the consumer's own `<MentionPicker>` drives the pill. New files:
  `RichTextarea.tsx`, `prompt-mention.ts` (brand-local TipTap Mention),
  `prompt-field-context.ts` + `PromptField.types.ts` (extracted to break the
  lazy-import cycle). Plain-textarea callers are unchanged and ship no TipTap
  (verified: a separate `RichTextarea-*.js` chunk holds ProseMirror).
- Why: design ask — a mentioned asset (character/location/media) should read as
  a distinct chip in the prompt, not raw text; the chat composer now opts in.

## 2026-07-02 15:32 — stories doc-comment: Submit is the DS Button, not MeshButton

- What: `PromptField.stories.tsx` meta docs claimed "Submit uses `<MeshButton>`" — corrected to the DS `@klyp/ui` `<Button>` (accent idle / secondary Stop), which has been the actual submit since 2026-06-30.
- Why: Phase-4 composer cleanup (spec 2026-07-02 §5) — stale-doc sweep.

## 2026-07-02 14:11 — Submit soft-disable + tooltip + placeholder pulse; iconOnly busy a11y; type re-export

- Files: `PromptField.tsx`, `PromptField.scss`, `index.ts`.
- What: (1) new optional `PromptField.Submit` prop `disabledHint?: string` —
  when the submit would be natively disabled in the idle state (failed
  `canSubmit` gate, NOT busy/streaming/error) and the hint is set, the disable
  turns SOFT: `isDisabled=false` (hover/focus still fire), press blocked,
  `aria-disabled` + `data-soft-disabled`, wrapped in the DS `@klyp/ui` Tooltip
  (same pairing as AttachmentSlot's status badge — RAC TooltipTrigger adds no
  wrapper element) showing the hint. SCSS mirrors the native disabled look
  (`--opacity-70` — the same in-context dim the `&[data-disabled]` submit
  override uses, NOT `--opacity-disabled`/0.5; not-allowed cursor) and
  neutralises hover fill / press translate / glyph zoom. Without `disabledHint` — byte-for-byte the legacy
  native-disabled behaviour (chat unchanged). (2) Placeholder pulse: hovering
  the soft-disabled submit pulses the textarea `::placeholder` opacity
  (`:has([data-soft-disabled]:hover)` on the field root, keyframes
  `--opacity-90 ↔ --opacity-40`, gated by `prefers-reduced-motion`). (3)
  iconOnly busy a11y fix (spec §11.5.7): in iconOnly mode `aria-label` now
  swaps to `busyLabel` while busy — before, `busyLabel` in iconOnly was dead
  (neither rendered nor announced). (4) `InferMimeFromName` re-exported from
  the public barrel (was deep-import-only from `./file-accept`; it appears in
  public prop sigs — spec §11.5.10).
- Why: spec 2026-07-02 §5 Phase 2 (Val: tooltip + pulse on the inactive
  submit ship with the Composer inversion, not as a separate track) — a
  natively-disabled button swallows hover, so the "why can't I send?" hint was
  impossible without the soft-disable mechanic. Composer threads its
  `submitHint` prop into `disabledHint`; chat passes no new props yet and keeps
  the exact legacy behaviour.

## 2026-07-02 13:29 — drop overlay: match the library drop look (white, not gold)

- What: the drag-over overlay now mirrors the LibraryPicker's whole-modal drop
  overlay one-to-one: `UploadOutline` icon (32px — the modal uses 40, composer
  is a smaller surface) stacked above the label, dashed frame
  `var(--bw-emphasis) dashed var(--color-fg-primary)` (was `--alpha-white-50`),
  wash `color-mix(in srgb, var(--color-bg-surface) 88%, transparent)` (was
  `--alpha-black-40` + backdrop blur — blur removed), fade-in on mount
  (`--duration-fast` / `--easing-standard`, off under `prefers-reduced-motion`).
  Label colour `--color-accent` → `--color-fg-primary` (white on klyp dark,
  dark on unreals light); 14px medium kept. Radius stays `inherit` (the overlay
  hugs the 18px composer chassis).
- Why: Val — the composer drop overlay lit up gold ("желтым подсвечивается");
  the library's drop overlay already settled on the white dashed frame ("the
  gold dashed frame read as cheap") — the two drop surfaces should read as one
  family.

## 2026-06-30 13:40 — Submit: MeshButton → DS @klyp/ui Button (accent idle)

- What: the Submit subcomponent now renders the DS `<Button>` (`@klyp/ui`) instead
  of `MeshButton`. State→variant: idle = `variant="accent"` (brand glow CTA),
  streaming/Stop = `variant="secondary"` (silver/neutral surface), error/Retry =
  `variant="accent"` (matches the old MeshButton error, which stayed on its accent
  tone). Icon-only mode uses DS `size="icon"` (36px control-size-md square,
  padding:0); text mode uses `size="md"`. Busy/disabled preserved via `isDisabled`.
  All `data-slot="prompt-field-submit"`, `data-state`, `data-icon-only`, `aria-label`,
  `onPress` preserved. SCSS re-pointed from `.klyp-MeshButton[...]` to `.klyp-Button[...]`:
  kept the 36px square + `padding-inline:0` + 14px glyph; the central hover-zoom is now
  `scale(1.15)` on the DS Button's direct `> svg` glyph (no translateX to cancel — the
  DS Button has no MeshButton-style content shift), `transform-origin: center` so it
  zooms in place; gated under `prefers-reduced-motion`.
- Why: Val 2026-06-30 — "not MeshButton — just an active Button, with all the states it has."

## 2026-06-30 10:23 — icon-only submit glyph → 14px

- What: the icon-only submit glyph size `--icon-size-lg` (24) → `--space-14` (14px)
  for both the send arrow and the Stop — a small glyph centred in the 36px square.
  (No 14px icon-size token exists; 14 sits between icon-size xs=12 and sm=16, so the
  `--space-14` primitive carries it.)
- Why: Val — make the icon smaller (14×14).

## 2026-06-30 10:17 — icon-only submit: central hover zoom (no rightward drift)

- What: on the icon-only submit, the hover/press content `translateX(+2px)` is now
  `transform: none`, so the glyph zooms in place. MeshButton shifts content right on
  hover for the icon-on-LEFT (icon + label) pattern; a square icon-only button has no
  label to lean toward, so the glyph drifted right. The svg's own `scale(1.15)`
  (transform-origin: center) is untouched → it grows centred.
- Why: Val — the square submit's icon should zoom centrally on hover, not slide right.

## 2026-06-30 09:57 — icon-only submit: bigger glyph + kill the squish

- What: the `[data-icon-only]` submit now sizes its glyph to `--icon-size-lg` (24px)
  in the 36px square, and the `padding-inline: 0` rule was qualified with
  `:has(.klyp-MeshButton__content > svg)` so it actually wins. MeshButton adds 16px
  icon-side text-padding for an `svg:first-child` / `svg:last-child`; an icon-ONLY
  button's lone svg is BOTH → 32px of padding squished the content to ~4px and
  clamped the glyph to ~12px (max-width:100% of the squished parent). The `:has()`
  lifts our selector to (0,5,1) to beat MeshButton's (0,4,1).
- Why: Val — make the composer's send glyph bigger inside the button.

## 2026-06-30 09:20 — Submit `iconOnly` (square) + silver streaming Stop

- What: added an `iconOnly` prop to `PromptField.Submit`. When set, the button
  renders ONLY the icon (children for idle, the built-in `StopOutline` /
  `RotateCcwOutline` for streaming / error) with no visible text — `label`
  becomes the accessible name — and the streaming Stop switches to `tone="neutral"`
  (silver) to de-emphasise vs the gold CTA. SCSS squares it
  (`[data-slot='prompt-field-submit'][data-icon-only]` → width = `--control-size-md`,
  `padding-inline: 0`). Labelled consumers are unchanged (default `iconOnly=false`).
- Why: Val — the composer Generate becomes a square icon button (MagicSparkle glyph,
  no "Generate" word) sitting beside the square mic; the Stop reads silver mid-stream.

## 2026-06-30 07:00 — tile error/warning → AttachmentSlot status badge (no caption)

- What: the `Attachments variant="tile"` row no longer renders a visible
  error/warning caption under each tile (nor the per-tile wrapper column). It
  renders `<AttachmentSlot>` directly; the message is now carried by
  AttachmentSlot's own top-left status badge + hover tooltip. Removed the
  `__attachment--tile` SCSS + the tile-row caption-clip rules. `__attachmentMessage`
  stays for the chip variant only.
- Why: design lead — the under-tile caption ate row space and shoved the
  neighbouring tiles; moving it into the corner badge tooltip frees the row.

## 2026-06-30 06:32 — tile-variant layout fixes + MobileTiles story

- What: (1) tile column width pinned to the tile footprint (`width: min-content`,
  was `max-width: none`) so a long error/warning caption WRAPS under its 80px
  tile instead of widening the column and shoving the neighbouring tiles
  sideways; (2) clear-all trash `align-self: center` → `flex-start` +
  `margin-top: var(--space-20)` so it sits centred on the TILE, not dragged
  below the row by the caption; (3) new `MobileTiles` story — 320px pane, full
  tile row in every state.
- Why: design lead — in the AttachmentStates row the «Too large — max 50 MB»
  caption stretched its column and pushed the next tile away, and the trash
  floated below the tiles; also a mobile tile state was missing from stories.

## 2026-06-30 06:13 — tile-variant → AttachmentSlot (AssetAttachmentBlock removed)

- What: the `Attachments variant="tile"` row now renders `<AttachmentSlot>` per
  attachment (image tile / file card, with AttachmentSlot's own status ring +
  spinner + remove ×) instead of `<AssetAttachmentBlock>`. The obsolete
  `__tileWrap` / `__tileSpinner` SCSS and the `Spinner` import are gone; the
  visible error/warning caption below each tile is kept (AttachmentSlot only
  surfaces `message` as a title tooltip). Drop-overlay label colour
  `--gold-800` → `--color-accent` (iris). Stories gained playground
  `args` / `argTypes` and refreshed copy (50 MB cap, not 25; no "image-only").
- Why: consolidate all attachment rendering onto `AttachmentSlot` —
  `AssetAttachmentBlock` (and its only other, dead consumers `AttachmentTray` +
  `AssetAttachmentsDisplay`) was deleted, and its `AssetAttachment` type moved to
  `@klyp/brand/prompt-input` so the studio editor stack keeps a stable home.

## 2026-06-29 04:23 — attach-button-uses-ds-button

- What: Rebuilt the AttachButton on the DS <Button variant='primary' size='icon'> (replacing the raw <button>, onClick→onPress, disabled→isDisabled) with a 22×22 AddOutline glyph, and swapped the hand-rolled inline close SVG in the attachment chip for the CloseCircleOutline icon.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-24 14:57 — attach button icon-lg → icon (40px)

- Files: `PromptField.tsx`
- What: the AttachButton DS Button size `icon-lg` → `icon` (both render paths) —
  the control is now 40px (control-size-md).
- Why: design-lead.
- Verified live (`/components/prompt-field`): attach button 40×40.

## 2026-06-23 17:43 — attach (+) button → DS Button (icon-lg)

- Files: `PromptField.tsx`
- What: the attach button now renders the DS `<Button variant="primary"
  size="icon-lg">` (with a 22px `AddOutline` child; the Button's `> svg` rule
  sizes it to `--icon-size-md`) instead of `<IconActionButton>`. 1:1 with the
  composer's other `klyp-Button[data-size='icon-lg']` controls.
- Why: design-lead ("сделай буквально как этот элемент … с таким же размером
  иконки и остальным поведением") — match the DS Button icon-lg exactly.

## 2026-06-23 17:22 — attach (+) button variant ghost → primary

- Files: `PromptField.tsx`
- What: the attach `IconActionButton` is now `variant="primary"` (filled white
  surface, dark glyph) instead of `ghost` (transparent).
- Why: design-lead ("сделай IconActionButton в варианте Primary").

## 2026-06-23 17:01 — attach (+) button → DS IconActionButton

- Files: `PromptField.tsx`, `PromptField.scss`
- What: the attach button was a bespoke `<button class="klyp-PromptField__attach">`
  (surface-solid chip + border) → now renders the DS `<IconActionButton>`
  (`variant="ghost"`, `size="lg"`, `icon={AddOutline}`), so it's 1:1 with the
  design-system icon button (radius, white icon @60%→100% hover, hover wash,
  focus ring, built-in tooltip). `__attach` SCSS stripped to a `flex-shrink: 0`
  layout hook; `data-slot` + className passthrough preserved.
- Why: design-lead ("сделай визуально 1-в-1 как icon button") — DS-native icon
  button instead of a one-off chip.

## 2026-06-23 16:20 — chassis background ~30% → ~90% opaque

- Files: `PromptField.scss`
- What: the composer chassis background went from `--color-bg-rail`
  (#141414 @ 30% glass) to `color-mix(in oklab, var(--color-bg-surface) 90%,
  transparent)` (≈90% opaque). The `--fx-glass-blur-lg` (24px) backdrop blur
  and 1px inset border are unchanged — a hint of depth remains.
- Why: design-lead — the prompt field read as too see-through over busy page
  content; bumped to ~90% opacity for legibility while keeping a touch of glass.

## 2026-06-18 15:01 — attach button glyph → plus (Add)

- What: the footer AttachButton trigger glyph `ExportUpOutline` → `AddOutline` (a `+`). Import swapped accordingly.
- Why: design lead wants the attach affordance to read as a simple `+` (the comment already called it "file picker `+`"); `@klyp/icons` `AddOutline` is the brand outline plus (filled-path, `currentColor`), so it matches every sibling glyph rather than inlining a raw stroke SVG. The dropdown menu's "Upload from computer" item is unaffected.

## 2026-06-17 23:08 — composer-tile-tray-overflow-fix

- What: tile-variant attachment tray switched from `overflow-x: auto` to `flex-wrap: wrap` + `overflow: visible`, and the `__attachment--tile` tile-to-caption gap went 4px -> 8px (`--space-8`).
- Why: `overflow-x: auto` forced `overflow-y` to compute as `auto`, clipping the per-attachment warning caption below a tile; wrapping keeps it legible (design lead 2026-06-18).

## 2026-06-17 16:03 — footer-controls-36-to-40 (control-height baseline)

- What: footer control heights 36px → 40px — Select trigger, Submit MeshButton (`[data-slot='prompt-field-submit']`), AttachButton `+` (36×36 → 40×40), and the Select popover item min-height. Clear-all tile button moved off the `calc(--space-32 + --space-4)` hack onto the real `var(--space-40)` primitive. Comments refreshed.
- Why: DS-wide control-height baseline bump 36→40 (`control.size.lg`). The `data-slot="prompt-field-footer"` row and its buttons now stand 40px tall — the named target of this change.

## 2026-05-27 23:16 — enter-newline-on-touch

- What: plain Enter inside the textarea no longer submits on touch devices (`matchMedia('(pointer: coarse)')`) — inserts a newline instead. Cmd/Ctrl+Enter still submits everywhere; desktop Enter behaviour unchanged.
- Why: mobile virtual keyboards don't expose Shift+Enter, so users had no way to add a line break — every Enter sent the prompt. Matches ChatGPT/Claude.ai mobile behaviour.

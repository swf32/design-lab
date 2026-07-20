# AttachmentSlot — changelog

## 2026-07-03 20:52 — "Add" cell: format glyphs + "Add" title + requirements line

- What: New `addFormats` (accepted-kind glyphs, splayed, cell widens to 2:1) +
  `addCaption` (a dim requirements line). The `label` stays the action word
  "Add" (primary); `addCaption` sits below it and states BOTH remaining images
  AND videos ("Up to 8 images or 3 videos"). New `__addFormats`/`__addFormat`/
  `__addCaption` styles.
- Why: Val — the plus alone / images-only caption was unclear; keep "Add" +
  show every accepted format & count.

## 2026-06-30 07:00 — error/warning status badge + toned tooltip

- What: when `status` is `error`/`warning` and a `message` is set, the tile now
  shows a small top-left corner badge (InfoCircle glyph, same 20px footprint as
  the remove ×; red for error, amber for warning) whose hover/focus pops a toned
  Klyp `<Tooltip>` (`tone="danger"`/`"warning"`) carrying the full text. The
  bare `title={message}` native tooltip on the cell is removed.
- Why: design lead — consumers (chat tile row) used to render the message as a
  visible caption under the tile, which ate row space and shoved neighbouring
  tiles; the badge keeps the message one hover away without touching layout.

## 2026-06-29 04:23 — extract-glyphs-to-klyp-icons-filetypes

- What: Extracted the inline GalleryAddGlyph + per-file-type BULK glyph map out to the new @klyp/icons filetypes module (FileDoc/FileSheet/FileAudio/FileImage/FileVideo/FileFolder + GalleryAdd Glyphs), now imported and mapped via an exhaustive fileKind -> component record; rendered DOM stays byte-identical. Net ~-100 lines in .tsx. (Covered by the 2026-06-28 17:34 CHANGELOG entry.)
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-28 17:34 — extract glyphs to @klyp/icons/filetypes

- What: Moved the inline `GalleryAddGlyph` + `FILE_TYPE_GLYPHS` map +
  `FileTypeGlyph` factory out to the new `@klyp/icons` `filetypes.tsx` module
  (`GalleryAddGlyph` + `FileDocGlyph` / `FileSheetGlyph` / `FileAudioGlyph` /
  `FileImageGlyph` / `FileVideoGlyph` / `FileFolderGlyph`). AttachmentSlot now
  imports them and maps `fileKind` → component via an exhaustive `KIND_GLYPH`
  record. Rendered DOM is byte-identical (same paths, fills, viewBox,
  aria-hidden, 24px file glyph / 16-20px empty glyph).
- Why: one canonical home alongside the conversation glyphs, and so the marks
  can be surfaced on the `/components/icons` foundation page.

## 2026-06-28 15:08 — BULK file glyphs (filled), 24px, solid-only (no alpha)

- What: Replaced the outline `FileTypeGlyph` paths with Iconsax **BULK**
  silhouettes (document-text / grid-1 / audio-square / gallery / video-square /
  folder-2). Each renders as `{dim, bright}`: the silhouette is a SOLID
  `--neutral-400` (the bulk `opacity="0.4"` layer converted to an opaque token),
  the marks ride `currentColor`. Bumped the file `kindIcon` from 16px → 24px
  (box + svg). Result: filled "bulk" read, larger, and ZERO alpha anywhere — no
  double-composite even on the XLS grid crossings.
- Why: Val — the outline glyphs were too small to read and the alpha-white
  `--color-fg-subtle` detail still doubled on overlaps; bulk + solid neutral
  fixes both.

## 2026-06-28 02:29 — file-type glyphs + duotone icon fix + thumb fallback

- What: Widened `AttachmentSlotKind` to per-document subtypes (`pdf` / `doc` /
  `xls` / `txt` added alongside `audio` / `document` / `file`). Replaced the
  single `KIND_ICON` Iconsax map with a `FileTypeGlyph` factory rendering real
  per-file-type silhouettes (document-text / grid-1 / text-block / audio-square
  / gallery / video-play / generic page); each glyph is duotone via TWO solid
  colour tokens (primary `currentColor`, detail `--color-fg-subtle`) — never
  `fill-opacity`. Removed the `fillOpacity="0.4"` from `GalleryAddGlyph` (now a
  separate-token duotone). Wired the previously-dead `__thumbFallback` (image /
  video tile with no `thumbnailUrl` renders an outline glyph), and adjusted
  `resolveState` so an explicit `media` with no name promotes to a fallback tile
  while name-only still resolves to the file card.
- Why: Icon owner mandate — per-stroke alpha doubles overlapping outline corners,
  so duotone must use two colour tokens; plus the cell now backs every
  VideoReference state (incl. document attachments and poster-less tiles) so the
  new `AttachmentSlotGroup` layouter can compose it without bespoke tile CSS.

## 2026-06-28 — creation

- What: New brand molecule `@klyp/brand` → `AttachmentSlot`. One cell, five
  render states (empty-pill / empty-square / image / video / file) switched via
  `data-state` on `&__cell`; status (idle / uploading / error / warning) via a
  single `data-status` outline model so rings never collide. Empty look reuses
  the DropSlot canonical; filled image/video = the VideoRef tile (auto "Video"
  badge, image-only replace overlay); file = the 256×80 attachment card with
  per-kind glyph + label. Unified blurred-pill remove × across all filled
  states. Built-in gallery+plus duotone empty glyph; reduced-motion gated.
- Why: Consolidate the three divergent attachment renderings (#1 DropSlot empty,
  #2 VideoRef tile, #3 AssetAttachmentBlock file card) into a single
  implementation-ready molecule per spec, with conflict resolution applied
  (remove-button / status-rings / uploading model → #2; file body → #3).

### Open item

- `256px` file width has no `--space` step — ships as the local var
  `--klyp-attachment-slot-file-w`. Propose adding
  `--size-attachment-card-w: 256px` to `packages/tokens/src/primitives.tokens.json`
  before catalog registration.

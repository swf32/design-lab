# Composer — changelog

## 2026-07-05 20:29 — drop the footer "+" for video models

- Files: `Composer.tsx`.
- What: the footer `PromptField.AttachButton` ("+") is now hidden whenever
  `videoSlots` is present. Video models already carry their own attach
  affordance (AttachmentSlotGroup chooser pill / takeover panels / direct
  slots), so the "+" duplicated it. Text / image models (`attachChooser`,
  drag-only surface, no persistent pill) keep the "+" as their sole click path.
- Why: Val — with our "Add Start & End frames or references" pill on screen the
  "+" is redundant and rings inconsistent.

## 2026-07-05 13:35 — kill the legacy "Drop … here" overlay entirely

- Files: `Composer.tsx`.
- What: `hideDropOverlay` is now ALWAYS on — the chat composer never shows the
  generic overlay. Everything routes through our attach surfaces (split panels /
  single-target / slot group); a model with no attach shows nothing on drag.
  (Direct PromptField consumers — script/visual editors — keep the default.)
- Why: Val — the old overlay should be gone entirely.

## 2026-07-05 13:10 — dropSurface renders for single-mode too (drag)

- Files: `Composer.tsx`.
- What: `dropSurface` now renders for ANY chooser (`chooserActive`), so a
  single-mode chooser's one panel appears as a drag target on drag-over. Only
  `showDropSurface` (force-show without a drag, via pill click) stays
  multi-mode; single-mode's pill click reveals slots in AttachmentSlotGroup.
- Why: single-mode video (Kling 3.0) showed nothing on drag.

## 2026-07-05 12:40 — split-panel overlay is multi-mode only

- Files: `Composer.tsx`.
- What: `multiChooserActive` — the composer-level split-panel `dropSurface` /
  `showDropSurface` now fire only for MULTI-mode choosers. A single-mode chooser
  expands to its slots inside AttachmentSlotGroup instead (no overlay).
- Why: single-mode has no modes to pick — no panel picker needed.

## 2026-07-03 21:30 — attachChooser: text-model single-target drag surface

- Files: `Composer.tsx`.
- What: New `attachChooser` prop (Omit<AttachModePickerProps,'disabled'>) — a
  single-target attach surface for NON-video models (text). Rendered as the
  `dropSurface` (on drag) when there's no video chooser; suppresses the generic
  "Drop … here" overlay too.
- Why: Val — text models (Sonnet/GPT/Gemini) should use our styled attach
  surface (accepted-format glyphs + Cancel), not the plain overlay.

## 2026-07-03 19:10 — footer: two pills (Model + Settings)

- Files: `Composer.tsx`.
- What: The single settings pill in the footer is now TWO — a MODEL pill
  (`section="model"`) and a SETTINGS pill (`section="settings"`), both fed from
  the one `settings` bag (the settings pill overrides its trigger with the bag's
  `settings*` fields). The settings pill is hidden when `settings.hasSettings`
  is false (text modality — no params).
- Why: Val — separate the model picker from the generation settings.

## 2026-07-03 20:05 — suppress the legacy drop overlay for video models

- Files: `Composer.tsx`.
- What: Pass `hideDropOverlay={!!videoSlots}` + thread `chooser.rejectedPanel`
  to the picker. Video models never show the generic "Drop … here" overlay
  (they own the panels / slot group); text models keep it.
- Why: Val — old overlay shouldn't show once files are attached.

## 2026-07-03 18:14 — full-composer takeover: panels ARE the drag/expand surface

- Files: `Composer.tsx`.
- What: For a multi-mode `chooser` on an empty slot row, the Composer passes the
  `AttachModePicker` as PromptField's `dropSurface` and `showDropSurface` =
  `chooser.expanded`. So a file drag OR a pill click turns the WHOLE composer
  into the split-panel mode picker (prompt + footer stay in flow underneath,
  preserving height; the panels fill the field). Panels take the drop.
  (Replaces the earlier `hideDropOverlay` / `onDragActiveChange` approach.)
- Why: Val — the mode choice happens at the composer level, panels filling the
  composer; prompt/footer disappear for the duration.

## 2026-07-03 16:48 — drop the mediaAttach branch (group owns the chooser)

- Files: `Composer.tsx`.
- What: Removed the `mediaAttach` prop + the trigger-vs-slots branch. The
  chooser now rides inside the `videoSlots` bag (`videoSlots.chooser`) and
  `AttachmentSlotGroup` renders/animates the empty-state swap itself. Composer
  just renders `<AttachmentSlotGroup {...videoSlots} disabled={busy} />`.
- Why: One component owns the empty→slots transition (animatable); no duplicated
  switch here (Val).

## 2026-07-03 15:58 — mediaAttach: meta trigger for multi-mode empty state

- Files: `Composer.tsx`.
- What: New `mediaAttach` prop (Omit<MediaAttachTriggerProps,'disabled'>). When
  present AND the `videoSlots` row is empty, renders `<MediaAttachTrigger>`
  instead of the bare AttachmentSlotGroup pills; filling any slot flips back to
  the slot layout. `undefined` → unchanged (single-mode models show their row
  directly). Composer sets the trigger's `disabled` from `busy`.
- Why: Multi-mode video models (Seedance 2.0 / Veo 3.1 / Gemini Omni) now open
  with the media-aware trigger so the user picks Start&End vs Reference first.

## 2026-07-03 14:52 — pass-through for inline mention pills

- Files: `Composer.tsx`.
- What: new `mentions` + `onMentionCommand` props, forwarded to
  `PromptField.Textarea`, so a container can render `@`-mentions as inline pills
  (rich TipTap surface) instead of `@Name` text. Omit → plain textarea (every
  existing caller unaffected).
- Why: chat composer opts into the pill UX; Composer is the pass-through chassis
  between the container and PromptField.

## 2026-07-02 18:15 — dictation append reads valueRef (fix stale-capture race)

- Files: `Composer.tsx`.
- What: VoiceDictation `onResult` now appends the transcript to `valueRef.current`
  instead of the render-captured `value` prop.
- Why: adversarial parity review (Phase 7) — the STT round-trip takes seconds;
  text typed during transcription was overwritten by `<stale value> <transcript>`.
  The pre-Phase-3 chat used a functional setText update and was immune; this
  restores that guarantee for the controlled contract.

## 2026-07-02 14:11 — demo-shell → fully controlled ComposerProps v2 (Phase 2 inversion)

- Files: `Composer.tsx`, `Composer.scss`, `Composer.stories.tsx`.
- What: the component INVERTED from a self-stateful demo shell (7 props, hardcoded
  demo models/voices/placeholders, canned STT, `onSubmit={() => {}}`) to a fully
  controlled assembly per the Phase-2 contract (spec 2026-07-02 §11.1 + §11.5
  review corrections). New surface: `value`/`onValueChange`, `placeholder`,
  `submitHint` (→ PromptField.Submit soft-disable tooltip), `onSubmit`/`onStop`/
  `canSubmit`/`status`/`busy`, `error` (rendered `<p role="alert">` between
  textarea and footer — ported from the chat `__error`), full attachments
  pass-through (`attachments`/`onAttachmentsChange`/`onFiles`/`onFileError`/
  `fileAccept`/`inferType`/`maxBytes`/`onPickFromLibrary`), `videoSlots =
  Omit<AttachmentSlotGroupProps,'disabled'|'className'|'ref'>` (Composer sets
  `disabled={busy}`; `undefined` → generic tile row, condition is the
  container's), `settings: ComposerSettingsPopoverProps` (rendered with
  `disabled={settings.disabled || busy}` — busy always wins), `onTranscribe`
  (`undefined` → no VoiceDictation; transcript appends inside via
  `onValueChange`; mic gets `disabled={busy}` + keeps `cover`),
  `onMentionQueryChange`/`mentionPickerOpen`, `warning` + `overlay` slots
  (overlay = LAST direct child of the root, no wrapper), `labels:
  ComposerLabels {promptAria, submit, submitting, dropOverlay, tooLarge}` with
  EN defaults, `className`, `ref` (React 19 ref-as-prop). ALL demo data moved
  to `Composer.stories.tsx` fixtures + a stateful `DemoComposer` story host
  (`meta.component = DemoComposer`, args/argTypes playground); picsum
  thumbnails → local `/model-samples/*.avif`. SCSS: root now `position:
  relative; container-type: inline-size; container-name: composer` (contractual
  overlay anchor, §11.5.4), iOS coarse-pointer 16px textarea guard ported from
  the chat composer (§11.5.9), `__error` styles ported (raw 12px → tokenized
  `--font-size-12`), raw `720px` → new `--width-composer` token (45rem,
  semantic.tokens.json). Kept: `minRows={1}`, `SendArrowOutline` 14px-glyph
  icon-only square submit, either/or slots-vs-tiles rule. New story:
  `SoftDisabledHint` (tooltip + placeholder pulse).
- Why: Phase 2 of the composer componentization — "всё, что внутри —
  компоненты; чат использует компонент, а не хардкод". The demo-shell version
  could never be consumed by the live chat (it owned fake state); the
  controlled contract lets `features/chat/components/composer.tsx` become a
  thin Convex container in Phase 3. Pre-change version archived as
  `_archive/2026-07-02-pre-controlled-contract/`.

## 2026-06-30 10:14 — submit glyph → send arrow

- Files: `Composer.tsx`.
- What: swapped the submit glyph from `MagicSparkleOutline` (sparkle) to
  `SendArrowOutline` (bold up arrow). Same square icon-only button + size — just the
  glyph.
- Why: Val — chose the up-arrow send glyph.

## 2026-06-30 09:57 — submit glyph owns its size via the wrapper

- Files: `Composer.tsx`.
- What: dropped the inline `width={22} height={22}` on the `MagicSparkleOutline`
  submit glyph — the PromptField icon-only wrapper now owns the size (24px), per the
  icon convention (glyph ships sizeless, consumer's CSS sizes it).
- Why: Val — bigger send glyph; the inline size was being clamped anyway, so the
  wrapper is the right owner.

## 2026-06-30 09:20 — square icon-only submit (MagicSparkle, no "Generate" text)

- Files: `Composer.tsx`.
- What: the footer submit is now `<PromptField.Submit iconOnly label="Generate">` with
  a `MagicSparkleOutline` glyph child — a square `--control-size-md` icon button (no
  "Generate" word) sitting beside the equally-square mic, both right-aligned after the
  spacer. Mid-stream it becomes the silver (`tone="neutral"`) square Stop (handled in
  `PromptField.Submit`'s iconOnly path).
- Why: Val — wanted a compact square send button with the sparkle glyph + a silver Stop
  while streaming.

## 2026-06-30 08:22 — drop the extra margin under the reference-slots row

- Files: `Composer.scss`.
- What: removed `.klyp-Composer .klyp-AttachmentSlotGroup { margin-block-end: var(--space-8) }`.
  It stacked on top of the PromptField chassis's uniform `gap: var(--space-16)`, so the
  frames→textarea step rendered 24px while every other inter-row step was 16px. Now the
  whole field gaps uniformly at 16px.
- Why: Val — the asymmetric bottom margin under the Start/End frames row read as a stray
  gap ("зачем-то отступ снизу"). The component itself (`AttachmentSlotGroup`) carries no
  margin; spacing belongs to the chassis gap.

## 2026-06-30 07:12 — unify footer with live chat (single settings pill + voice) + controlled state props

- Files: `Composer.tsx`, `Composer.scss`, `Composer.stories.tsx`.
- What: footer reworked to the shipped `/chat` layout (2026-06-27) — ONE settings pill on every width (Text/Image/Video/Audio modality switcher + model + per-modality settings all inside its popover), and `VoiceDictation` added between the pill cluster and Generate. Removed the retired desktop split (standalone footer `TabSwitcher` + text-only `Dropdown`), the `narrow`/`ResizeObserver` mobile-collapse (one pill at all widths makes it unnecessary), and the now-dead `__footerSwitcher` / `__mobilePill` SCSS. Added controlled `status` / `busy` / `warning` props threaded into `PromptField`, so the catalog shows real Busy / Streaming / WithWarning states and the chat wrapper can drive the same component. `Mobile` story → `Adaptive`; added `Busy`, `Streaming`, `WithWarning` stories.
- Why: the catalog/standalone Composer had drifted from the live chat composer (old two-control footer, no voice dictation, no warning/state surface). Phase 1 of unifying the duplicated composer stack into a single canonical `@klyp/brand/Composer` that `features/chat/components/composer.tsx` will consume in Phase 2. Archived pre-change as `_archive/2026-06-30-pre-chat-unify`. Verified: `pnpm typecheck` + `biome` clean; `/components/composer` renders the new single-pill + voice footer, console 0 errors.

## 2026-06-29 04:23 — attachmentslotgroup-and-unified-dropdown

- What: Swapped the video reference UI from `VideoReferenceSlots` to `AttachmentSlotGroup` (with an effective frames/reference slot-mode derivation and a `demoSlotMax` cap helper; `initialVideoImages`/state retyped to `AttachmentItem`), and replaced the model/settings `BrandSelect` with the unified `Dropdown` (`DropdownOption`). The demo `addVideoRefs` file-URL appender became a placeholder `addDemoRef`.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-28 20:23 — migrate ref slots VideoReferenceSlots → AttachmentSlotGroup

- Files: `Composer.tsx`, `Composer.stories.tsx`, `Composer.scss`.
- What: the video reference-slot row now renders `AttachmentSlotGroup` instead of the retired `VideoReferenceSlots`. Slot mode (frames/reference) + per-mode cap are derived inline (`demoSlotMax`); empty-slot click appends a placeholder demo tile (`onAdd`), since the standalone shell has no library modal. `VideoRefImage` type → `AttachmentItem`; `.klyp-VideoReferenceSlots` SCSS override → `.klyp-AttachmentSlotGroup`.
- Why: `VideoReferenceSlots` was superseded by `AttachmentSlot` + `AttachmentSlotGroup` (both shipped/stable) and removed from `@klyp/brand`; the Composer shell was its last consumer.

## 2026-06-18 19:24 — VideoStartOnly story (partial frame state)

- Files: `Composer.stories.tsx`.
- What: added a `VideoStartOnly` story — video frame mode with ONLY the Start keyframe filled (tile), End left as an empty dashed dropzone.
- Why: the catalog had only "both empty" (`Video`) and "both filled" (`VideoWithFrames`); the partial Start-only state — which `VideoReferenceSlots` already renders (1 image + 2 slots → 1 tile + 1 dashed) — was unexercised (Val 2026-06). Verified live: Start tile (badge "Start") + End dashed dropzone (label "End").

## 2026-06-18 19:22 — no generic attachments in video (contradiction fix)

- Files: `Composer.tsx`.
- What: the generic `PromptField.Attachments` tile row now renders only when NOT in video modality (`{!isVideo && …}`).
- Why: in video, uploaded images ARE the Start/End reference frames (the `VideoReferenceSlots` row), so showing a separate generic-attachment row ABOVE empty Start/End slots was a contradictory state — visible in the WithAttachments story when switched to Video (Val 2026-06). Verified live: switching WithAttachments to Video drops the attachment tiles and leaves only the Start/End slots; image/text/audio keep their attachment tiles.

## 2026-06-18 15:29 — mobile: fold modality switcher into a single pill (supersedes 12:30 reflow)

- Files: `Composer.tsx`, `Composer.scss`.
- What: on a narrow composer the footer's 4-tab modality `TabSwitcher` is now REPLACED by a single settings pill (icon + current modality label) that opens the switcher + model + per-modality settings inside its popover — mirroring the chat composer's phone layout (the real `/chat` does the same via `isPhone`). The 12:30 "full-width switcher on its own row" reflow is removed. Collapse is driven by a `ResizeObserver` on the composer's OWN box (`narrow = width < 600`), not the viewport — so the catalog Mobile story collapses on a desktop viewport too. The new mobile pill passes `showModalitySwitcher` to `ComposerSettingsPopover` and carries `klyp-Composer__mobilePill` so SCSS forces its short label (the shared popover hides the label at viewport ≥900px).
- Why: Val — on mobile the full segmented switcher shouldn't show; it must collapse to the single pill like the shipped chat. A structural swap (different DOM subtree) is something `@container` can't express, hence the container `ResizeObserver`. Verified live: at 360px the full switcher is gone, the pill shows "Video" and opens a 4-tab (Video/Image/Text/Audio) switcher inside; at ≥694px the inline switcher returns; footer 40px, no overflow, console clean.

## 2026-06-18 12:30 — mobile / narrow-container layout + Mobile story

- Files: `Composer.scss`, `Composer.stories.tsx`.
- What: the footer now REFLOWS below a ~600px `prompt-field` container — the
  modality switcher hoists to its own full-width row (equal-slot options) above
  the action row, and the model pill drops to its compact label so nothing
  crushes. Added a `Mobile` story rendering the shell at 360px (phone) and 720px
  (desktop) fixed-width containers.
- Why: the brand shell had NO mobile layout (only the chat FEATURE composer
  collapses, via `isPhone`), so at narrow width the single-row footer crushed
  the 4-tab switcher. Implemented with `@container prompt-field` (not a viewport
  media query) per adaptive-first, scoped entirely to `.klyp-Composer` so it
  touches only this shell — the `.klyp-Composer …` selectors out-specify the
  shared ComposerSettingsPopover's own viewport-media label/preview swap
  (0,2,0 > 0,1,0). Verified at 360px: footer is two clean 40px rows (tabs row 1,
  action row 2), no overflow, console clean.

## 2026-06-17 16:34 — modality-switcher-into-footer (supersedes 11:43)

- Files: `Composer.tsx`, `Composer.scss`.
- What: Moved the modality switcher from the row ABOVE the card (11:43) INTO the
  footer, right of the attach button (compact: per-option padding 16→10; md =
  40px, level with the other footer controls); the model control sits left of
  Generate. The root drops the flex-column `__modalityBar` wrapper. Mirrors the
  chat composer's footer placement, which is jump-free because the footer rides
  the card's bottom-anchored baseline (the above-card switcher jumped when the
  modality changed the card height). Order video/image/text/audio; active label
  is default white (no gold).
- Why: Keep the DS demo in sync with the reworked chat composer.

## 2026-06-17 11:43 — modality-switcher-above-composer

- Files: `Composer.tsx`, `Composer.scss`.
- What: The Text/Image/Video/Audio modality switcher moved OUT of
  `ComposerSettingsPopover` to its own row ABOVE the composer card
  (`__modalityBar`). The component root is now a `<div class="klyp-Composer">`
  flex column (was the `<PromptField>` itself) so the switcher row sits above
  the prompt card. TEXT modality renders a direct `BrandSelect` model picker in
  the footer; image/video/audio keep the (switcher-free) settings popover.
- Why: Mirror the chat composer rework — surface the output-type choice as a
  persistent control above the composer, and give text a one-click model
  picker. Keeps the DS demo in sync with the shipped chat pattern.
## 2026-06-30 — pre-chat-unify

- Archive: `./_archive/2026-06-30-pre-chat-unify/` — **RETIRED from disk** in
  `5ab79c6` ("ship-prep: retire un-buildable Composer archive" — the snapshot
  imported the removed AudioControls and broke the prod Vite build). Recover
  from git history (`d884306^`) if ever needed.
- Tokens source: `tokens@4920037`

## 2026-07-02 — pre-controlled-contract

- Archive: `./_archive/2026-07-02-pre-controlled-contract/`
- Tokens source: `tokens@abdd3be`
- Why: freeze the demo-shell Composer before the Phase-2 breaking API change
  (fully-controlled props + slots, demo hardcode moves to stories) — spec
  `docs/superpowers/specs/2026-07-02-composer-componentization-phase2-design.md`.
- Note: the snapshot's relative sibling imports were depth-rewritten
  (`../X` → `../../../X`) so the archive stays buildable — value imports in
  `_archive/<label>/` resolve against a non-existent path otherwise (the exact
  failure that killed the 2026-06-30 archive). Verified: `pnpm build` exit 0.


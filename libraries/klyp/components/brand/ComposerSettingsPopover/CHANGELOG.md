# ComposerSettingsPopover — changelog

## 2026-07-06 08:30 — settings pill shows params at every width

- Files: `ComposerSettingsPopover.tsx`, `.scss`.
- What: added `data-section` to the trigger; the SETTINGS pill now always
  renders its params preview ("9:16 · 720p") and never the generic "Settings"
  word — mobile now matches desktop. The adaptive short-label swap stays for
  the MODEL pill only.
- Why: Val — "Settings" on phones was useless; show the actual params like PC.

## 2026-07-05 14:10 — symmetric trigger padding

- What: Trigger pill `padding-inline` is now symmetric `var(--space-12)` (was
  `10 / 18`). The old asymmetry assumed an icon-lead pill; the split SETTINGS
  pill has no icon, so the uneven sides read as a bug.
- Why: Val — left 10 / right 18 looked wrong; both sides should match.

## 2026-07-03 19:32 — model pill: switcher below model + close-on-pick

- What: In the split MODEL pill the modality switcher now sits BELOW the model
  dropdown (was above). Picking a model closes the popover (nothing else to do);
  picking a SETTING keeps the settings popover open (tweak several in a row).
- Why: Val — model above type switcher; close after model choice, not after
  each setting.

## 2026-07-03 19:10 — section prop (split into Model + Settings pills)

- What: New `section?: 'model' | 'settings' | 'all'` (default 'all'). 'model'
  renders the modality switcher (now inline at the TOP) + model dropdown;
  'settings' renders the param rows (aspect / size / duration / resolution /
  audio / camera / multishot / motion + the audio section); 'all' is the
  original combined pill (catalog / standalone, unchanged). Added per-instance
  `triggerAria` + split-pill trigger transport fields (`settingsIcon` /
  `settingsLabel` / `settingsPreview` / `modelAria` / `settingsAria` /
  `hasSettings`) read by the two-pill `<Composer>` layout.
- Why: Val — one pill mixed model choice and generation settings; split into a
  Model pill (type + model) and a Settings pill (params).

## 2026-07-02 21:45 — triggerGlow: transient accent-glow hint on the trigger pill

- Files: `ComposerSettingsPopover.tsx`, `ComposerSettingsPopover.scss`.
- What: new `triggerGlow?: boolean` prop → `data-accent-hint` on the trigger
  Button. While set, the pill gets the Button `variant='accent'` gold treatment
  (same `--fx-accent-glow-*` tokens) fading in/out over `--duration-fast`
  (140ms): the accent shadows ride the Button's own box-shadow transition; the
  radial wash sits on a `::before` overlay whose opacity tweens (gradients
  don't transition, a variant swap would snap).
- Why: the chat's StartCreating cards glow the settings pill on hover —
  pointing the user at where the model gets picked (Val 2026-07-02).

## 2026-07-02 19:04 — renderModelDetail pass-through to the model dropdown

- What: new `renderModelDetail?: (option) => ReactNode` prop, threaded to the model `Dropdown`'s `renderDetail` slot — hovering a model row shows the host-built detail card (`<ModelInfoCard>`) beside the menu.
- Why: composer model picker gets the 21st.dev model-selector hover card (Val 2026-07-02); the popover stays model-agnostic — the host owns the card content.

## 2026-07-02 14:11 — audio section: drop 'dialogue' from the selectable capabilities

- Files: `ComposerAudioSection.tsx`.
- What: removed the `dialogue` option from the audio section's capability
  dropdown (Speech · Sound FX · Music remain). The `ComposerAudioCapability`
  type union, the `capDialogue` label and the tts/dialogue voice-row logic stay
  intact, so existing hosts (the chat adapter) keep compiling unchanged.
- Why: spec 2026-07-02 §11.5.11 — 'dialogue' was selectable but dead-ended:
  there is no turns editor anywhere, the chat adapter doesn't forward dialogue
  props, and the submit gate requires per-turn text+voice → picking it left the
  submit permanently disabled. Returns together with a turns editor if the
  product asks.

## 2026-07-02 00:46 — modality switcher order: Image first, then Video

- What: reordered the `ModalitySwitcher` tabs from `Video · Image · Text · Audio`
  to `Image · Video · Text · Audio`.
- Why: Val — Image is now the default/primary modality, so it leads the switcher
  (pairs with the new-chat Image default in the chat composer).

## 2026-06-30 13:35 — restore animateWidth trigger + animateHeight popover + footer switcher

- What: restored 3 features the chat original had before the swap (gold reference =
  `HEAD~1`). (1) The trigger pill is now the DS `@klyp/ui` `<Button variant="primary"
  size="md" animateWidth>` (was a raw RACButton) — its width tweens (0.16s) when the
  model/aspect/resolution preview changes instead of snapping; the hand-rolled trigger
  chrome was dropped (DS Button paints surface/border/radius/height/states), keeping
  only the asymmetric optical padding + `__fluidContent` gap + muted→primary hover label.
  (2) The `<Popover>` now passes `animateHeight` — the panel glides between per-modality
  heights instead of jumping. (3) The modality `TabSwitcher` moved into the Popover
  `footer` slot (outside the height-morph box) so it stays pinned at the bottom; added a
  `hideModalitySwitcher` prop so the standalone `ComposerSettingsPanel` (catalog) still
  renders it inline.
- Why: Val — the brand component was a degraded version of the chat hardcode; restore the
  smooth width/height morphs that were properly built there. Verified live: trigger width
  97→88 + popover height 242→58 both Motion-driven; parity review FAITHFUL (no P0/P1).

## 2026-06-30 12:24 — frameless provider logo + multi-shot label seam

- What: (1) the trigger pill's provider logo no longer sits in a bordered square —
  dropped the `__triggerProvider` 20px hairline-frame / rounded-square / clip, so the
  brand logo floats frameless (keeps its own colours). (2) Added
  `multiShotLabels?: Partial<ComposerMultiShotLabels>` to `ComposerSettingsPopoverProps`
  and threaded it into the internal `<ComposerMultiShot labels={{ seconds, …}}>` — the
  panel was hard-forwarding only `{ seconds }`, so the cut-editor copy rendered EN
  regardless of brand. Additive + backward-compatible (omitting it keeps EN defaults).
- Why: Val — the model logo should float (no frame); the multi-shot label seam closes
  a latent Unreals RU regression flagged in the chat composer-swap review.

## 2026-06-30 09:24 — modality switcher → accent tone (match live chat)

- What: the in-panel modality `TabSwitcher` (Video / Image / Text / Audio) now sets
  `tone="accent"`, so the active tab wears the iris accent-glow. Only the modality
  switcher; the sub-setting switchers (frame-mode / stability preset / motion
  orientation) stay neutral per the single-accent rule.
- Why: Val — the catalog component's active tab read neutral while the live chat
  composer's modality switcher already used `tone="accent"` (feature copy, 2026-06-30).
  Brought the DS component in line so the active-tab highlight matches the chat.

## 2026-06-30 08:17 — trigger compacts by CONTAINER, not viewport

- What: the trigger-pill label↔preview swap moved from `@media (min-width: 900px)`
  (VIEWPORT) to `@container (min-width: 480px)` (the composer's own width — PromptField
  sets `container-type: inline-size`). On a narrow composer the pill keeps the short
  modality label instead of the wide "model · aspect · resolution" preview.
- Why: Val — in the catalog Composer "Adaptive" 360px preview the wide preview showed
  inside the 360px composer (desktop viewport ≥ 900px), so the single-row footer ran
  off the edge (Generate clipped). Now the composer adapts to its container, so a
  phone-width pane shows the compact footer that fits.

## 2026-06-30 08:07 — toggle rows stay one line (label no-wrap + hint ellipsis)

- What: the `__toggleRow` label now `white-space: nowrap` + `overflow: hidden`, and
  `__toggleRowHint` truncates with `text-overflow: ellipsis` (+ `min-inline-size: 0`).
  A long hint (e.g. Motion Control's "animate a character with a driving video")
  no longer breaks the bold label onto a second line — every toggle row stays a
  single `--control-size-md` (36px) line; the hint ellipsises instead.
- Why: Val — "Motion Control" was wrapping to two lines; a toggle row must never
  render on two lines.

## 2026-06-30 07:44 — fold AudioControls in + Kling camera/multi-shot/motion parity

- What: Merged the standalone `@klyp/brand` `AudioControls` INTO this component as
  a built-in controlled audio section (new co-located `ComposerAudioSection.tsx`
  + `.scss`); the `audioSlot` prop is REMOVED, replaced by a controlled
  `audio?: ComposerAudioProps`. Brought the video panel to parity with the live
  chat composer by adding Kling **camera control** (preset `Dropdown`),
  **multi-shot** (toggle + new co-located `ComposerMultiShot.tsx` cut editor,
  ported from the chat `MultiShotControl`), and **motion control** (toggle +
  image/video orientation `TabSwitcher` + attach hint) — all opt-in via
  `show*` flags. New public types exported from the component + both barrels:
  `MultiShotValue` / `MultiShotShot` / `MultiShotShotType`, `MotionControlValue`,
  `ComposerAudioProps` / `ComposerAudioCapability` (+ labels). `Composer` and the
  stories now pass demo `audio={…}` instead of `audioSlot`. The old
  `AudioControls` folder + barrel exports + `audio-controls` catalog entry were
  deleted.
- Why: One settings component (audio is a section, not a separate component / not
  a slot) and full library parity with the hardcoded chat version, so the live
  chat can swap to the DS component.

## 2026-06-30 05:54 — extract panel for inline catalog preview + toggle-blend fix

- What: Extracted the popover's inner settings UI into an exported
  `ComposerSettingsPanel` (the popover wrapper now renders it inside `<Popover>`;
  both barrels re-export `ComposerSettingsPanel` + `ComposerSettingsPanelProps`).
  Reworked the catalog story to render `ComposerSettingsPanel` INLINE per
  modality (Video / Image / Audio / Text) inside a new
  `.klyp-ComposerSettingsPopover-storyPanel` surface frame, plus one
  `Interactive` pill→popover story — replacing the old previews that showed only
  a closed pill + a loose standalone `TabSwitcher` (the panel itself was hidden
  until you clicked). Also pinned the unselected `Switch` track to
  `--color-bg-surface-solid` on toggle-row hover so the Audio / Static-camera
  toggles no longer blend into the hovered row.
- Why: Val — the catalog preview was confusing (loose TabSwitcher + closed pill,
  the actual panel invisible without a click) and the toggle disappeared on hover.

## 2026-06-29 04:23 — migrate-brandselect-to-dropdown

- What: Migrated every value picker (model / image aspect+size / video duration+aspect+resolution) from BrandSelect to the unified Dropdown: option types switched from BrandSelectOption to DropdownOption, props moved to selectionMode='single' / indicator='none' / selectedKeys / onSelectionChange and side+align replacing placement, added a pillLabel helper and a model trigger glyph (currentModelOption.icon), and widened triggerPreview to ReactNode.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-28 19:20 — widen Duration column so "10s" stops truncating

- Files: `ComposerSettingsPopover.scss`
- What: video `__selectRow` columns `0.8fr 1.3fr 1.1fr` → `0.9fr 1.2fr 1.1fr`
  (and the 2-col fallback `0.8fr 1.3fr` → `0.9fr 1.2fr`). Duration (col 1)
  gains the room from Aspect (col 2); Resolution (col 3) unchanged.
- Why: in the first slot a two-digit value ("10s") truncated to "1…" — the
  0.8fr track (~75px in the 340px panel) left only ~23px for the value after
  trigger padding + chevron. ~84px now fits it; Aspect still holds "9:16" +
  ratio glyph. Mirrors the app twin `klyp-feature-chat-ComposerSettings`.

## 2026-06-23 17:43 — hard-lock panel width (no child can widen it)

- Files: `ComposerSettingsPopover.scss`
- What: added `min-inline-size: 0` to `__panel` so no child's min-content can
  override `min-width: auto` and push the panel past its `inline-size`
  (`min(340px, …)`). Children shrink / ellipsize instead.
- Why: design-lead — the panel still widened when a long-content control was
  present; this locks it (mirrors the app twin
  `klyp-feature-chat-ComposerSettings__panel`).

## 2026-06-18 15:29 — optional embedded modality switcher (mobile) + trigger className

- What: added `showModalitySwitcher` + `onModalityChange` props — when set, a full-width `TabSwitcher` (Video/Image/Text/Audio) renders at the bottom of the panel. Added an optional `className` prop appended to the trigger pill. (Ports the chat feature copy's mobile behaviour to the brand component.)
- Why: the brand Composer's mobile collapse (narrow container) replaces the footer modality switcher with this single pill, so the popover must host the switcher itself. `className` lets the host mark the mobile-variant trigger so SCSS keeps its short label. Desktop is unchanged (host omits both — switcher stays in the footer). Verified live: opens with the 4-tab switcher (active = current modality), fullWidth, 40px.

## 2026-06-18 00:41 — trigger-adaptive-right-align + colour-glyph

- What: (1) dropped the desktop `justify-content: flex-end` + `min-inline-size: 180px` from the trigger — the pill is now ADAPTIVE width (sizes to content); right-alignment is owned by the footer `<Spacer/>` so it stays flush against Generate and grows leftward. (2) `padding-inline` 10/12 → **10 start / 18 end** — glyph left = top = bottom = 10 (true symmetric square badge), preview's far edge roomier at 18. (3) reverted the provider glyph's `filter: brightness(0) invert(1)` — the logo renders in **full colour** again (square frame kept).
- Why: with the 180px reserve the glyph FLOATED (left inset measured 18px, not 10) whenever the preview was shorter than 180px — the "symmetric badge" only held at one width. Adaptive + footer-level right-align fixes both the float and the no-shift requirement. Design lead also rejected the flat-white glyph (read as B&W) — colour restored.

## 2026-06-17 23:45 — trigger-glyph-symmetric-padding

- What: trigger gap 6→10 and padding-inline 12 (both) → 10 start / 12 end, so the provider glyph sits as a symmetric square badge (start inset + gap-to-text = its 10px optical inset; end keeps 12 for preview text).
- Why: port the chat composer feature copy's trigger-padding fix so the catalog brand copy renders the same balanced glyph badge.

## 2026-06-17 23:08 — composer-visual-parity

- What: panel 300->340px (min() to viewport), video select-row grid 0.8fr/1.3fr/1.1fr, white+square provider-glyph frame (--space-20 + --radius-sm + 5% border, .klyp-ProviderIcon whitened), footer trigger right-aligned with 180px min-inline-size at >=900px.
- Why: bring the catalog brand copy to parity with the chat composer feature copy's 2026-06-18 visual fixes.

## 2026-06-17 16:03 — control-height-36-to-40 (DS baseline)

- What: trigger pill + toggle-row block-size 36px → 40px (×2).
- Why: DS-wide control-height baseline bump 36→40 (`control.size.lg`; see @klyp/tokens CHANGELOG). This component hardcoded the old 36px lg control height; bumped to 40px so it matches sibling controls.

## 2026-06-17 11:43 — drop-modality-switcher

- Files: `ComposerSettingsPopover.tsx`, `ComposerSettingsPopover.scss`,
  `ComposerSettingsPopover.stories.tsx`.
- What: Removed the bottom modality TabSwitcher (Text/Image/Video/Audio) plus
  its `onModalityChange` prop, `handleModalityChange`, and the
  `&__modalitySwitcher` style. The popover now holds model + per-modality
  settings only; the host owns the modality switcher (hoisted above the
  composer). The story harness renders the switcher as a sibling so each
  panel is still inspectable.
- Why: Mirror the chat composer rework — the modality switcher lives above the
  composer now, not inside this popover.

## 2026-07-05 20:14 — setting-dropdown trigger icons

- What: aspect dropdowns show a ratio-rect glyph, duration → Clock, quality (image size + video resolution) → Diamond as `triggerIcon` on the pill.
- Why: iconify the composer setting pills so aspect/time/quality are recognisable at a glance across every model that exposes them.

## 2026-07-05 20:17 — drop trailing chevron on setting pills

- What: aspect / duration / quality (size + resolution) pills now pass `hideChevron` — no trailing chevron, just the leading glyph + value.
- Why: cleaner compact pills now that each control carries an identifying leading icon.

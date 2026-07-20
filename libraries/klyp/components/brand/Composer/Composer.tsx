import './Composer.scss'

import { SendArrowOutline } from '@klyp/icons'
import { type ReactNode, type Ref, useRef } from 'react'
import { AttachmentSlotGroup, type AttachmentSlotGroupProps } from '../AttachmentSlotGroup'
import {
  AttachModePicker,
  type AttachModePickerProps,
} from '../AttachmentSlotGroup/AttachModePicker'
import {
  ComposerSettingsPopover,
  type ComposerSettingsPopoverProps,
} from '../ComposerSettingsPopover'
import {
  type InferMimeFromName,
  PromptField,
  type PromptFieldAttachment,
  type PromptMentionInsert,
} from '../PromptField'
import type { AudioCaptureResult } from '../VoiceDictation'
import { VoiceDictation } from '../VoiceDictation'

/**
 * `<Composer>` — the chat-composer assembly. A FULLY CONTROLLED composition of
 * the design-system parts into the full prompt input (spec 2026-07-02
 * "Composer componentization Phase 2", contract §11 + §11.5):
 *
 *   ┌──────────────────────────────────────────────┐
 *   │  [attachment tiles | Start/End video slots]   │  ← PromptField.Attachments / AttachmentSlotGroup
 *   │  [warning banner]                             │  ← `warning` slot (InlineWarning)
 *   │  Describe the video clip…                      │  ← PromptField.Textarea (grows, minRows=1)
 *   │  [error line]                                 │  ← `error` prop (<p role="alert">)
 *   │  ⬆  ◔ Kling 3.0 · 9:16 · 720p     🎙  [⇧]     │  ← Footer: attach · settings · mic · submit
 *   └──────────────────────────────────────────────┘
 *   [overlay slot — MentionPicker etc., LAST child of the positioned root]
 *
 * Composer owns NO data and NO state — only the layout. Every value arrives as
 * a prop, every event leaves as a callback (props in / callbacks out; no
 * Convex, no `@/lib/brand`). The chat feature wrapper is the container: it
 * feeds Convex-backed models/voices/uploads and the brand-aware copy. The
 * former demo hardcode (models / placeholders / canned STT / picsum refs)
 * lives in `Composer.stories.tsx` fixtures — the archived demo-shell version
 * is `_archive/2026-07-02-pre-controlled-contract/`.
 *
 * Composed from: `PromptField` (chassis: adaptive textarea + attachments +
 * drop/paste + footer), `ComposerSettingsPopover` (modality switcher + model +
 * per-modality settings — `settings` pass-through bag), `AttachmentSlotGroup`
 * (Start/End + reference frames — `videoSlots` pass-through bag),
 * `VoiceDictation` (mic, only when `onTranscribe` is wired) and
 * `PromptField.AttachButton` / `PromptField.Submit`.
 */

// =====================================================================
// Labels — static EN copy, overridable per-brand (RU for Unreals comes
// from the container's copy module; pattern = ComposerSettingsLabels).
// Runtime-DERIVED copy (placeholder per modality, submitHint, error) is
// top-level props, not labels (§11.5.5).
// =====================================================================

export interface ComposerLabels {
  /** a11y name of the prompt textarea (chat: composerCopy.chatMessage). */
  promptAria: string
  /** Idle accessible name of the icon-only submit (chat: composerCopy.generate). */
  submit: string
  /** Busy accessible name of the submit while submitting (chat: composerCopy.generating). */
  submitting: string
  /** Label inside the whole-field drag-over overlay (chat: composerCopy.dropImageOrVideo). */
  dropOverlay: string
  /** "File too large" reject copy — file name + size in MB (chat: composerCopy.tooLargeVideo). */
  tooLarge: (name: string, mb: string) => string
}

const DEFAULT_LABELS: ComposerLabels = {
  promptAria: 'Prompt',
  submit: 'Generate',
  submitting: 'Generating…',
  dropOverlay: 'Drop image or video here',
  tooLarge: (name, mb) => `"${name}" is too large (${mb} MB). Max 50 MB.`,
}

// =====================================================================
// Props — ComposerProps v2 (fully controlled)
// =====================================================================

/**
 * Video Start/End frames / reference slots — the full `AttachmentSlotGroup`
 * surface minus what Composer owns: `disabled` (Composer sets it from `busy`,
 * parity with the chat), `className` / `ref` (layout internals). Derived via
 * Omit so the bag can never drift from the real component (§11.5.1).
 * `mode` arrives ALREADY DERIVED — the frames/reference derivation lives in
 * the container (single source, shared with submit's frameImageRoles; §11.4.1).
 */
export type ComposerVideoSlots = Omit<AttachmentSlotGroupProps, 'disabled' | 'className' | 'ref'>

/** True when the video slot row has no image / video-clip / other-file items —
 *  the empty state where a multi-mode chooser owns the drag surface. */
function isSlotRowEmpty(v: ComposerVideoSlots): boolean {
  return (
    v.items.length === 0 && (v.videoClips?.length ?? 0) === 0 && (v.otherFiles?.length ?? 0) === 0
  )
}

export interface ComposerProps {
  // ── Input ───────────────────────────────────────────────────────────
  /** Controlled prompt text. */
  value: string
  onValueChange: (next: string) => void
  /** Placeholder arrives READY from the container (per-modality wording is a
   *  container concern). Omit → PromptField's brand default. */
  placeholder?: string
  /** Tooltip copy for the soft-disabled submit (per-modality, from the
   *  container's copy module). Omit → legacy native disable, no tooltip.
   *  Threaded to `PromptField.Submit`'s `disabledHint`. */
  submitHint?: string

  // ── Submit lifecycle ────────────────────────────────────────────────
  onSubmit: () => void
  /** Fired when the user presses the square Stop while `status='streaming'`. */
  onStop?: () => void
  /** Full container gate (uploads in-flight + blocking warnings + per-modality
   *  text gate). Omit → PromptField's default: text non-empty ∧ no upload. */
  canSubmit?: boolean
  /** Stream status driving the submit glyph (streaming → Stop, error → Retry).
   *  Omit → derived from `busy` inside PromptField. */
  status?: 'idle' | 'submitting' | 'streaming' | 'error'
  /** Mid-submit flag — dims the shell and gates settings pill, mic, slots. */
  busy?: boolean
  /** Error line under the textarea — rendered as `<p role="alert">` inside the
   *  PromptField children (ported from the chat composer's `__error`; §11.5.8). */
  error?: string | null

  // ── Attachments — PromptField pass-through (the chat's live surface) ──
  attachments: PromptFieldAttachment[]
  onAttachmentsChange: (next: PromptFieldAttachment[]) => void
  /** Files from paste / drop / picker — the container owns the upload pipeline. */
  onFiles: (files: File[]) => void
  /** Reject message (oversized / unsupported) — container pipes to toast. */
  onFileError?: (message: string) => void
  /** Accepted MIME prefix(es) for paste/drop/picker (chat: CHAT_DROP_ACCEPT). */
  fileAccept?: string | readonly string[]
  /** Filename→MIME recovery for unreliable `File.type` (Windows .mp4/.mov). */
  inferType?: InferMimeFromName
  /** Byte cap — number or per-file resolver (chat: chatFileMaxBytes). */
  maxBytes?: number | ((file: File) => number)
  /** `+` button opens the library picker. Omit → PromptField's legacy native
   *  file dialog (standalone/demo hosts). */
  onPickFromLibrary?: () => void

  // ── Video frames / references ───────────────────────────────────────
  /** Render the Start/End / reference slot row instead of the generic tile
   *  row. The SHOW condition is the container's (`video && supportsImageInput`,
   *  §11.4.2): `undefined` → generic `PromptField.Attachments` tiles. */
  videoSlots?: ComposerVideoSlots
  /** Single-target attach picker for NON-video models (text: images / docs /
   *  media). Shown as the drag surface (on drag-over) in place of the generic
   *  "Drop … here" overlay. One panel + Cancel, no modes. */
  attachChooser?: Omit<AttachModePickerProps, 'disabled'>

  // ── Settings — full controlled ComposerSettingsPopover pass-through ──
  /** Composer owns none of this data — it renders
   *  `<ComposerSettingsPopover {...settings} disabled={settings.disabled || busy} />`
   *  (`||`, not `??` — busy always wins, §11.5.2). Omit → no settings pill. */
  settings?: ComposerSettingsPopoverProps

  // ── Dictation ───────────────────────────────────────────────────────
  /** Real STT from the container. `undefined` → the mic is NOT rendered
   *  (VoiceDictation requires a transcriber; canned demo strings are banned
   *  from the component — §11.5.6). The transcript append happens INSIDE
   *  Composer via `onValueChange` (controlled pattern). */
  onTranscribe?: (audio: AudioCaptureResult) => Promise<string>

  // ── Mentions (PromptField.Textarea pass-through) ─────────────────────
  onMentionQueryChange?: (query: string | null) => void
  mentionPickerOpen?: boolean
  /** Opt into inline mention PILLS — renders the prompt on a rich TipTap
   *  surface where a picked `@`-mention becomes a thumbnail+label chip instead
   *  of `@Name` text. Omit → plain textarea (unchanged). */
  mentions?: boolean
  /** Rich mode only — receives the active pill-insert command (or `null`); the
   *  container calls it from its `<MentionPicker onPick>`. */
  onMentionCommand?: (insert: PromptMentionInsert) => void

  // ── Slots ───────────────────────────────────────────────────────────
  /** Banner above the textarea (chat feeds an `<InlineWarning>`). */
  warning?: ReactNode
  /** Absolutely-positioned overlays (MentionPicker) — rendered as the LAST
   *  direct child of the root, no wrapper. The root is the positioned anchor
   *  (`position: relative` + `container-name: composer` — §11.5.4). */
  overlay?: ReactNode

  // ── Copy / misc ─────────────────────────────────────────────────────
  /** Static-copy overrides (EN defaults inside; RU via the container). */
  labels?: Partial<ComposerLabels>
  className?: string
  /** React 19 ref-as-prop — the root div. The chat's pendingStarter focus
   *  effect queries `[data-slot="prompt-field-textarea"]` from here (§11.5.3). */
  ref?: Ref<HTMLDivElement>
}

// =====================================================================
// Helpers
// =====================================================================

/** Map the `fileAccept` MIME-prefix form (`'image/'` | list) to the native
 *  file-dialog `accept` attr for the LEGACY AttachButton fallback (no
 *  `onPickFromLibrary`): `'image/'` → `'image/*'`; full types pass through.
 *  The chat always supplies `onPickFromLibrary`, so this only serves
 *  standalone/demo hosts. */
function attachAccept(fileAccept?: string | readonly string[]): string | undefined {
  if (!fileAccept) return undefined
  const list = Array.isArray(fileAccept) ? fileAccept : [fileAccept]
  return list.map((p) => (p.endsWith('/') ? `${p}*` : p)).join(',')
}

// =====================================================================
// Component
// =====================================================================

export function Composer({
  value,
  onValueChange,
  placeholder,
  submitHint,
  onSubmit,
  onStop,
  canSubmit,
  status,
  busy = false,
  error,
  attachments,
  onAttachmentsChange,
  onFiles,
  onFileError,
  fileAccept,
  inferType,
  maxBytes,
  onPickFromLibrary,
  videoSlots,
  attachChooser,
  settings,
  onTranscribe,
  onMentionQueryChange,
  mentionPickerOpen,
  mentions,
  onMentionCommand,
  warning,
  overlay,
  labels,
  className,
  ref,
}: ComposerProps) {
  const L = { ...DEFAULT_LABELS, ...labels }
  // Live value for async callbacks (dictation onResult) — render-captured
  // `value` goes stale during the multi-second STT round-trip.
  const valueRef = useRef(value)
  valueRef.current = value

  // A multi-mode chooser on an EMPTY slot row owns the drag surface: suppress
  // the built-in "Drop … here" overlay and, on drag-enter, expand its split
  // panels (they become the drop targets). isSlotRowEmpty gates it so a filled
  // composer keeps the normal overlay.
  const chooser = videoSlots?.chooser
  const chooserActive = !!chooser && !!videoSlots && isSlotRowEmpty(videoSlots)
  // Only MULTI-mode uses the composer-level split-panel overlay. A single-mode
  // chooser expands to its slots inside AttachmentSlotGroup (no overlay).
  const multiChooserActive = chooserActive && !chooser?.singleMode

  return (
    <div ref={ref} className={['klyp-Composer', className].filter(Boolean).join(' ')}>
      <PromptField
        value={value}
        onValueChange={onValueChange}
        attachments={attachments}
        onAttachmentsChange={onAttachmentsChange}
        onFiles={onFiles}
        onFileError={onFileError}
        onSubmit={onSubmit}
        onStop={onStop}
        canSubmit={canSubmit}
        busy={busy}
        status={status}
        fileAccept={fileAccept}
        inferType={inferType}
        maxBytes={maxBytes}
        tooLargeMessage={L.tooLarge}
        dropOverlayLabel={L.dropOverlay}
        // Multi-mode empty state → the split-panel picker IS the drag surface:
        // it covers the whole field (prompt + footer stay in flow underneath,
        // preserving height) while a file is dragged over OR the pill expanded
        // it. Panels take the drop.
        dropSurface={
          chooserActive && chooser ? (
            // Chooser panels as the drag surface. Multi-mode = several panels;
            // single-mode = one panel — still a valid drop target on drag.
            <AttachModePicker
              panels={chooser.panels}
              onPick={chooser.onPick}
              onHoverTarget={chooser.onHoverTarget}
              incompatibleLabel={chooser.incompatibleLabel}
              onCancel={chooser.onCancel}
              cancelLabel={chooser.cancelLabel}
              rejectedPanel={chooser.rejectedPanel}
              disabled={busy}
            />
          ) : attachChooser ? (
            // Non-video (text / image) models: single-target attach surface.
            <AttachModePicker {...attachChooser} disabled={busy} />
          ) : undefined
        }
        // Force the surface visible without a drag only for MULTI-mode (a pill
        // click opens the panel picker). Single-mode's pill click instead
        // reveals slots inside AttachmentSlotGroup, so it stays drag-only here.
        showDropSurface={multiChooserActive && !!chooser?.expanded}
        // The Composer NEVER shows the generic "Drop … here" overlay — the chat
        // is fully on our attach surfaces (split panels / single-target / slot
        // group). Models with no attach at all simply show nothing on drag.
        // (Other PromptField consumers use it directly + keep the default.)
        hideDropOverlay
      >
        {/* Video slot row vs generic tiles — EITHER/OR, never both (in video,
            uploaded images ARE the Start/End frames; a parallel generic tile
            row beside empty slots is a contradictory state — Val 2026-06).
            The container decides by passing `videoSlots` (or not); Composer
            adds only the busy gate (chat parity: disabled={busy}). */}
        {videoSlots ? (
          // AttachmentSlotGroup owns its empty state now: when the container
          // supplies `videoSlots.chooser` (multi-mode) and every lane is empty
          // it renders the MediaAttachTrigger and crossfades to the slots once
          // a file lands; single-mode passes no chooser → empty pills directly.
          <AttachmentSlotGroup {...videoSlots} disabled={busy} />
        ) : (
          <PromptField.Attachments variant="tile" />
        )}

        {/* Warning banner slot (attachment limits / model compatibility) —
            the chat feeds an <InlineWarning>; stories pass one directly. */}
        {warning}

        <PromptField.Textarea
          placeholder={placeholder}
          ariaLabel={L.promptAria}
          minRows={1}
          onMentionQueryChange={onMentionQueryChange}
          mentionPickerOpen={mentionPickerOpen}
          mentions={mentions}
          onMentionCommand={onMentionCommand}
        />

        {/* Error line — ported from the chat composer's `__error` <p>; sits
            between textarea and footer, announced via role="alert" (§11.5.8). */}
        {error ? (
          <p role="alert" className="klyp-Composer__error">
            {error}
          </p>
        ) : null}

        <PromptField.Footer>
          {/* The footer "+" is the click-to-attach entry ONLY where there's no
              other attach affordance on screen. Video models carry their own
              (the AttachmentSlotGroup chooser pill / takeover panels / direct
              slots via `videoSlots`), so the "+" would duplicate it — hide it
              there. Text / image models expose attach as a drag-only surface
              (`attachChooser`) with no persistent pill, so the "+" stays as
              their sole click path. */}
          {videoSlots ? null : (
            <PromptField.AttachButton
              accept={attachAccept(fileAccept)}
              onPickFromLibrary={onPickFromLibrary}
            />
          )}
          {/* TWO pills: a MODEL pill (modality switcher + model dropdown) and a
              SETTINGS pill (aspect / size / duration / resolution / audio / …).
              Both fed from the one `settings` bag — the SETTINGS pill overrides
              its trigger with the bag's `settings*` fields. busy ALWAYS wins
              over settings.disabled (`||`, §11.5.2). */}
          {settings ? (
            <>
              <ComposerSettingsPopover
                {...settings}
                section="model"
                triggerAria={settings.modelAria ?? settings.triggerAria}
                disabled={settings.disabled || busy}
              />
              {settings.hasSettings !== false ? (
                <ComposerSettingsPopover
                  {...settings}
                  section="settings"
                  triggerIcon={settings.settingsIcon}
                  triggerLabel={settings.settingsLabel ?? ''}
                  triggerPreview={settings.settingsPreview}
                  triggerAria={settings.settingsAria ?? settings.triggerAria}
                  triggerGlow={false}
                  disabled={settings.disabled || busy}
                />
              ) : null}
            </>
          ) : null}
          <PromptField.Spacer />
          {/* Voice dictation rides between the pill cluster and submit, as in
              the chat. Only rendered when the container wires real STT; the
              recording bar covers the footer (`cover`) so Send can't be hit
              mid-recording. Transcript appends via onValueChange (§11.5.6).
              Appends from valueRef, not the render-captured `value`: the STT
              round-trip takes seconds and VoiceDictation holds the onResult
              closure from the stop event — a render-captured `value` would
              overwrite anything typed while transcription was in flight. */}
          {onTranscribe ? (
            <VoiceDictation
              cover
              onTranscribe={onTranscribe}
              onResult={(transcript) => {
                const current = valueRef.current
                onValueChange(current ? `${current} ${transcript}` : transcript)
              }}
              disabled={busy}
            />
          ) : null}
          {/* Square icon-only submit (Val 2026-06-30): the 14px send-arrow
              glyph in a --control-size-md square beside the mic (glyph size +
              hover-zoom live in PromptField.scss). `label` is the a11y name;
              streaming → silver Stop (PromptField.Submit's iconOnly path).
              `submitHint` turns the idle disable into the soft-disable +
              tooltip + placeholder pulse (spec §5 Phase 2). */}
          <PromptField.Submit
            iconOnly
            label={L.submit}
            busyLabel={L.submitting}
            disabledHint={submitHint}
          >
            <SendArrowOutline aria-hidden />
          </PromptField.Submit>
        </PromptField.Footer>
      </PromptField>
      {/* Overlay slot — LAST direct child of the positioned root, no wrapper
          (MentionPicker anchors position:absolute + bottom:100% to this root —
          §11.5.4). */}
      {overlay}
    </div>
  )
}

export default Composer

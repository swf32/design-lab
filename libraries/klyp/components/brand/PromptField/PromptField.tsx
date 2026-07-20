/**
 * `<PromptField>` — единый prompt-input компонент для chat + studio.
 *
 * Compound API (Radix-style sub-components):
 *
 *   <PromptField onSubmit={…} attachments={items} onAttachmentsChange={setItems} busy={false}>
 *     <PromptField.Header>...optional...</PromptField.Header>
 *     <PromptField.Attachments />              // chips with X + thumbnail
 *     <PromptField.Textarea
 *       placeholder="…"
 *       mentionSuggestions={…}
 *       onMentionPick={…}
 *     />
 *     <PromptField.Footer>
 *       <PromptField.AttachButton accept="image/*" />
 *       <PromptField.ModelPicker models={…} value={…} onChange={…} />
 *       <PromptField.Spacer />
 *       <PromptField.CostPreview etaSec={40} usd={0.08} />
 *       <PromptField.Submit label="Generate" />
 *     </PromptField.Footer>
 *   </PromptField>
 *
 * Built-in (no opt-in needed):
 *   - Ctrl-V paste of images → adds to attachments
 *   - Drop zone (whole field) with overlay on dragenter
 *   - @-mention scan in textarea (calls back when query changes / picked)
 *   - File size + MIME-prefix gate (default: image-only, 50 MB) with a
 *     toast-friendly error callback. Configurable via `fileAccept` (single
 *     prefix or list) + `maxBytes` + `tooLargeMessage` props.
 *   - Auto-resize textarea (2-8 rows)
 *   - Cmd+Enter / Enter submit (Enter blocked when mention picker open;
 *     on touch devices plain Enter inserts a newline — Submit button only)
 *
 * Caller responsibilities:
 *   - Provide onAttachmentsChange to manage chip list
 *   - Provide onFileUpload(file) → Promise<{url}> for upload pipeline
 *   - Provide mentionSuggestions[] + onMentionQueryChange + onMentionPick
 *   - Render mention picker UI itself (anchored to whatever element)
 */

import './PromptField.scss'

import {
  AddOutline,
  CloseCircleOutline,
  RotateCcwOutline,
  StopOutline,
  TrashOutline,
  UploadOutline,
} from '@klyp/icons/outline'
import { Button, type ButtonProps } from '@klyp/ui/Button'
import { Tooltip, TooltipContent } from '@klyp/ui/Tooltip'
import {
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentProps,
  type KeyboardEvent,
  lazy,
  type DragEvent as ReactDragEvent,
  type ReactNode,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useBrand } from '../_brand-context'
import { AttachmentSlot } from '../AttachmentSlot'
import { CdnImage } from '../CdnImage'
import { fileMatchesAccept, fileWithResolvedType, type InferMimeFromName } from './file-accept'
import { Ctx, type PromptFieldCtx, usePromptField } from './prompt-field-context'

// TipTap runtime is heavy — only surfaces that opt into inline mention pills
// (`<PromptField.Textarea mentions />`) pull it in, via this lazy boundary.
const RichTextarea = lazy(() => import('./RichTextarea'))

const PF_COPY = {
  klyp: {
    dropOverlay: 'Drop image here',
    unsupportedType: (name: string) => `"${name}" is not a supported file type.`,
    tooLarge: (name: string, mb: string) => `"${name}" is too large (${mb} MB). Max 50 MB.`,
    typeMessage: 'Type your message…',
    promptAria: 'Prompt',
    removeAll: 'Remove all attachments',
    removeAllTitle: 'Remove all',
    removeAttachment: (name: string) => `Remove ${name}`,
    attachFile: 'Attach file',
    attachFromComputer: 'Upload from computer',
    attachFromLibrary: 'Choose from library',
    submit: 'Submit',
    submitting: 'Submitting…',
    stop: 'Stop',
    retry: 'Retry',
  },
  unreals: {
    dropOverlay: 'Перетащи картинку сюда',
    unsupportedType: (name: string) => `«${name}» — неподдерживаемый тип файла.`,
    tooLarge: (name: string, mb: string) => `«${name}» слишком большой (${mb} МБ). Макс. 50 МБ.`,
    typeMessage: 'Напиши сообщение…',
    promptAria: 'Промт',
    removeAll: 'Убрать все вложения',
    removeAllTitle: 'Убрать все',
    removeAttachment: (name: string) => `Убрать ${name}`,
    attachFile: 'Прикрепить файл',
    attachFromComputer: 'Загрузить с компьютера',
    attachFromLibrary: 'Выбрать из библиотеки',
    submit: 'Отправить',
    submitting: 'Отправляем…',
    stop: 'Стоп',
    retry: 'Повторить',
  },
} as const

// =====================================================================
// Types
// =====================================================================

// Attachment + mention types live in a standalone module so the lazily-loaded
// RichTextarea can share them without an import cycle. Re-exported here so
// existing `import { PromptFieldAttachment } from '../PromptField'` callers are
// unaffected.
export type {
  PromptFieldAttachment,
  PromptFieldAttachmentKind,
  PromptMentionInsert,
  PromptMentionItem,
  PromptMentionKind,
} from './PromptField.types'

import type { PromptFieldAttachment, PromptMentionInsert } from './PromptField.types'

/**
 * 50 MiB cap (52,428,800 bytes). Kept numerically in sync with the
 * authoritative server gate in `convex/lib/uploadLimits.ts` →
 * `MAX_UPLOAD_BYTES`. We don't import that constant directly because this
 * package (`@klyp/brand`) is layered below `apps/web/convex` and must stay
 * backend-agnostic — but if you bump one, bump the other in the same PR.
 *
 * Bumped from 10 MiB → 25 MiB on 2026-05-21 once the upload path moved
 * from `v.bytes()` action arg (capped by Convex envelope) to R2 presigned
 * PUT. Bumped 25 → 50 MiB on 2026-06-10 to match `MAX_UPLOAD_BYTES`:
 * gen-model outputs (lossless high-res PNGs) can exceed 25 MiB, so this
 * client default was blocking users from re-feeding an image the chat had
 * just generated. Per-model limits (Claude 5 MB, Kling 10 MB, etc.) are
 * advisory and surfaced as inline warnings in the composer — NOT enforced
 * here.
 */
export const PROMPT_FIELD_MAX_BYTES = 50 * 1024 * 1024 // 50 MB

// Context lives in its own module (prompt-field-context.ts) so the lazily
// loaded RichTextarea can consume it without a circular import.

// =====================================================================
// Root
// =====================================================================

export interface PromptFieldProps {
  /** Controlled prompt text. */
  value?: string
  /** Default text for uncontrolled mode. */
  defaultValue?: string
  onValueChange?: (next: string) => void

  /** Attachment list (controlled). */
  attachments?: PromptFieldAttachment[]
  onAttachmentsChange?: (next: PromptFieldAttachment[]) => void

  /** Called when files arrive via paste / drop / picker — caller handles
   *  upload + then mutates attachments via onAttachmentsChange. */
  onFiles?: (files: File[]) => void

  /** Submit handler. Fired on Cmd+Enter, Enter (no-shift), or Submit click. */
  onSubmit?: () => void

  /** Allow submit? Default: text non-empty AND no uploading attachment. */
  canSubmit?: boolean

  /** Marks busy state — Submit shows busy label, mesh dims. */
  busy?: boolean

  /** External stream status. When 'streaming' AND `onStop` provided,
   *  Submit button glyph swaps to Stop and onPress fires onStop. */
  status?: 'idle' | 'submitting' | 'streaming' | 'error'
  /** Called when user clicks Submit while status='streaming'. */
  onStop?: () => void

  /** Called with descriptive message when a file is rejected (oversized,
   *  non-image, etc.) — caller pipes to toast. */
  onFileError?: (message: string) => void

  /** File MIME prefix(es) accepted by paste/drop/picker. A single prefix
   *  (`'image/'`) or a list (`['image/', 'video/']`). A file passes when its
   *  `type` starts with ANY entry. Default `'image/'` — keeps image-only
   *  callers unchanged. */
  fileAccept?: string | readonly string[]

  /** Max accepted file size in bytes. Default `PROMPT_FIELD_MAX_BYTES`
   *  (50 MiB). Pass a larger number, or a `(file) => bytes` resolver when the
   *  cap is per-type (e.g. `maxUploadBytesForMime` — image 50 MiB / video 50 MB
   *  / audio 100 MiB). The resolver receives the type-resolved File. */
  maxBytes?: number | ((file: File) => number)

  /** Optional MIME inference from a filename, used to recover an empty or
   *  unreliable `File.type` (the browser leaves it `''` — or reports
   *  `application/octet-stream` — for many video files on Windows) BEFORE the
   *  accept gate AND before upload. When provided, a file whose own type is
   *  missing/untrusted is reconstructed with the inferred MIME so the corrected
   *  type flows through the whole upload pipeline. When omitted, the gate stays
   *  strict MIME-only — image-only callers are unaffected. Inject e.g.
   *  `inferMimeFromExtension` from `@klyp/models`. */
  inferType?: InferMimeFromName

  /** Build the "file too large" error string. Lets the consumer own the copy
   *  (incl. the correct MB cap) so this package stays brand/locale-agnostic.
   *  When omitted, falls back to the built-in 25 MB-worded default. */
  tooLargeMessage?: (name: string, mb: string) => string

  /** Disable Ctrl-V paste handling. */
  paste?: boolean
  /** Disable drop zone. */
  drop?: boolean

  /** Custom drop overlay label. */
  dropOverlayLabel?: string
  /** Custom full-field surface rendered IN PLACE of the built-in "Drop … here"
   *  overlay (absolute, covers the whole field). Shown while a file is dragged
   *  over the field OR when `showDropSurface` is set. The chat composer passes
   *  the split-panel mode picker here — so a drag (or a pill click) turns the
   *  whole composer into the mode chooser while prompt + footer stay in flow
   *  underneath (preserving height). Omit → the default overlay. */
  dropSurface?: ReactNode
  /** Force the `dropSurface` on without a drag (e.g. a click that opened the
   *  chooser). Ignored when `dropSurface` is omitted. */
  showDropSurface?: boolean
  /** Suppress the built-in "Drop … here" overlay even when NO `dropSurface` is
   *  set — for surfaces that manage their own attach UI (the chat composer's
   *  video slot group: dragging onto a filled row just adds, no overlay). */
  hideDropOverlay?: boolean

  className?: string
  children: ReactNode
}

function Root({
  value: valueProp,
  defaultValue = '',
  onValueChange,
  attachments: attachmentsProp,
  onAttachmentsChange,
  onFiles,
  onSubmit,
  canSubmit: canSubmitProp,
  busy = false,
  status: statusProp,
  onStop,
  onFileError,
  fileAccept = 'image/',
  maxBytes = PROMPT_FIELD_MAX_BYTES,
  tooLargeMessage,
  inferType,
  paste = true,
  drop = true,
  dropOverlayLabel,
  dropSurface,
  showDropSurface = false,
  hideDropOverlay = false,
  className,
  children,
}: PromptFieldProps) {
  const { brandId } = useBrand()
  const _pf = useMemo(() => PF_COPY[brandId], [brandId])
  const resolvedDropOverlayLabel = dropOverlayLabel ?? _pf.dropOverlay
  // ---- Value (controlled or uncontrolled) ----
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = valueProp ?? internalValue
  const setValue = useCallback(
    (next: string) => {
      if (onValueChange) onValueChange(next)
      else setInternalValue(next)
    },
    [onValueChange],
  )

  // ---- Attachments (controlled or uncontrolled) ----
  const [internalAttach, setInternalAttach] = useState<PromptFieldAttachment[]>([])
  const attachments = attachmentsProp ?? internalAttach
  const setAttachments = useCallback(
    (next: PromptFieldAttachment[]) => {
      if (onAttachmentsChange) onAttachmentsChange(next)
      else setInternalAttach(next)
    },
    [onAttachmentsChange],
  )
  const removeAttachment = useCallback(
    (id: string) => {
      const next = attachments.filter((a) => a.id !== id)
      setAttachments(next)
    },
    [attachments, setAttachments],
  )

  // ---- File pipeline ----
  const handleFiles = useCallback(
    (files: File[]) => {
      // Normalize accept to a prefix list so a file passes when its MIME
      // starts with ANY entry (image-only callers pass a single string; the
      // chat composer passes ['image/', 'video/', …]).
      const acceptList = Array.isArray(fileAccept) ? fileAccept : [fileAccept]
      const accepted: File[] = []
      for (const f of files) {
        // The browser derives File.type from the OS extension registry, not the
        // bytes — on Windows it is frequently '' (or 'application/octet-stream')
        // for .mp4 / .mov / .m4v / .webm. When the consumer supplies `inferType`,
        // fill the missing MIME from the filename extension and reconstruct the
        // File so the corrected type flows through the whole upload pipeline
        // (gate → presigned PUT Content-Type → server magic-byte sniff). Callers
        // that don't pass `inferType` keep the exact strict MIME-only behaviour.
        const file = fileWithResolvedType(f, inferType)
        if (!fileMatchesAccept(file, acceptList)) {
          onFileError?.(_pf.unsupportedType(file.name))
          continue
        }
        const cap = typeof maxBytes === 'function' ? maxBytes(file) : maxBytes
        if (file.size > cap) {
          const mb = (file.size / 1024 / 1024).toFixed(1)
          onFileError?.((tooLargeMessage ?? _pf.tooLarge)(file.name, mb))
          continue
        }
        accepted.push(file)
      }
      if (accepted.length > 0) onFiles?.(accepted)
    },
    [fileAccept, maxBytes, tooLargeMessage, onFileError, onFiles, _pf, inferType],
  )

  // ---- Drag state ----
  const [dragOver, setDragOver] = useState(false)
  const dragCounter = useRef(0)

  const onDragEnter = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!drop) return
    e.preventDefault()
    dragCounter.current += 1
    if (e.dataTransfer.types.includes('Files')) setDragOver(true)
  }
  const onDragLeave = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!drop) return
    e.preventDefault()
    dragCounter.current -= 1
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setDragOver(false)
    }
  }
  const onDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!drop) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }
  const onDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    if (!drop) return
    e.preventDefault()
    dragCounter.current = 0
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) handleFiles(files)
  }

  // ---- Submit ----
  const computedCanSubmit =
    canSubmitProp ?? (value.trim().length > 0 && !attachments.some((a) => a.uploading))
  const submit = useCallback(() => {
    if (!computedCanSubmit || busy) return
    onSubmit?.()
  }, [computedCanSubmit, busy, onSubmit])

  // ---- Mention picker open flag ----
  const [mentionOpen, setMentionOpen] = useState(false)

  // ---- Status (controlled or derived from busy) ----
  const status: PromptFieldCtx['status'] = statusProp ?? (busy ? 'submitting' : 'idle')

  const ctx = useMemo<PromptFieldCtx>(
    () => ({
      value,
      setValue,
      attachments,
      setAttachments,
      removeAttachment,
      busy,
      canSubmit: computedCanSubmit,
      submit,
      onFiles: handleFiles,
      dragOver,
      mentionOpen,
      setMentionOpen,
      status,
      onStop,
    }),
    [
      value,
      setValue,
      attachments,
      setAttachments,
      removeAttachment,
      busy,
      computedCanSubmit,
      submit,
      handleFiles,
      dragOver,
      mentionOpen,
      status,
      onStop,
    ],
  )

  // ---- Paste (window-level — works regardless of focus location) ----
  useEffect(() => {
    if (!paste) return
    const onWindowPaste = (e: globalThis.ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return
      const files: File[] = []
      for (const it of Array.from(items)) {
        if (it.kind === 'file') {
          const f = it.getAsFile()
          if (f) files.push(f)
        }
      }
      if (files.length > 0) {
        e.preventDefault()
        handleFiles(files)
      }
    }
    window.addEventListener('paste', onWindowPaste)
    return () => window.removeEventListener('paste', onWindowPaste)
  }, [paste, handleFiles])

  return (
    <Ctx.Provider value={ctx}>
      <section
        data-slot="prompt-field"
        data-busy={busy ? '' : undefined}
        data-dragover={dragOver ? '' : undefined}
        className={['klyp-PromptField', className].filter(Boolean).join(' ')}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {children}
        {drop && dropSurface && (dragOver || showDropSurface) ? (
          // Consumer-owned full-field surface (chat: the split-panel mode
          // picker) — covers the field so prompt + footer visually disappear
          // while staying in flow underneath (the field keeps its height; the
          // surface fills it via inset:0).
          <div className="klyp-PromptField__dropSurface" data-dragover={dragOver ? '' : undefined}>
            {dropSurface}
          </div>
        ) : drop && dragOver && !hideDropOverlay ? (
          // Default overlay — same structure as the LibraryPicker's whole-modal
          // drop overlay (icon over label, both fg-primary). Icon 32px.
          <div aria-hidden className="klyp-PromptField__dropOverlay">
            <UploadOutline width={32} height={32} />
            <span className="klyp-PromptField__dropOverlayLabel">{resolvedDropOverlayLabel}</span>
          </div>
        ) : null}
      </section>
    </Ctx.Provider>
  )
}

// =====================================================================
// Header (optional eyebrow / meta row above textarea)
// =====================================================================

function Header({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <header
      data-slot="prompt-field-header"
      className={['klyp-PromptField__header', className].filter(Boolean).join(' ')}
    >
      {children}
    </header>
  )
}

// =====================================================================
// Attachments (chip-row or tile-row)
// =====================================================================

interface AttachmentsProps {
  className?: string
  /** Visual mode for each attachment.
   *
   *  - `'chip'` (default) — 28px-tall horizontal text chip with mini thumb +
   *    name + X. Backward-compatible original look (Studio + legacy callers).
   *  - `'tile'` — `<AttachmentSlot>` rendering: 80×80 image tiles for
   *    thumbnail-bearing attachments, file cards (name + type glyph/label)
   *    when no thumbnail. AttachmentSlot owns the status ring (uploading dim +
   *    spinner, error/warning outline) + remove ×. Use when the surface has
   *    horizontal space for a media-rich row.
   */
  variant?: 'chip' | 'tile'
}

function Attachments({ className, variant = 'chip' }: AttachmentsProps) {
  const { attachments, removeAttachment, setAttachments } = usePromptField()
  const { brandId } = useBrand()
  const _pf = PF_COPY[brandId]
  if (attachments.length === 0) return null

  if (variant === 'tile') {
    // Single batch operation — consumer's onAttachmentsChange handler
    // (e.g. composer.handleAttachmentsChange) diffs old vs new and fires
    // abandonUpload for each removed R2 key in one render cycle. Looping
    // removeAttachment per-id would trigger N sequential re-renders and
    // show the tiles disappearing one-by-one.
    const clearAll = () => setAttachments([])

    return (
      <div
        data-slot="prompt-field-attachments"
        data-variant="tile"
        className={['klyp-PromptField__attachments', className].filter(Boolean).join(' ')}
      >
        <button
          type="button"
          onClick={clearAll}
          aria-label={_pf.removeAll}
          title={_pf.removeAllTitle}
          className="klyp-PromptField__clearAll"
        >
          <TrashOutline width={16} height={16} />
        </button>
        {attachments.map((a) => {
          // AttachmentSlot owns the whole tile: thumbnail → 80×80 image tile,
          // name-only → file card, plus the status ring AND a top-left corner
          // status badge whose hover tooltip carries the error/warning text —
          // so the message never takes row space or shoves neighbouring tiles.
          const status = a.uploading
            ? 'uploading'
            : a.error
              ? 'error'
              : a.warning
                ? 'warning'
                : 'idle'
          return (
            <AttachmentSlot
              key={a.id}
              thumbnailUrl={a.thumbnailUrl}
              name={a.name}
              status={status}
              message={a.error ?? a.warning}
              onRemove={a.uploading ? undefined : () => removeAttachment(a.id)}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div
      data-slot="prompt-field-attachments"
      className={['klyp-PromptField__attachments', className].filter(Boolean).join(' ')}
    >
      {attachments.map((a) => (
        <div key={a.id} className="klyp-PromptField__attachment">
          <div
            data-kind={a.kind}
            data-uploading={a.uploading ? '' : undefined}
            data-error={a.error ? '' : undefined}
            data-warning={!a.error && a.warning ? '' : undefined}
            className="klyp-PromptField__chip"
          >
            {a.thumbnailUrl ? (
              <CdnImage
                alt=""
                aria-hidden
                src={a.thumbnailUrl}
                draggable={false}
                size="chip"
                className="klyp-PromptField__chipThumb"
              />
            ) : (
              <span aria-hidden className="klyp-PromptField__chipDot" />
            )}
            <span className="klyp-PromptField__chipLabel">{a.name}</span>
            {a.uploading ? (
              <span aria-hidden className="klyp-PromptField__chipSpinner" />
            ) : (
              <button
                type="button"
                aria-label={_pf.removeAttachment(a.name)}
                onClick={() => removeAttachment(a.id)}
                className="klyp-PromptField__chipRemove"
              >
                <CloseCircleOutline width={8} height={8} aria-hidden />
              </button>
            )}
          </div>
          {a.error ? (
            <span
              role="alert"
              title={a.error}
              data-tone="error"
              className="klyp-PromptField__attachmentMessage"
            >
              {a.error}
            </span>
          ) : a.warning ? (
            <span
              role="status"
              title={a.warning}
              data-tone="warning"
              className="klyp-PromptField__attachmentMessage"
            >
              {a.warning}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

// =====================================================================
// Textarea (with @-mention scan)
// =====================================================================

interface TextareaProps {
  placeholder?: string
  minRows?: number
  maxRows?: number
  /** Called when @-query string changes (or null when picker should close). */
  onMentionQueryChange?: (query: string | null) => void
  /** Set by caller to indicate picker is open — closes on Esc, blocks submit. */
  mentionPickerOpen?: boolean
  /** Opt into the rich TipTap surface where `@`-mentions render as inline
   *  PILLS (thumbnail + kind-tinted label) instead of plain `@Name` text.
   *  Lazily loads the TipTap runtime — surfaces that don't set this keep the
   *  plain `<textarea>` and ship no TipTap. */
  mentions?: boolean
  /** Rich mode only — receives the active insert command (or `null`) so the
   *  caller's `<MentionPicker>` can turn the typed `@query` into a pill. */
  onMentionCommand?: (insert: PromptMentionInsert) => void
  className?: string
  /** Override id for label/aria. */
  id?: string
  /** Aria label fallback. */
  ariaLabel?: string
}

function autoResize(el: HTMLTextAreaElement, minRows: number, maxRows: number) {
  el.style.height = 'auto'
  const lh = Number.parseFloat(getComputedStyle(el).lineHeight) || 22
  const min = lh * minRows
  const max = lh * maxRows
  const target = Math.min(Math.max(el.scrollHeight, min), max)
  el.style.height = `${target}px`
  // Scrollbar appears only when content actually exceeds the cap. Below cap —
  // hidden, so the textarea grows seamlessly with content.
  el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden'
}

// Pure branch — no hooks here, so the rich vs plain choice never violates the
// rules-of-hooks (each child calls its own hooks unconditionally).
function Textarea(props: TextareaProps) {
  return props.mentions ? <MentionTextarea {...props} /> : <PlainTextarea {...props} />
}

// Rich mode → TipTap surface with inline mention pills (lazy). Rendered
// through Suspense; the fallback is an empty field of the same footprint so
// there's no layout jump before the chunk resolves.
function MentionTextarea({
  placeholder,
  ariaLabel,
  minRows = 1,
  maxRows = 8,
  onMentionQueryChange,
  mentionPickerOpen = false,
  onMentionCommand,
  className,
  id,
}: TextareaProps) {
  const { brandId } = useBrand()
  const _pf = PF_COPY[brandId]
  return (
    <Suspense
      fallback={
        <div
          aria-hidden
          className={['klyp-PromptField__editor', className].filter(Boolean).join(' ')}
          style={{ minHeight: 'calc(1em * 1.5)' }}
        />
      }
    >
      <RichTextarea
        placeholder={placeholder ?? _pf.typeMessage}
        ariaLabel={ariaLabel ?? _pf.promptAria}
        minRows={minRows}
        maxRows={maxRows}
        onMentionQueryChange={onMentionQueryChange}
        mentionPickerOpen={mentionPickerOpen}
        onMentionCommand={onMentionCommand}
        className={className}
        id={id}
      />
    </Suspense>
  )
}

function PlainTextarea({
  placeholder,
  minRows = 1,
  maxRows = 8,
  onMentionQueryChange,
  mentionPickerOpen = false,
  className,
  id,
  ariaLabel,
}: TextareaProps) {
  const { value, setValue, submit, mentionOpen, setMentionOpen } = usePromptField()
  const { brandId } = useBrand()
  const _pf = PF_COPY[brandId]
  const resolvedPlaceholder = placeholder ?? _pf.typeMessage
  const ref = useRef<HTMLTextAreaElement>(null)

  // Sync external mention-picker-open state into context (so Enter handler
  // knows not to submit when picker is open).
  useEffect(() => {
    setMentionOpen(mentionPickerOpen)
  }, [mentionPickerOpen, setMentionOpen])

  // Auto-resize on value change AND on programmatic resets (e.g. setValue('')
  // after submit, or setText() from useChatActionsStore.consumeToPrompt).
  // Without `value` in deps the effect fires once on mount and never
  // recomputes — textarea stuck at last keystroke height after submit clears
  // text, because the input event doesn't fire on controlled-prop reset.
  // `value` is the resize trigger even though the body reads ref.current (not
  // value directly) — hence the biome-ignore for the "extra" dependency.
  // biome-ignore lint/correctness/useExhaustiveDependencies: value is the resize trigger
  useEffect(() => {
    if (ref.current) autoResize(ref.current, minRows, maxRows)
  }, [value, minRows, maxRows])

  // Scan backwards from caret for the most recent `@`.
  const scanMention = useCallback((text: string, caret: number): string | null => {
    const before = text.slice(0, caret)
    const at = before.lastIndexOf('@')
    if (at < 0) return null
    const run = before.slice(at + 1)
    if (/\s/.test(run)) return null
    const prev = at > 0 ? before[at - 1] : ' '
    if (!/[\s\n]/.test(prev)) return null
    return run
  }, [])

  const refreshMention = useCallback(
    (text: string, caret: number) => {
      const q = scanMention(text, caret)
      onMentionQueryChange?.(q)
    },
    [scanMention, onMentionQueryChange],
  )

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value
    setValue(next)
    // Synchronous resize on each keystroke avoids the 1-frame flash where the
    // textarea would otherwise paint at the previous height before the
    // useEffect catches up. Belt-and-braces with the effect above — effect
    // covers programmatic value changes (clear after submit), this handler
    // covers user input.
    if (ref.current) autoResize(ref.current, minRows, maxRows)
    refreshMention(next, e.target.selectionStart ?? next.length)
  }
  const handleSelect = (e: ChangeEvent<HTMLTextAreaElement>) => {
    refreshMention(e.target.value, e.target.selectionStart ?? e.target.value.length)
  }
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionOpen) return // picker handles arrows / enter / esc
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      submit()
      return
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      // На touch-устройствах виртуальная клава не даёт Shift+Enter —
      // Enter оставляем за переносом строки, отправка только через Submit.
      if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
        return
      }
      e.preventDefault()
      submit()
    }
  }
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    // Window-level paste handler (in Root) catches the file. Here we just
    // suppress pasting binary as text — let the field-level handler take over.
    const items = e.clipboardData?.items
    if (!items) return
    for (const it of Array.from(items)) {
      if (it.kind === 'file') {
        e.preventDefault()
        return
      }
    }
  }

  return (
    <textarea
      ref={ref}
      id={id}
      data-slot="prompt-field-textarea"
      aria-label={ariaLabel ?? _pf.promptAria}
      value={value}
      onChange={handleChange}
      onSelect={handleSelect}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={resolvedPlaceholder}
      rows={minRows}
      className={['klyp-PromptField__textarea', className].filter(Boolean).join(' ')}
    />
  )
}

// =====================================================================
// Footer
// =====================================================================

function Footer({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <footer
      data-slot="prompt-field-footer"
      className={['klyp-PromptField__footer', className].filter(Boolean).join(' ')}
    >
      {children}
    </footer>
  )
}

function Spacer() {
  return <span data-slot="prompt-field-spacer" aria-hidden className="klyp-PromptField__spacer" />
}

// =====================================================================
// AttachButton (file picker `+`)
// =====================================================================

interface AttachButtonProps {
  accept?: string
  multiple?: boolean
  ariaLabel?: string
  className?: string
  /**
   * When provided, the `+` button opens a dropdown menu with two options
   * — "Upload from computer" (the existing native file picker) and
   * "Choose from library" (calls this callback). When omitted, the button
   * falls back to the legacy direct file-picker behaviour so existing
   * callers (studio composer, asset editor) don't need to opt in.
   */
  onPickFromLibrary?: () => void
}

function AttachButton({
  accept = 'image/*',
  multiple = true,
  ariaLabel,
  className,
  onPickFromLibrary,
}: AttachButtonProps) {
  const { onFiles, busy } = usePromptField()
  const { brandId } = useBrand()
  const _pf = PF_COPY[brandId]
  const resolvedAriaLabel = ariaLabel ?? _pf.attachFile
  const inputRef = useRef<HTMLInputElement>(null)

  const mergedClass = ['klyp-PromptField__attach', className].filter(Boolean).join(' ')

  // Hidden native file input — reached only by the legacy direct-pick fallback
  // below (no `onPickFromLibrary`).
  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      tabIndex={-1}
      aria-hidden="true"
      className="klyp-PromptField__attachInput"
      onChange={(e) => {
        const files = e.target.files ? Array.from(e.target.files) : []
        if (files.length > 0) onFiles(files)
        e.target.value = ''
      }}
    />
  )

  // The attach control IS the DS <Button variant="primary" size="icon-lg"> —
  // 1:1 with the design-system icon button (filled primary surface, --r-card
  // radius, --icon-size-md glyph). `onPickFromLibrary` opens the picker modal
  // directly; without it, the legacy hidden-input dialog.
  if (onPickFromLibrary) {
    return (
      <Button
        variant="primary"
        size="icon"
        aria-label={resolvedAriaLabel}
        onPress={onPickFromLibrary}
        isDisabled={busy}
        data-slot="prompt-field-attach"
        className={mergedClass}
      >
        <AddOutline width={22} height={22} aria-hidden />
      </Button>
    )
  }

  return (
    <>
      <Button
        variant="primary"
        size="icon"
        aria-label={resolvedAriaLabel}
        onPress={() => inputRef.current?.click()}
        isDisabled={busy}
        data-slot="prompt-field-attach"
        className={mergedClass}
      >
        <AddOutline width={22} height={22} aria-hidden />
      </Button>
      {fileInput}
    </>
  )
}

// =====================================================================
// CostPreview
// =====================================================================

interface CostPreviewProps {
  etaSec?: number
  usd?: number
  className?: string
}

function CostPreview({ etaSec, usd, className }: CostPreviewProps) {
  if (etaSec == null && usd == null) return null
  return (
    <span
      data-slot="prompt-field-cost"
      className={['klyp-PromptField__cost', className].filter(Boolean).join(' ')}
    >
      <span className="klyp-PromptField__costTilde">~</span>
      {etaSec != null && <span>{etaSec}s</span>}
      {etaSec != null && usd != null && <span aria-hidden> · </span>}
      {usd != null && <span>${usd.toFixed(2)}</span>}
    </span>
  )
}

// =====================================================================
// Submit (uses the DS @klyp/ui Button — accent idle CTA)
// =====================================================================

interface SubmitProps
  extends Omit<
    ButtonProps,
    'onClick' | 'children' | 'variant' | 'size' | 'state' | 'iconLeft' | 'iconRight'
  > {
  /** Text shown when idle. */
  label?: string
  /** Text shown when `busy` (from PromptField context). */
  busyLabel?: string
  /** Optional custom children (icon + label) — when present, takes precedence
   *  over `label`. Pass SVG as DIRECT child (no wrapping span) so the
   *  icon-grow-on-hover rule (the DS Button's `> svg` glyph selector) fires. */
  children?: ReactNode
  /** Text-button height. Only `'md'` is used in practice; kept for callsite
   *  compatibility. Ignored in `iconOnly` mode (the square locks to `'icon'`
   *  = the 36px control-size-md square). */
  size?: 'sm' | 'md' | 'lg'
  /** Icon-only square mode: render ONLY the icon (children for idle, the
   *  built-in Stop / Retry glyph for streaming / error) with no visible text —
   *  `label` becomes the accessible name. Streaming reads silver (the DS
   *  `secondary` neutral surface) so it de-emphasises vs the accent idle CTA.
   *  The composer footer uses this so the submit is a square button beside the
   *  (square) mic. */
  iconOnly?: boolean
  /** Tooltip copy for the idle-DISABLED submit (empty prompt / failed
   *  `canSubmit` gate). When set, the disable turns SOFT: `isDisabled` stays
   *  false so hover/focus still fire, press is blocked, and the button carries
   *  `aria-disabled` + `data-soft-disabled` and is wrapped in the DS Tooltip
   *  showing this hint — a natively-disabled button swallows hover, so no
   *  tooltip is possible there (spec 2026-07-02 §5 Phase 2 / §11.5). Applies
   *  ONLY to the idle-gate disable — while `busy` (mid-submit) and in the
   *  streaming / error branches the behaviour is exactly the legacy one.
   *  Omit → the exact legacy native-disabled behaviour (chat unchanged). */
  disabledHint?: string
}

function Submit({
  label,
  busyLabel,
  children,
  iconOnly = false,
  size = 'md',
  disabledHint,
  ...rest
}: SubmitProps) {
  const { canSubmit, busy, submit, status, onStop } = usePromptField()
  const { brandId } = useBrand()
  const _pf = PF_COPY[brandId]
  const resolvedLabel = label ?? _pf.submit
  const resolvedBusyLabel = busyLabel ?? _pf.submitting
  const isStreaming = status === 'streaming' && !!onStop
  const isError = status === 'error'

  // Icon-only → the DS Button's square icon size (36px = control-size-md,
  // padding:0). Text mode keeps the requested text size (36px md height). The
  // 14px glyph + central hover-zoom for the square come from PromptField.scss
  // (re-pointed at the DS Button's `> svg` glyph), overriding the DS 16px.
  const dsSize: ButtonProps['size'] = iconOnly ? 'icon' : size

  if (isStreaming) {
    return (
      <Button
        {...rest}
        // Stop reads as a de-emphasised SILVER control, not the accent CTA —
        // the DS `secondary` neutral surface. Glyph swaps to Stop, onPress→onStop.
        variant="secondary"
        size={dsSize}
        isDisabled={false}
        onPress={onStop}
        data-slot="prompt-field-submit"
        data-state={status}
        data-icon-only={iconOnly || undefined}
        aria-label={iconOnly ? _pf.stop : undefined}
      >
        <StopOutline width={16} height={16} />
        {!iconOnly && _pf.stop}
      </Button>
    )
  }

  if (isError) {
    return (
      <Button
        {...rest}
        // Error/Retry = plain `secondary` (no gold glow) — gold is reserved for
        // the ready-to-send idle CTA only (Val 2026-06-30). canSubmit gates re-fire.
        variant="secondary"
        size={dsSize}
        isDisabled={!canSubmit}
        onPress={submit}
        data-slot="prompt-field-submit"
        data-state={status}
        data-icon-only={iconOnly || undefined}
        aria-label={iconOnly ? _pf.retry : undefined}
      >
        <RotateCcwOutline width={16} height={16} />
        {!iconOnly && _pf.retry}
      </Button>
    )
  }

  const disabled = !canSubmit || busy
  // Soft-disable (spec 2026-07-02 §5 Phase 2): only when the disable reason is
  // the idle gate (NOT busy — mid-submit keeps the native disable; the busy
  // label already explains the state) AND the consumer supplied a hint. The
  // button stays focusable (isDisabled=false — the a11y-recommended
  // aria-disabled pattern, and the only way hover can reach a tooltip), press
  // is blocked, and PromptField.scss keys the disabled look + the placeholder
  // pulse off `data-soft-disabled`.
  const softDisabled = disabled && !busy && !!disabledHint
  const button = (
    <Button
      {...rest}
      // Idle: the accent CTA (gold glow) ONLY when ready to send; plain
      // `secondary` (no glow) when disabled (empty prompt / busy) — so the glow
      // APPEARS as the prompt fills (the secondary→accent swap animates the bg +
      // box-shadow via the transition list), instead of an always-on dimmed glow
      // that reads as a stray outline on the inactive button. (Val 2026-06-30)
      variant={disabled ? 'secondary' : 'accent'}
      size={dsSize}
      isDisabled={softDisabled ? false : disabled}
      onPress={softDisabled ? undefined : submit}
      data-slot="prompt-field-submit"
      data-state={status}
      data-icon-only={iconOnly || undefined}
      data-soft-disabled={softDisabled || undefined}
      aria-disabled={softDisabled || undefined}
      // Icon-only: the icon (children) IS the content; `label` is the a11y
      // name — busy swaps it to `busyLabel` so SRs hear the in-flight state
      // (was dead in iconOnly: busyLabel never rendered NOR announced —
      // spec 2026-07-02 §11.5.7).
      aria-label={iconOnly ? (busy ? resolvedBusyLabel : resolvedLabel) : undefined}
    >
      {iconOnly ? children : busy ? resolvedBusyLabel : (children ?? resolvedLabel)}
    </Button>
  )

  if (softDisabled) {
    // Same Tooltip pairing AttachmentSlot's status badge uses (RAC
    // TooltipTrigger adds NO wrapper element — footer flex layout unaffected).
    return (
      <Tooltip delay={0}>
        {button}
        <TooltipContent side="top" maxWidth={220}>
          {disabledHint}
        </TooltipContent>
      </Tooltip>
    )
  }
  return button
}

// =====================================================================
// Compose
// =====================================================================

const PromptField = Object.assign(Root, {
  Header,
  Attachments,
  Textarea,
  Footer,
  Spacer,
  AttachButton,
  CostPreview,
  Submit,
})

export { PromptField }

// Re-export for callers that want to extend with custom footer items
// (e.g. ModelPicker, modality switcher) — these aren't owned by PromptField
// because they're feature-specific.
export type { ComponentProps as PromptFieldComponentProps }

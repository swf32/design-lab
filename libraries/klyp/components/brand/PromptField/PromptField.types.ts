/**
 * PromptField shared types — kept in a standalone module so both
 * `PromptField.tsx` and the lazily-loaded `RichTextarea.tsx` / the context
 * module can import them without an import cycle.
 */

export type PromptFieldAttachmentKind =
  | 'character'
  | 'location'
  | 'outfit'
  | 'vibe'
  | 'scene'
  | 'script'
  | 'asset'
  | 'upload'

export interface PromptFieldAttachment {
  id: string
  kind: PromptFieldAttachmentKind
  name: string
  /** Preview thumbnail URL (data URL ok during upload). */
  thumbnailUrl?: string
  /** Indicates upload in progress — disables submit. */
  uploading?: boolean
  /** Hard upload-failure message (network, server reject) — turns chip
   *  red and shows the message under the chip. The attachment is still
   *  in the list so the user can retry / remove it explicitly. */
  error?: string
  /** Soft compatibility warning for the currently-selected model
   *  (e.g. "Claude limit 5 MB" / "Kling doesn't accept WebP"). Turns
   *  chip amber and shows the message under the chip. Recomputed by
   *  the consumer when the model changes — the attachment itself is
   *  fine on R2; this is purely advisory at submit time. */
  warning?: string
}

/**
 * Kind of an inline `@`-mention pill. Superset kept loose (string-widened
 * via the union) so the chat's `AssetKind` maps in without a cast — the pill
 * SCSS keys colour off `data-kind` for these values, everything else falls
 * back to the neutral tint.
 */
export type PromptMentionKind =
  | 'character'
  | 'location'
  | 'outfit'
  | 'vibe'
  | 'scene'
  | 'script'
  | 'prop'
  | (string & {})

/**
 * The payload the mention picker injects into the rich editor to build a pill.
 * `label` is the display name (rendered in the pill and serialised back as
 * `@label` for the model prompt); `thumbnail` shows a mini preview when set.
 */
export interface PromptMentionItem {
  id: string
  label: string
  kind: PromptMentionKind
  thumbnail?: string
}

/** Imperative insert command surfaced by the rich editor while a `@`-query is
 *  active — the consumer (which owns the picker UI) calls it with the picked
 *  item to replace the typed `@query` with a pill. `null` when no query is
 *  active. */
export type PromptMentionInsert = ((item: PromptMentionItem) => void) | null

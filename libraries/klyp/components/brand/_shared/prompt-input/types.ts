/**
 * Prompt input file-attachment types.
 *
 * Extracted from the deleted `PromptInputLegacy/` module so consumer apps
 * (Zustand store, editor routes, visual-editor feature) keep a stable
 * import surface for file-attachment state shape — image/video/audio/file
 * with optional preview URL and upload status.
 *
 * NOTE: `PromptAttachment` (raw file uploads) is distinct from
 * `AssetAttachment` (asset references — character / location / outfit /
 * vibe). The latter used to live in the now-removed `AssetAttachmentBlock`
 * molecule (its render path consolidated into `AttachmentSlot`, 2026-06-30);
 * the TYPE moved here so the studio editor stack keeps a stable home.
 */

export type PromptAttachment = {
  id: string
  kind: 'image' | 'video' | 'audio' | 'file'
  name: string
  size?: number
  previewUrl?: string
  status?: 'uploading' | 'ready' | 'error'
  progress?: number
}

export type PromptFrameSlot = {
  id: 'startFrame' | 'endFrame'
  label: string
  attachment?: PromptAttachment
}

/** Asset-reference kinds — superset of AssetMention kinds. Used by the studio
 *  editor attachment state (`useAssetAttachments`) + PromptComposer. */
export type AssetAttachmentKind =
  | 'character'
  | 'location'
  | 'outfit'
  | 'vibe'
  | 'scene'
  | 'script'
  | 'prop'
  | 'upload'
  | 'asset'

/** An asset reference attached to a prompt (studio editor). Relocated here from
 *  the removed `AssetAttachmentBlock` molecule (2026-06-30) — the component was
 *  consolidated into `AttachmentSlot`, but this type is still the editor's
 *  attachment-state shape. */
export type AssetAttachment = {
  id: string
  kind: AssetAttachmentKind
  name: string
  description?: string
  thumbnailUrl?: string
  aspectRatio?: '9:16' | '16:9' | '1:1' | '4:5'
}

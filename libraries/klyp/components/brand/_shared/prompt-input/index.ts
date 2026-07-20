// prompt-input module — types + attachment-state hook ONLY.
// The legacy PromptInput compound (ai-elements re-export shim),
// PromptInputDropZone and the brand drag-contract copy were deleted in the
// Phase-4 composer cleanup (2026-07-02) — the live chassis is
// `@klyp/brand/PromptField`; the drag MIME contract's single source is the
// app-side `features/editor/components/library-drag-list.tsx`.
// What remains here is the stable import surface for the studio editor
// stack: PromptAttachment / AssetAttachment types + useAssetAttachments.

export type {
  AssetAttachment,
  AssetAttachmentKind,
  PromptAttachment,
  PromptFrameSlot,
} from './types'
export {
  type UseAssetAttachmentsReturn,
  useAssetAttachments,
} from './use-prompt-input-attachments'

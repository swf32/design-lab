/**
 * Shared types for PromptComposer module.
 *
 * All sub-components import from this file — keeps the public API
 * in one place and avoids circular dependencies.
 */

import type { AssetSuggestion } from '@klyp/brand/AssetMention'
import type { AssetAttachment } from '@klyp/brand/prompt-input'
import type { AtomRef } from './derive-atom-refs'

// ── Media & settings ──────────────────────────────────────────────────────────

export type MediaType = 'image' | 'video'

export type AspectRatio = '9:16' | '16:9' | '1:1' | '4:3' | '3:4'

export type ComposerMode = 'visual' | 'script'

export type CompiledMode = 'compiled' | 'raw'

// ── Model options ─────────────────────────────────────────────────────────────

export type ModelOption = {
  value: string
  label: string
  /** Emoji or single glyph rendered before the model label. */
  emoji?: string
  /** Family tag for grouping in the picker (e.g. "gemini" | "seedance"). */
  family?: string
}

// ── Cost preview ──────────────────────────────────────────────────────────────

export type CostPreview = {
  /** Estimated duration in seconds. */
  etaSec?: number
  /** Cost in USD — formatted by caller. */
  usd: number
}

// ── Image quality / size tier ─────────────────────────────────────────────────
// Mirrors `lib/model-capabilities.ts` ImageSize. Re-exported here so
// PromptComposer's popover/trigger don't import from a sibling lib file.

export type ImageSize = '0.5K' | '1K' | '2K' | '4K'

// ── Video resolution tier ─────────────────────────────────────────────────────

export type VideoResolution = '480p' | '720p'

// ── Generate settings (popover state shape) ───────────────────────────────────

export type GenerateSettings = {
  mediaType: MediaType
  aspectRatio: AspectRatio
  model: string
  /** Image quality tier — Gemini `image_config.image_size`. Image mode only. */
  imageSize?: ImageSize
  /** Video clip length (seconds). Video mode only. */
  durationSec?: number
  /** Video output resolution. Video mode only. */
  videoResolution?: VideoResolution
}

// ── Submit payload ────────────────────────────────────────────────────────────

export type PromptComposerSubmitPayload = {
  text: string
  mediaType: MediaType
  aspectRatio: AspectRatio
  model: string
  imageSize?: ImageSize
  durationSec?: number
  videoResolution?: VideoResolution
  attachments: AssetAttachment[]
  /** Phase B (2026-05-03) — derived at submit by deriveAtomRefs(). Server
   *  resolves DNA via `internal.atoms._resolveAtomsForAction` at Generate time;
   *  Drawer preview uses `api.atoms.previewBuiltPrompt`. */
  atomRefs: AtomRef[]
}

// ── Root props ────────────────────────────────────────────────────────────────

export type PromptComposerProps = {
  // ── Mode ──────────────────────────────────────────────────────────────────
  mode: ComposerMode

  // ── Visual mode ───────────────────────────────────────────────────────────
  mediaType?: MediaType
  onMediaTypeChange?: (m: MediaType) => void
  aspectRatio?: AspectRatio
  onAspectRatioChange?: (a: AspectRatio) => void
  /** AI model for image/video generation. Required for visual mode. */
  model?: string
  onModelChange?: (m: string) => void
  modelOptions?: ModelOption[]
  /** Image-only — quality tier ('0.5K' | '1K' | '2K' | '4K'). Default '2K'. */
  imageSize?: ImageSize
  onImageSizeChange?: (s: ImageSize) => void
  /** Video-only — clip length (seconds). Re-clamped on model change. */
  durationSec?: number
  onDurationSecChange?: (n: number) => void
  /** Video-only — output resolution. Re-clamped on model change. */
  videoResolution?: VideoResolution
  onVideoResolutionChange?: (r: VideoResolution) => void
  costPreview?: CostPreview

  // ── Script mode ───────────────────────────────────────────────────────────
  llmModel?: string
  onLlmModelChange?: (m: string) => void
  llmModelOptions?: ModelOption[]

  // ── Common ────────────────────────────────────────────────────────────────
  promptText: string
  onPromptTextChange: (t: string) => void
  attachments: AssetAttachment[]
  onAttachmentsChange?: (attachments: AssetAttachment[]) => void
  onSubmit: (payload: PromptComposerSubmitPayload) => void

  // ── Customisation ─────────────────────────────────────────────────────────
  className?: string
  placeholder?: string
  /** @deprecated 2026-05-03 — replaced by CompiledPanel Drawer in PromptArea.
   *  Pass `false` to suppress the legacy inline toggle. Kept for backward-compat. */
  showCompiledRawToggle?: boolean
  /** @deprecated 2026-05-03 — replaced by CompiledPanel Drawer. */
  compiledMode?: CompiledMode
  /** @deprecated 2026-05-03 — replaced by CompiledPanel Drawer. */
  onCompiledModeChange?: (m: CompiledMode) => void

  /** Override the submit action — e.g. open a GenerateSheet instead. */
  onGenerateClick?: () => void

  // ── @-mention picker ─────────────────────────────────────────────────────
  /** Filtered suggestions — caller drives via `useMentionPicker`. When omitted
   *  the textarea behaves as plain input (no `@`-detection). */
  mentionSuggestions?: AssetSuggestion[]
  /** Caller updates its picker query when textarea reports `@`-typing.
   *  `null` = picker closed; `''` = open with all assets; `'foo'` = filtered. */
  onMentionQueryChange?: (query: string | null) => void
  /** Optional — opens full Library palette (⌘K). */
  onMentionBrowseAll?: () => void
  /** Optional notifier — fires when the user picks an asset. */
  onMentionPick?: (asset: AssetSuggestion) => void

  children?: React.ReactNode
}

// Re-export AssetAttachment so callers don't need a second import.
export type { AssetAttachment, AssetSuggestion }
export type { AtomRef } from './derive-atom-refs'

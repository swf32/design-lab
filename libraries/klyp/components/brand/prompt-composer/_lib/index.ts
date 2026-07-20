/**
 * Prompt-composer utility barrel — post 2026-05-04 cleanup, trimmed again in
 * the Phase-4 composer cleanup (2026-07-02).
 *
 * The PromptComposer React component was DELETED — replaced by the unified
 * `<PromptField>` chassis in `@klyp/brand/PromptField`. The leftover
 * sub-components (generate-settings-trigger, media-type-tabs,
 * video-reference-slot, floating-chips) were superseded by
 * ComposerSettingsPopover / TabSwitcher / AttachmentSlotGroup and deleted.
 * This module now exports only the shared utilities that survived:
 * AspectRatioPicker (premise-screen), deriveAtomRefs (editor routes) and the
 * atom-payload / settings types.
 */

export { AspectRatioPicker } from './aspect-ratio-picker'
export type { AtomRef, DeriveInput } from './derive-atom-refs'
export { deriveAtomRefs } from './derive-atom-refs'
// Types
export type {
  AspectRatio,
  AssetAttachment,
  CompiledMode,
  ComposerMode,
  CostPreview,
  GenerateSettings,
  ImageSize,
  MediaType,
  ModelOption,
  PromptComposerSubmitPayload,
  VideoResolution,
} from './types'

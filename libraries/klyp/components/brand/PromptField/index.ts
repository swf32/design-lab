// `InferMimeFromName` appears in public prop sigs (PromptFieldProps.inferType,
// Composer.inferType) — re-export it from the public surface so consumers
// never deep-import `./file-accept` (declaration-emit / portability risk,
// spec 2026-07-02 §11.5.10).
export type { InferMimeFromName } from './file-accept'
export * from './PromptField'

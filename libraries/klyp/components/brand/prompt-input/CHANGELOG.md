# prompt-input — changelog

## 2026-07-02 15:32 — drop-legacy-promptinput-shim-dropzone-drag-contract

- What: Deleted the legacy `PromptInput` compound shim (`prompt-input.tsx` — a re-export of the ai-elements chassis, itself deleted in the same pass), `prompt-input-drop-zone.tsx` (+`.scss`), `drag-contract.ts`, `prompt-input.scss` and `prompt-input.stories.tsx`; the module barrel and `@klyp/brand` barrel now export only the stable surface — `PromptAttachment`/`AssetAttachment`/`PromptFrameSlot`/`AssetAttachmentKind` types + `useAssetAttachments`. The drag MIME contract's single source is the app copy in `features/editor/components/library-drag-list.tsx`.
- Why: Phase-4 composer cleanup (spec 2026-07-02 §5) — the compound was a dead generation superseded by `PromptField`; grep confirmed 0 live consumers of the deleted exports (only the types + hook are imported: 5 + 2 consumers).

## 2026-06-29 04:23 — remove-promptinputselect-family

- What: Removed the `PromptInputSelect*` subcomponent family from the public exports (both `index.ts` and `prompt-input.tsx`): `PromptInputSelect`, `PromptInputSelectContent`, `PromptInputSelectItem`, `PromptInputSelectTrigger`, `PromptInputSelectValue` and their prop types are no longer exported.
- Why: Catchup — multi-session DS work (unified Dropdown migration, Modal surface system, attachment/filetypes extraction, Studio token top-up, icon de-circling, WCAG/APCA + token swaps) landed without per-component CHANGELOG entries; logging each artifact's real change to bring its log current with the code as of 2026-06-29.

## 2026-06-17 16:03 — control-height-36-to-40 (DS baseline)

- What: clear icon-button square (asset-attachments-display) 36×36 → 40×40.
- Why: DS-wide control-height baseline bump 36→40 (`control.size.lg`; see @klyp/tokens CHANGELOG). The attachments-row clear button is an lg icon-button; bumped to 40px to match sibling controls.
